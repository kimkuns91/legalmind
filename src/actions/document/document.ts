'use server';

import { DocumentRequest, Prisma } from '@prisma/client';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getGeneratedDocPath, getSignedFileUrl, uploadFileToS3 } from '@/lib/s3';

import Handlebars from 'handlebars';
import { auth } from '@/lib/auth';
import { createStreamableValue } from 'ai/rsc';
import { initializeTemplates } from '@/templates';
import { prisma } from '@/lib/prisma';

/**
 * 문서 생성 요청
 * @param conversationId 대화 ID
 * @param documentType 문서 유형
 * @param parameters 문서 파라미터
 * @returns 생성된 문서 요청 정보
 */
export async function requestDocument(
  conversationId: string,
  documentType: string,
  parameters: Record<string, any>
): Promise<DocumentRequest> {
  try {
    // 템플릿 초기화 (필요시)
    await initializeTemplates();

    console.log('문서 생성 시작:', '유형=' + documentType, '대화ID=' + conversationId);

    // 세션 확인
    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    const userId = session.user.id;

    // 문서 요청 생성
    const documentRequest = await prisma.documentRequest.create({
      data: {
        documentType,
        parameters: parameters as Prisma.InputJsonValue,
        status: 'pending',
        conversationId,
        userId,
      },
    });

    console.log('문서 요청 생성 완료:', documentRequest.id);

    // 백그라운드 작업으로 문서 생성 처리
    processDocumentGeneration(documentRequest.id).catch(error => {
      console.error('문서 생성 처리 중 오류:', error);
    });

    return documentRequest;
  } catch (error) {
    console.error('문서 요청 생성 중 오류:', error);
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
 * 문서 생성 처리 (백그라운드 작업)
 * @param documentRequestId 문서 요청 ID
 */
export async function processDocumentGeneration(documentRequestId: string): Promise<void> {
  console.log(`문서 생성 처리 시작 (요청 ID: ${documentRequestId})`);

  try {
    // 템플릿 초기화 (필요시)
    await initializeTemplates();

    // 문서 요청 정보 조회
    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId },
    });

    if (!documentRequest) {
      console.error(`문서 요청을 찾을 수 없음: ${documentRequestId}`);
      return;
    }

    // 문서 요청 상태 업데이트
    await updateDocumentStatus(documentRequestId, 'processing');

    try {
      // 템플릿 가져오기
      const templateRegistry = (await import('@/templates')).default;
      const template = await templateRegistry.getTemplate(documentRequest.documentType as any);

      // 템플릿 채우기
      console.log('템플릿 채우기 시작:', documentRequest.documentType);
      console.log('파라미터:', JSON.stringify(documentRequest.parameters, null, 2));

      const filledTemplate = await fillDocumentTemplate(
        documentRequest.documentType,
        documentRequest.parameters
      );

      // PDF 생성 및 S3 업로드
      console.log('PDF 생성 및 업로드 시작');
      const fileUrl = await generateDocumentFile(
        documentRequest.documentType,
        filledTemplate.html,
        documentRequest.id
      );

      // 문서 요청 상태 업데이트
      await updateDocumentStatus(documentRequestId, 'completed', fileUrl);

      // 완료 메시지 추가
      try {
        await prisma.message.create({
          data: {
            content: `${template.typeName} 생성이 완료되었습니다.\n\n다음 링크에서 다운로드하실 수 있습니다:\n[다운로드 링크](${fileUrl})`,
            role: 'assistant',
            conversationId: documentRequest.conversationId,
            userId: documentRequest.userId,
          },
        });
      } catch (messageError) {
        console.error('완료 메시지 추가 실패:', messageError);
        // 메시지 추가 실패는 전체 프로세스 실패로 간주하지 않음
      }
    } catch (error) {
      console.error(`문서 생성 중 오류: ${documentRequestId}`, error);

      // 오류 메시지 추가
      try {
        await prisma.message.create({
          data: {
            content: '문서 생성 중 오류가 발생했습니다. 다시 시도해 주세요.',
            role: 'assistant',
            conversationId: documentRequest.conversationId,
            userId: documentRequest.userId,
          },
        });
      } catch (messageError) {
        console.error('오류 메시지 추가 실패:', messageError);
      }

      // 문서 요청 상태 업데이트
      await updateDocumentStatus(documentRequestId, 'failed');
    }
  } catch (error) {
    console.error(`문서 생성 처리 중 오류: ${documentRequestId}`, error);
    // 문서 요청 상태 업데이트 시도
    try {
      await updateDocumentStatus(documentRequestId, 'failed');
    } catch (updateError) {
      console.error('상태 업데이트 실패:', updateError);
    }
  }
}

