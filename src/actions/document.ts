'use server';

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getFileUrl, uploadFile } from '@/lib/s3-utils';

import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { createStreamableValue } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { streamText } from 'ai';

/**
 * 문서 생성 요청 Server Action
 * @param conversationId 대화 ID
 * @param documentType 문서 유형
 * @param parameters 문서 생성에 필요한 파라미터
 * @returns 문서 요청 객체
 */
export async function requestDocument(
  conversationId: string,
  documentType: string,
  parameters: Prisma.InputJsonValue
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  try {
    // 문서 요청 생성
    const documentRequest = await prisma.documentRequest.create({
      data: {
        documentType,
        status: 'processing',
        parameters,
        conversationId,
        userId,
      },
    });

    // 비동기 문서 생성 프로세스 시작
    processDocumentGeneration(documentRequest.id);

    revalidatePath(`/ai/${conversationId}`);
    return documentRequest;
  } catch (error) {
    console.error('문서 요청 생성 중 오류 발생:', error);
    throw new Error('문서 요청을 생성하는 중 오류가 발생했습니다.');
  }
}

/**
 * 문서 생성 상태 확인 Server Action
 * @param documentRequestId 문서 요청 ID
 * @returns 문서 요청 상태
 */
export async function getDocumentStatus(documentRequestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  try {
    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId },
    });

    if (!documentRequest) throw new Error('문서 요청을 찾을 수 없습니다.');

    return {
      status: documentRequest.status,
      fileUrl: documentRequest.fileUrl,
    };
  } catch (error) {
    console.error('문서 상태 확인 중 오류 발생:', error);
    throw new Error('문서 상태를 확인하는 중 오류가 발생했습니다.');
  }
}

/**
 * 문서 생성 프로세스 (비동기 처리)
 * @param documentRequestId 문서 요청 ID
 */
async function processDocumentGeneration(documentRequestId: string) {
  try {
    // 문서 요청 정보 가져오기
    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!documentRequest) throw new Error('문서 요청을 찾을 수 없습니다.');

    // 문서 템플릿 가져오기
    const template = await getDocumentTemplate(documentRequest.documentType);

    // OpenAI를 사용하여 템플릿 채우기
    const filledTemplate = await fillDocumentTemplate(
      template,
      documentRequest.parameters || {},
      documentRequest.conversation.messages
    );

    // PDF 또는 Word 파일 생성
    const fileUrl = await generateDocumentFile(filledTemplate, documentRequest.documentType);

    // 문서 요청 상태 업데이트
    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: {
        status: 'completed',
        fileUrl,
      },
    });

    // 대화에 문서 생성 완료 메시지 추가
    await prisma.message.create({
      data: {
        content: `문서 생성이 완료되었습니다. [다운로드 링크](${fileUrl})`,
        role: 'assistant',
        conversationId: documentRequest.conversationId,
        userId: documentRequest.userId,
      },
    });

    // 캐시 갱신
    revalidatePath(`/ai/${documentRequest.conversationId}`);
  } catch (error) {
    console.error('문서 생성 중 오류 발생:', error);

    // 문서 요청 상태 업데이트: 실패
    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { status: 'failed' },
    });
  }
}

/**
 * 문서 템플릿 가져오기
 * @param documentType 문서 유형
 * @returns 문서 템플릿
 */
async function getDocumentTemplate(documentType: string) {
  // 문서 유형에 따른 템플릿 반환
  interface DocumentTemplate {
    title: string;
    content?: string;
    sections?: Array<{
      title: string;
      content?: string;
      fields?: string[];
    }>;
  }

  const templates: Record<string, DocumentTemplate> = {
    lease: {
      title: '임대차 계약서',
      sections: [
        {
          title: '계약 당사자',
          fields: ['임대인', '임차인'],
        },
        {
          title: '계약 내용',
          fields: ['보증금', '월세', '계약기간', '주소'],
        },
      ],
    },
    agreement: {
      title: '합의서',
      sections: [
        {
          title: '당사자',
          fields: ['갑', '을'],
        },
        {
          title: '합의 내용',
          fields: ['합의사항', '합의일자'],
        },
      ],
    },
    power_of_attorney: {
      title: '위임장',
      sections: [
        {
          title: '위임인',
          fields: ['위임인', '주소', '연락처'],
        },
        {
          title: '수임인',
          fields: ['수임인', '주소', '연락처'],
        },
        {
          title: '위임 내용',
          fields: ['위임사항', '위임기간'],
        },
      ],
    },
  };

  return templates[documentType] || null;
}

/**
 * 문서 템플릿 채우기
 * @param template 문서 템플릿
 * @param parameters 사용자 제공 파라미터
 * @param messages 대화 메시지
 * @returns 채워진 템플릿
 */
