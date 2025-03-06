'use server';

import { auth } from '@/lib/auth';
import { createStreamableValue } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';
import { requestDocument } from './document';
import { streamText } from 'ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 문서 요청 감지 결과 인터페이스
interface DocumentRequestDetection {
  isDocumentRequest: boolean;
  documentType?: string;
  documentTypeName?: string;
  requiredInfo?: string[];
}

/**
 * 메시지 전송 및 AI 응답 생성 Server Action
 * @param conversationId 대화 ID
 * @param message 사용자 메시지
 * @returns 스트림 객체
 */
export async function sendMessage(conversationId: string, message: string) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  try {
    // 사용자 메시지 저장
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        conversationId,
        userId,
      },
    });

    // 대화 내역 가져오기
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    // 스트림 생성
    const stream = createStreamableValue();

    // 비동기 함수로 AI 응답 생성 및 스트림 업데이트
    (async () => {
      try {
        // 대화 내용을 OpenAI 메시지 형식으로 변환
        const messages: ChatMessage[] = conversation.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // 1. 사용자 의도 파악 (문서 생성 요청인지 확인)
        const documentRequestDetection = await detectDocumentRequest(messages);

        // 2. 사용자 의도에 따른 처리
        if (documentRequestDetection.isDocumentRequest) {
          // 문서 생성 요청인 경우
          const { documentType, documentTypeName, requiredInfo } = documentRequestDetection;

          if (!documentType) {
            // 문서 유형을 파악할 수 없는 경우
            const response =
              '어떤 종류의 법률 문서를 작성하고 싶으신가요? (예: 임대차 계약서, 합의서, 위임장 등)';
            stream.update(response);

            // 응답 저장
            await prisma.message.create({
              data: {
                content: response,
                role: 'assistant',
                conversationId,
                userId,
              },
            });

            stream.done();
            return;
          }

          // 2-1. 필요한 정보가 부족한 경우 추가 정보 요청
          if (requiredInfo && requiredInfo.length > 0) {
            // 필요한 정보를 요청하는 메시지 생성
            let infoRequestMessage = `${documentTypeName} 작성을 위해 다음 정보가 필요합니다:\n\n`;
            requiredInfo.forEach(info => {
              infoRequestMessage += `- ${info}\n`;
            });
            infoRequestMessage += '\n위 정보를 제공해주시면 문서 작성을 진행하겠습니다.';

            // 정보 요청 메시지를 스트림에 전송
            stream.update(infoRequestMessage);

            // 응답 저장
            await prisma.message.create({
              data: {
                content: infoRequestMessage,
                role: 'assistant',
                conversationId,
                userId,
              },
            });

            // 문서 요청 정보를 대화 메타데이터에 저장
            await prisma.conversation.update({
              where: { id: conversationId },
              data: {
                metadata: {
                  documentRequest: {
                    type: documentType,
                    requiredInfo,
                    status: 'pending_info',
                  },
                },
              },
            });

            stream.done();
          } else {
            // 2-2. 필요한 정보가 모두 있는 경우 문서 생성 시작
            // 문서 생성 시작 메시지
            const startMessage = `${documentTypeName} 문서 생성을 시작합니다. 잠시만 기다려주세요.`;
            stream.update(startMessage);

            // 응답 저장
            await prisma.message.create({
              data: {
                content: startMessage,
                role: 'assistant',
                conversationId,
                userId,
              },
            });

            // 문서 생성 요청
            try {
              // 대화 내용에서 파라미터 추출
              const parameters = await extractDocumentParameters(messages, documentType);

              // document.ts의 requestDocument 함수 호출
              await requestDocument(conversationId, documentType, parameters);

              // 문서 생성 진행 중 메시지 업데이트
              stream.update(
                `${startMessage}\n\n문서를 생성하고 있습니다. 완료되면 다운로드 링크가 제공됩니다.`
              );
            } catch (error: any) {
              console.error('문서 생성 요청 중 오류 발생:', error);
              stream.update(
                `${startMessage}\n\n문서 생성 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
              );
            }

            stream.done();
          }
        } else {
          // 일반 질문인 경우 기존 로직대로 처리
          // AI 응답 스트리밍
          const { textStream } = await streamText({
            model: openai('gpt-4-turbo'),
            system:
              '당신은 법률 전문가입니다. 사용자의 법률 관련 질문에 정확하고 도움이 되는 답변을 제공하세요.',
            messages,
          });

          let fullResponse = '';

          // 스트림에서 텍스트 읽기
          for await (const text of textStream) {
            fullResponse += text;
            stream.update(fullResponse);
          }

          // 응답이 완료되면 DB에 저장
          await prisma.message.create({
            data: {
              content: fullResponse,
              role: 'assistant',
              conversationId,
              userId,
            },
          });
        }

        // 대화 업데이트 시간 갱신
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        stream.done();
      } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        stream.error(new Error('AI 응답을 생성하는 중 오류가 발생했습니다.'));
      }
    })();

    return stream.value;
  } catch (error) {
    console.error('메시지 전송 중 오류 발생:', error);
    throw new Error('메시지를 전송하는 중 오류가 발생했습니다.');
  }
}

/**
 * 사용자 의도 파악 (문서 생성 요청인지 확인)
 * @param messages 대화 메시지
 * @returns 문서 요청 감지 결과
 */
async function detectDocumentRequest(messages: ChatMessage[]): Promise<DocumentRequestDetection> {
  try {
    // 기본 응답 객체
    const defaultResponse: DocumentRequestDetection = {
      isDocumentRequest: false,
      documentTypeName: undefined,
    };

    // 마지막 메시지 확인
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return defaultResponse;
    }

    // 간단한 키워드 기반 감지
    const content = lastMessage.content.toLowerCase();

    // 문서 생성 요청 키워드 확인
    const isDocumentRequest =
      content.includes('계약서') ||
      content.includes('작성해') ||
      content.includes('만들어') ||
      content.includes('위임장') ||
      content.includes('합의서');

    if (!isDocumentRequest) {
      return defaultResponse;
    }

    // 문서 유형 감지
    let documentType: string | undefined;
    let documentTypeName: string | undefined;
    let requiredInfo: string[] | undefined;

    if (content.includes('임대차') || content.includes('계약서')) {
      documentType = 'lease';
      documentTypeName = '임대차 계약서';
      requiredInfo = ['임대인', '임차인', '주소', '보증금', '월세', '계약기간'];
    } else if (content.includes('합의서')) {
      documentType = 'agreement';
      documentTypeName = '합의서';
      requiredInfo = ['갑', '을', '합의사항', '합의일자'];
    } else if (content.includes('위임장')) {
      documentType = 'power_of_attorney';
      documentTypeName = '위임장';
      requiredInfo = [
        '위임인',
        '위임인주소',
        '위임인연락처',
        '수임인',
        '수임인주소',
        '수임인연락처',
        '위임사항',
        '위임기간',
      ];
    }

    return {
      isDocumentRequest,
      documentType,
      documentTypeName,
      requiredInfo,
    };
  } catch (error) {
    console.error('사용자 의도 파악 중 오류 발생:', error);
    return { isDocumentRequest: false };
  }
}

/**
 * 대화 내용에서 문서 파라미터 추출
 * @param messages 대화 메시지
 * @param documentType 문서 유형
 * @returns 추출된 파라미터
 */
async function extractDocumentParameters(
  messages: ChatMessage[],
  documentType: string
): Promise<Record<string, any>> {
  try {
    // 문서 유형에 따른 기본 파라미터 정의
    const defaultParameters: Record<string, any> = {
      lease: {
        임대인: '홍길동',
        임차인: '김철수',
        주소: '서울시 강남구 테헤란로 123',
        보증금: '5000만원',
        월세: '50만원',
        계약기간: '2024년 5월 1일 ~ 2026년 4월 30일',
      },
      agreement: {
        갑: '홍길동',
        을: '김철수',
        합의사항: '갑은 을에게 1000만원을 지급하고, 을은 갑에게 더 이상의 청구를 하지 않는다.',
        합의일자: '2024년 5월 1일',
      },
      power_of_attorney: {
        위임인: '홍길동',
        위임인주소: '서울시 강남구 테헤란로 123',
        위임인연락처: '010-1234-5678',
        수임인: '김변호사',
        수임인주소: '서울시 서초구 법원로 456',
        수임인연락처: '010-8765-4321',
        위임사항: '부동산 매매 계약 체결에 관한 일체의 권한',
        위임기간: '2024년 5월 1일 ~ 2024년 12월 31일',
      },
    };

    // 대화 내용에서 파라미터 추출 (간단한 구현)
    const parameters = { ...defaultParameters[documentType] };

    // 대화 내용에서 값 추출 시도
    for (const message of messages) {
      if (message.role === 'user') {
        const content = message.content;

        // 각 파라미터에 대해 값 추출 시도
        for (const key of Object.keys(parameters)) {
          const regex = new RegExp(`${key}[:\\s]+(.*?)(?:\\n|$)`, 'i');
          const match = content.match(regex);
          if (match && match[1]) {
            parameters[key] = match[1].trim();
          }
        }
      }
    }

    return parameters;
  } catch (error) {
    console.error('파라미터 추출 중 오류 발생:', error);
    return {};
  }
}

/**
 * 문서 생성을 위한 추가 정보 제공 Server Action
 * @param conversationId 대화 ID
 * @param additionalInfo 추가 정보
 * @returns 스트림 객체
 */
export async function provideDocumentInfo(
  conversationId: string,
  additionalInfo: Record<string, string>
) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  try {
    // 1. 대화 메타데이터에서 문서 요청 정보 가져오기
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { metadata: true },
    });

    if (!conversation?.metadata) {
      throw new Error('문서 요청 정보를 찾을 수 없습니다.');
    }

    // 메타데이터를 객체로 변환
    const metadata = conversation.metadata as Record<string, any>;

    if (!metadata.documentRequest) {
      throw new Error('문서 요청 정보를 찾을 수 없습니다.');
    }

    const documentType = metadata.documentRequest.type as string;

    // 2. 제공된 정보를 메시지로 저장
    const infoMessage = Object.entries(additionalInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    await prisma.message.create({
      data: {
        content: infoMessage,
        role: 'user',
        conversationId,
        userId,
      },
    });

    // 3. 문서 생성 요청
    const documentRequest = await requestDocument(conversationId, documentType, additionalInfo);

    // 4. 문서 생성 상태를 스트림으로 반환
    const stream = createStreamableValue();
    stream.update(`${documentType} 문서 생성을 시작합니다. 잠시만 기다려주세요.`);

    // 5. 문서 생성 상태 업데이트 (비동기)
    (async () => {
      try {
        // 문서 생성 상태 주기적으로 확인
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
      } catch (error) {
        console.error('문서 생성 상태 확인 중 오류 발생:', error);
        stream.error(new Error('문서 생성 상태 확인 중 오류가 발생했습니다.'));
      }
    })();

    return stream.value;
  } catch (error) {
    console.error('문서 정보 제공 중 오류 발생:', error);
    throw new Error('문서 정보를 제공하는 중 오류가 발생했습니다.');
  }
}

/**
 * 대화 목록 조회 Server Action
 * @returns 사용자의 대화 목록
 */
export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  return prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * 특정 대화 조회 Server Action
 * @param conversationId 대화 ID
 * @returns 특정 대화 정보와 메시지 목록
 */
export async function getConversation(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

/**
 * AI 응답만 생성하는 Server Action (사용자 메시지는 이미 저장되어 있음)
 * @param conversationId 대화 ID
 * @returns 스트림 객체
 */
export async function generateAiResponse(conversationId: string) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  try {
    // 대화 내역 가져오기
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    // 스트림 생성
    const stream = createStreamableValue();

    // 비동기 함수로 AI 응답 생성 및 스트림 업데이트
    (async () => {
      try {
        // 대화 내용을 OpenAI 메시지 형식으로 변환
        const messages: ChatMessage[] = conversation.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // 사용자 의도 파악 (문서 생성 요청인지 확인)
        const documentRequestDetection = await detectDocumentRequest(messages);

        // 사용자 의도에 따른 처리
        if (documentRequestDetection.isDocumentRequest) {
          // 문서 생성 요청 처리 로직 (sendMessage 함수와 동일)
          // ...
          const { documentType, documentTypeName, requiredInfo } = documentRequestDetection;

          if (!documentType) {
            // 문서 유형을 파악할 수 없는 경우
            const response =
              '어떤 종류의 법률 문서를 작성하고 싶으신가요? (예: 임대차 계약서, 합의서, 위임장 등)';
            stream.update(response);

            // 응답 저장
            await prisma.message.create({
              data: {
                content: response,
                role: 'assistant',
                conversationId,
                userId,
              },
            });

            stream.done();
            return;
          }

          // 필요한 정보가 부족한 경우 추가 정보 요청
          if (requiredInfo && requiredInfo.length > 0) {
            // 필요한 정보를 요청하는 메시지 생성
            let infoRequestMessage = `${documentTypeName} 작성을 위해 다음 정보가 필요합니다:\n\n`;
            requiredInfo.forEach(info => {
              infoRequestMessage += `- ${info}\n`;
            });
            infoRequestMessage += '\n위 정보를 제공해주시면 문서 작성을 진행하겠습니다.';

            // 정보 요청 메시지를 스트림에 전송
            stream.update(infoRequestMessage);

            // 응답 저장
            await prisma.message.create({
              data: {
                content: infoRequestMessage,
                role: 'assistant',
                conversationId,
                userId,
              },
            });

            // 문서 요청 정보를 대화 메타데이터에 저장
            await prisma.conversation.update({
              where: { id: conversationId },
              data: {
                metadata: {
                  documentRequest: {
                    type: documentType,
                    requiredInfo,
                    status: 'pending_info',
                  },
                },
              },
            });

            stream.done();
          } else {
            // 필요한 정보가 모두 있는 경우 문서 생성 시작
            // 문서 생성 시작 메시지
            const startMessage = `${documentTypeName} 문서 생성을 시작합니다. 잠시만 기다려주세요.`;
            stream.update(startMessage);

            // 응답 저장
            await prisma.message.create({
              data: {
                content: startMessage,
                role: 'assistant',
                conversationId,
                userId,
              },
            });

            // 문서 생성 요청
            try {
              // 대화 내용에서 파라미터 추출
              const parameters = await extractDocumentParameters(messages, documentType);

              // document.ts의 requestDocument 함수 호출
              await requestDocument(conversationId, documentType, parameters);

              // 문서 생성 진행 중 메시지 업데이트
              stream.update(
                `${startMessage}\n\n문서를 생성하고 있습니다. 완료되면 다운로드 링크가 제공됩니다.`
              );
            } catch (error: any) {
              console.error('문서 생성 요청 중 오류 발생:', error);
              stream.update(
                `${startMessage}\n\n문서 생성 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
              );
            }

            stream.done();
          }
        } else {
          // 일반 질문인 경우 기존 로직대로 처리
          // AI 응답 스트리밍
          const { textStream } = await streamText({
            model: openai('gpt-4-turbo'),
            system:
              '당신은 법률 전문가입니다. 사용자의 법률 관련 질문에 정확하고 도움이 되는 답변을 제공하세요.',
            messages,
          });

          let fullResponse = '';

          // 스트림에서 텍스트 읽기
          for await (const text of textStream) {
            fullResponse += text;
            stream.update(fullResponse);
          }

          // 응답이 완료되면 DB에 저장
          await prisma.message.create({
            data: {
              content: fullResponse,
              role: 'assistant',
              conversationId,
              userId,
            },
          });
        }

        // 대화 업데이트 시간 갱신
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        stream.done();
      } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        stream.error(new Error('AI 응답을 생성하는 중 오류가 발생했습니다.'));
      }
    })();

    return stream.value;
  } catch (error) {
    console.error('AI 응답 생성 중 오류 발생:', error);
    throw new Error('AI 응답을 생성하는 중 오류가 발생했습니다.');
  }
}