/**
 * 문서 요청 상태 업데이트 헬퍼 함수
 */
async function updateDocumentStatus(
  documentRequestId: string,
  status: 'processing' | 'completed' | 'failed',
  fileUrl?: string
) {
  try {
    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: {
        status,
        ...(fileUrl && { fileUrl }),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`문서 상태 업데이트 실패 (${documentRequestId}, ${status}):`, error);
    throw error;
  }
}

/**
 * 템플릿 채우기
 * @param documentType 문서 유형
 * @param parameters 파라미터
 * @returns 채워진 템플릿
 */
async function fillDocumentTemplate(
  documentType: string,
  parameters: Record<string, any> | Prisma.JsonValue
): Promise<{ html: string; data: Record<string, any> }> {
  try {
    console.log('템플릿 채우기 시작:', documentType);
    console.log('템플릿 파라미터:', JSON.stringify(parameters, null, 2));

    // 템플릿 레지스트리에서 템플릿 조회
    const templateRegistry = (await import('@/templates')).default;
    const template = await templateRegistry.getTemplate(documentType as any);

    // 템플릿 데이터 준비 함수 사용
    const templateData = template.prepareTemplateData(parameters as Record<string, any>);
    console.log('준비된 템플릿 데이터:', JSON.stringify(templateData, null, 2));

    // Handlebars로 템플릿 렌더링
    const compiledTemplate = Handlebars.compile(template.htmlTemplate);
    const filledHtml = compiledTemplate(templateData);

    return {
      html: filledHtml,
      data: templateData,
    };
  } catch (error) {
    console.error('템플릿 채우기 중 오류:', error);
    throw new Error('템플릿을 채우는 중 오류가 발생했습니다.');
  }
}

/**
 * 문서 파일 생성 및 S3에 업로드
 * @param documentType 문서 유형
 * @param htmlContent 채워진 HTML 내용
 * @param requestId 요청 ID (파일명 생성용)
 * @returns 생성된 문서의 URL
 */