async function fillDocumentTemplate(template: any, parameters: Prisma.JsonValue, messages: any[]) {
  if (!template) {
    throw new Error('템플릿을 찾을 수 없습니다.');
  }

  try {
    // OpenAI API 호출
    const { textStream } = await streamText({
      model: openai('gpt-4-turbo'),
      system:
        '당신은 법률 문서 작성 전문가입니다. 제공된 템플릿과 정보를 바탕으로 법률 문서를 작성하세요.',
      messages: [
        {
          role: 'user',
          content: `
            다음 템플릿을 채워주세요:
            ${JSON.stringify(template)}
            
            사용할 정보:
            ${JSON.stringify(parameters)}
            
            대화 내용:
            ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
          `,
        },
      ],
    });

    let filledContent = '';
    for await (const text of textStream) {
      filledContent += text;
    }

    return JSON.parse(filledContent);
  } catch (error) {
    console.error('템플릿 채우기 중 오류 발생:', error);
    throw new Error('템플릿을 채우는 중 오류가 발생했습니다.');
  }
}

/**
 * 문서 파일 생성
 *
 * 채워진 템플릿을 기반으로 PDF 문서를 생성하고 S3에 업로드합니다.
 *
 * @param filledTemplate 채워진 템플릿
 * @param documentType 문서 유형
 * @returns 생성된 파일 URL
 */
async function generateDocumentFile(filledTemplate: any, documentType: string) {
  try {
    // PDF 문서 생성
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // 제목 추가
    page.drawText(filledTemplate.title, {
      x: width / 2 - 150,
      y: height - 50,
      size: 20,
      font: timesRomanFont,
    });

    // 내용 추가 (섹션별로)
    let yPosition = height - 100;
    if (filledTemplate.sections) {
      for (const section of filledTemplate.sections) {
        page.drawText(section.title, {
          x: 50,
          y: yPosition,
          size: 14,
          font: timesRomanFont,
        });

        yPosition -= 30;

        if (section.content) {
          // 내용이 있는 경우 추가
          page.drawText(section.content, {
            x: 50,
            y: yPosition,
            size: 12,
            font: timesRomanFont,
          });

          yPosition -= 20;
        }
      }
    }

    // PDF를 바이트 배열로 저장
    const pdfBytes = await pdfDoc.save();

    // 파일 이름 생성 (고유한 이름)
    const fileName = `${documentType}_${Date.now()}.pdf`;

    // S3에 업로드
    const fileKey = await uploadFile(
      Buffer.from(pdfBytes),
      fileName,
      'application/pdf',
      'legal-documents'
    );

    // 서명된 URL 생성 (24시간 유효)
    const fileUrl = await getFileUrl(fileKey, 86400);

    console.log(`문서 생성 완료: ${fileName}, URL: ${fileUrl}`);

    return fileUrl;
  } catch (error) {
    console.error('문서 파일 생성 중 오류 발생:', error);
    throw new Error('문서 파일을 생성하는 중 오류가 발생했습니다.');
  }
}

/**
 * 문서 생성 스트림 생성 Server Action
 * @param conversationId 대화 ID
 * @param documentType 문서 유형
 * @param parameters 문서 생성에 필요한 파라미터
 * @returns 스트림 객체
 */
export async function streamDocumentGeneration(
  conversationId: string,
  documentType: string,
  parameters: Prisma.InputJsonValue
) {
  const stream = createStreamableValue();

  try {
    // 문서 요청 생성
    const documentRequest = await requestDocument(conversationId, documentType, parameters);

    // 초기 메시지 전송
    stream.update(`${documentType} 문서 생성을 시작합니다. 잠시만 기다려주세요.`);

    // 비동기 상태 확인
    (async () => {
      try {
        let status = 'processing';
        while (status === 'processing') {
          await new Promise(resolve => setTimeout(resolve, 2000));

          const updatedRequest = await prisma.documentRequest.findUnique({
            where: { id: documentRequest.id },
            select: { status: true, fileUrl: true },
          });

          status = updatedRequest?.status || 'failed';

          if (status === 'completed' && updatedRequest?.fileUrl) {
            stream.update(`문서 생성이 완료되었습니다. [다운로드 링크](${updatedRequest.fileUrl})`);
            stream.done();
            break;
          } else if (status === 'failed') {
            stream.error(new Error('문서 생성에 실패했습니다.'));
            break;
          }
        }
      } catch {
        stream.error(new Error('문서 생성 상태 확인 중 오류가 발생했습니다.'));
      }
    })();

    return stream.value;
  } catch {
    stream.error(new Error('문서 생성 요청 중 오류가 발생했습니다.'));
    return stream.value;
  }
}