async function generateDocumentFile(
  documentType: string,
  htmlContent: string,
  requestId: string
): Promise<string> {
  try {
    console.log('문서 파일 생성 시작:', documentType);

    // PDF 생성
    let pdfBuffer;
    try {
      pdfBuffer = await generatePdfFromHtml({ htmlContent });
      console.log(`PDF 생성 완료: ${pdfBuffer.length} 바이트`);
    } catch (error: any) {
      console.error('PDF 생성 중 오류:', error);
      throw new Error(`PDF 생성 실패: ${error.message || '알 수 없는 오류'}`);
    }

    // 파일명 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${documentType}_${requestId}_${timestamp}.pdf`;
    const filePath = getGeneratedDocPath(documentType, fileName);

    // S3에 업로드
    try {
      await uploadFileToS3(filePath, pdfBuffer, 'application/pdf');
      console.log(`S3 업로드 완료: ${filePath}`);
    } catch (error: any) {
      console.error('S3 업로드 중 오류:', error);
      throw new Error(`S3 업로드 실패: ${error.message || '알 수 없는 오류'}`);
    }

    // 서명된 URL 생성
    try {
      const signedUrl = await getSignedFileUrl(filePath);
      console.log(`서명된 URL 생성 완료: ${signedUrl}`);
      return signedUrl;
    } catch (error: any) {
      console.error('서명된 URL 생성 중 오류:', error);
      throw new Error(`서명된 URL 생성 실패: ${error.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    console.error('문서 파일 생성 중 오류:', error);
    throw error;
  }
}

/**
 * HTML 템플릿에서 PDF 생성
 * @param template 템플릿 객체
 * @returns PDF 바이트 배열
 */
async function generatePdfFromHtml(template: any): Promise<Buffer> {
  try {
    // 템플릿 데이터 확인
    if (!template.htmlContent && !template.filledContent) {
      console.error('HTML 템플릿 내용이 없습니다.');
      return generateBasicPdf(template);
    }

    console.log('HTML 템플릿 처리 시작');

    // 이미 채워진 템플릿 내용이 있으면 그대로 사용
    if (template.filledContent) {
      console.log('이미 채워진 템플릿 내용 사용');
      const htmlContent = template.filledContent;

      console.log('HTML 템플릿 처리 완료, Puppeteer로 PDF 생성 시작');

      try {
        // 동적으로 puppeteer 가져오기 (서버 컴포넌트에서 사용하기 위함)
        const puppeteer = await import('puppeteer');

        // Puppeteer 브라우저 시작
        const browser = await puppeteer.default.launch({
          headless: true, // 'new' 대신 true 사용
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
          // 새 페이지 생성
          const page = await browser.newPage();

          // HTML 콘텐츠 설정
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

          // PDF 생성
          const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
          });

          // Uint8Array를 Buffer로 변환
          return Buffer.from(pdfBuffer);
        } finally {
          // 브라우저 닫기 (항상 실행)
          await browser.close();
        }
      } catch (puppeteerError) {
        console.error('Puppeteer로 PDF 생성 중 오류:', puppeteerError);
        console.log('Puppeteer 오류로 인해 기본 PDF 생성으로 대체');
        return generateBasicPdf(template);
      }
    }

    // 채워진 템플릿이 없는 경우 Handlebars로 처리
    try {
      const handlebarsTemplate = Handlebars.compile(template.htmlContent);

      // 템플릿에 적용할 데이터 준비
      let templateData: Record<string, any> = {};

      // 템플릿 데이터 확인 및 변환
      const documentType = template.type || template.id;
      const templateParams = template.data || {};

      console.log('문서 유형:', documentType);
      console.log('템플릿 파라미터:', JSON.stringify(templateParams, null, 2));

      try {
        // 템플릿 레지스트리를 통해 템플릿 가져오기
        const templateRegistry = (await import('@/templates')).default;
        const documentTemplate = await templateRegistry.getTemplate(documentType as any);

        // 템플릿의 prepareTemplateData 함수 사용
        templateData = documentTemplate.prepareTemplateData(templateParams);

        console.log('템플릿 데이터 준비 완료 (템플릿 시스템 사용)');
      } catch (error) {
        console.error('템플릿 시스템 사용 중 오류 발생:', error);
        console.log('기본 매핑 사용 (템플릿 데이터를 그대로 사용)');

        // 기본 매핑 (템플릿 데이터를 그대로 사용)
        templateData = { ...templateParams };
      }

      console.log('템플릿 데이터:', JSON.stringify(templateData, null, 2));
      const htmlContent = handlebarsTemplate(templateData);

      console.log('HTML 템플릿 처리 완료, Puppeteer로 PDF 생성 시작');

      // Puppeteer를 사용하여 HTML을 PDF로 변환
      try {
        // 동적으로 puppeteer 가져오기 (서버 컴포넌트에서 사용하기 위함)
        const puppeteer = await import('puppeteer');

        // Puppeteer 브라우저 시작
        const browser = await puppeteer.default.launch({
          headless: true, // 'new' 대신 true 사용
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
          // 새 페이지 생성
          const page = await browser.newPage();

          // HTML 콘텐츠 설정
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

          // PDF 생성
          const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
          });

          // Uint8Array를 Buffer로 변환
          return Buffer.from(pdfBuffer);
        } finally {
          // 브라우저 닫기 (항상 실행)
          await browser.close();
        }
      } catch (puppeteerError) {
        console.error('Puppeteer로 PDF 생성 중 오류:', puppeteerError);
        console.log('Puppeteer 오류로 인해 기본 PDF 생성으로 대체');
        return generateBasicPdf(template);
      }
    } catch (handlebarsError) {
      console.error('Handlebars 템플릿 처리 중 오류:', handlebarsError);
      console.log('Handlebars 오류로 인해 기본 PDF 생성으로 대체');
      return generateBasicPdf(template);
    }
  } catch (error) {
    console.error('HTML에서 PDF 생성 중 오류:', error);
    return generateBasicPdf(template);
  }
}

/**
 * 기본 PDF 문서 생성
 * @param template 템플릿 데이터
 * @returns PDF 바이트 배열
 */
async function generateBasicPdf(template: any): Promise<Buffer> {
  try {
    // PDF 문서 생성
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // 제목 페이지 추가
    const titlePage = pdfDoc.addPage();
    const { height } = titlePage.getSize();

    // 제목 추가
    titlePage.drawText(template.name || '문서', {
      x: 50,
      y: height - 100,
      size: 24,
      font,
    });

    // 섹션 추가
    if (template.sections && Array.isArray(template.sections)) {
      let y = height - 150;

      for (const section of template.sections) {
        // 새 페이지가 필요한지 확인
        if (y < 100) {
          pdfDoc.addPage();
          y = height - 50;
        }

        // 섹션 제목
        titlePage.drawText(section.title || '', {
          x: 50,
          y,
          size: 16,
          font,
        });
        y -= 30;

        // 섹션 내용
        const content = section.content || '';
        const lines = content.split('\n');

        for (const line of lines) {
          // 새 페이지가 필요한지 확인
          if (y < 100) {
            pdfDoc.addPage();
            y = height - 50;
          }

          titlePage.drawText(line, {
            x: 50,
            y,
            size: fontSize,
            font,
          });
          y -= 20;
        }

        y -= 20; // 섹션 간 여백
      }
    }

    // PDF를 바이트 배열로 직렬화
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('기본 PDF 생성 중 오류:', error);
    throw error;
  }
}

/**
 * 문서 생성 스트림 (클라이언트에서 직접 호출)
 * @param conversationId 대화 ID
 * @param documentType 문서 유형
 * @param parameters 문서 파라미터
 * @returns 스트림 객체
 */
export async function streamDocumentGeneration(
  conversationId: string,
  documentType: string,
  parameters: Prisma.InputJsonValue
) {
  try {
    console.log('문서 생성 스트림 시작:', documentType);

    // 세션 확인
    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    // 스트림 생성
    const stream = createStreamableValue('');

    // 비동기 함수로 문서 생성 및 스트림 업데이트
    (async () => {
      try {
        // 문서 요청 생성
        const documentRequest = await requestDocument(
          conversationId,
          documentType,
          parameters as unknown as Record<string, any>
        );

        // 상태 확인 루프
        let status = 'processing';
        let attempts = 0;
        const maxAttempts = 30; // 최대 60초 대기

        while (status === 'processing' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
          attempts++;

          const docStatus = await getDocumentStatus(documentRequest.id);
          status = docStatus.status;

          if (status === 'completed' && docStatus.fileUrl) {
            stream.update(`문서 생성 완료: ${docStatus.fileUrl}`);
            break;
          } else if (status === 'failed') {
            stream.error(new Error('문서 생성에 실패했습니다.'));
            break;
          }

          stream.update(`문서 생성 중... (${attempts}/${maxAttempts})`);
        }

        if (status === 'processing') {
          stream.error(new Error('문서 생성 시간이 초과되었습니다.'));
        }
      } catch (error: any) {
        console.error('문서 생성 스트림 중 오류:', error);
        stream.error(new Error(error.message || '문서 생성 중 오류가 발생했습니다.'));
      }
      // 스트림 종료는 필요하지 않음 (자동으로 처리됨)
    })();

    return stream.value;
  } catch (error: any) {
    console.error('문서 생성 스트림 초기화 중 오류:', error);
    throw new Error(error.message || '문서 생성을 시작하는 중 오류가 발생했습니다.');
  }
}
