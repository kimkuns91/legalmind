'use server';
/**
 * 채팅 기본 기능
 */

import { detectDocumentRequest, extractDocumentParameters } from './document-detection';
import { getDocumentStatus, requestDocument } from '@/actions/document';
import { safelyCloseStream, safelyErrorStream } from './utils';

import { ChatMessage } from './types';
import { auth } from '@/lib/auth';
import { createStreamableValue } from 'ai/rsc';
import { generateCaseLookupResponse } from './case-lookup';
import { initializeTemplates } from '@/templates';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';
import { streamText } from 'ai';

/**
 * 메시지 전송
 * @param conversationId 대화 ID
 * @param message 메시지 내용
 * @returns 전송 결과
 */
export async function sendMessage(conversationId: string, message: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    const userId = session.user.id;

    // 대화 존재 여부 확인
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    // 메시지 저장
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId,
        userId,
      },
    });

    // 대화 업데이트 시간 갱신
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // AI 응답 생성 시작
    generateAiResponse(conversationId).catch(error => {
      console.error('AI 응답 생성 중 오류:', error);
    });

    return { success: true };
  } catch (error) {
    console.error('메시지 전송 중 오류:', error);
    throw new Error('메시지를 전송하는 중 오류가 발생했습니다.');
  }
}

/**
 * AI 응답 생성
 * @param conversationId 대화 ID
 * @returns 스트림 객체
 */
export async function generateAiResponse(conversationId: string) {
  try {
    // 템플릿 초기화 (필요시)
    await initializeTemplates();

    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    const userId = session.user.id;

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
    const stream = createStreamableValue('');

    // 비동기 함수로 AI 응답 생성 및 스트림 업데이트
    (async () => {
      try {
        // 대화 내용을 OpenAI 메시지 형식으로 변환
        const messages: ChatMessage[] = conversation.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // 요청 유형 감지 (문서 요청 또는 판례 찾기)
        console.log('===== 요청 유형 감지 시작 =====');
        console.log('메시지 내용:', messages[messages.length - 1].content);
        const requestDetection = await detectDocumentRequest(messages);
        console.log('요청 유형 감지 결과:', JSON.stringify(requestDetection, null, 2));

        // 판례 찾기 요청인 경우
        if (requestDetection.isCaseLookup) {
          console.log('===== 판례 찾기 요청 감지됨 =====');
          console.log('검색 키워드:', requestDetection.caseKeywords);

          // 판례 검색 응답 생성
          const fullResponse = await generateCaseLookupResponse(
            messages,
            requestDetection.caseKeywords
          );

          // 응답 저장
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: fullResponse,
              conversationId,
              userId,
            },
          });

          // 대화 업데이트 시간 갱신
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });

          // 응답 스트리밍
          stream.update(fullResponse);
          safelyCloseStream(stream);
          return;
        }

        // 문서 요청인 경우
        if (requestDetection.isDocumentRequest) {
          console.log('===== 문서 요청 감지됨 =====');
          console.log('문서 유형:', requestDetection.documentType);
          console.log('문서 이름:', requestDetection.documentTypeName);

          // 문서 유형이 식별되지 않은 경우
          if (!requestDetection.documentType) {
            console.log('문서 유형이 식별되지 않음, 문서 유형 안내 메시지 전송');
            const response = `
문서 생성 요청을 해주셨군요. 어떤 종류의 법률 문서를 작성하고 싶으신가요?

다음과 같은 문서를 생성할 수 있습니다:
1. 임대차 계약서
2. 합의서
3. 위임장

원하시는 문서 유형을 알려주시면 필요한 정보를 안내해 드리겠습니다.
            `.trim();

            // 메시지 저장
            await prisma.message.create({
              data: {
                role: 'assistant',
                content: response,
                conversationId,
                userId,
              },
            });

            // 응답 스트리밍
            stream.update(response);
            safelyCloseStream(stream);
            return;
          }

          // 필요한 정보가 부족한 경우
          const documentType = requestDetection.documentType;
          const documentTypeName = requestDetection.documentTypeName || '법률 문서';

          // 파라미터 추출
          console.log('===== 파라미터 추출 시작 =====');
          try {
            const extractedParams = await extractDocumentParameters(
              messages,
              documentType as string
            );
            console.log('추출된 파라미터 결과:', JSON.stringify(extractedParams, null, 2));

            // 필요한 정보 중 누락된 정보 확인
            const missingInfo: string[] = [];

            try {
              // 템플릿 정보 가져오기
              console.log('템플릿 정보 가져오기 시작');
              const { DOCUMENT_TYPES } = await import('@/templates/types');
              const templateRegistry = (await import('@/templates')).default;

              if (Object.keys(DOCUMENT_TYPES).includes(documentType)) {
                const docTypeInfo = DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES];
                const template = await templateRegistry.getTemplate(documentType as any);

                console.log('템플릿 정보 로드 성공:', documentType);
                console.log('필수 파라미터:', docTypeInfo.requiredParams);

                // 필수 파라미터 검증
                for (const requiredParam of docTypeInfo.requiredParams) {
                  const engKey = template.schema.keyMapping[requiredParam];

                  // 한글 키 또는 영문 키로 파라미터 확인
                  if (!extractedParams[requiredParam] && !extractedParams[engKey]) {
                    missingInfo.push(requiredParam);
                    console.log(`누락된 파라미터 발견: ${requiredParam} (영문키: ${engKey})`);
                  } else {
                    console.log(
                      `파라미터 확인 성공: ${requiredParam} = ${extractedParams[requiredParam] || extractedParams[engKey]}`
                    );
                  }
                }
              } else {
                console.error(`유효하지 않은 문서 유형: ${documentType}`);
                // 폴백 로직은 catch 블록에서 처리
              }
            } catch (error) {
              console.error('필수 파라미터 검증 중 오류:', error);

              // 오류 발생 시 기본 문서 유형 정보 사용
              try {
                // 기본 문서 유형 정보 가져오기
                const { DOCUMENT_TYPES } = await import('@/templates/types');

                if (Object.keys(DOCUMENT_TYPES).includes(documentType)) {
                  const docTypeInfo = DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES];

                  // 필수 파라미터 검증
                  for (const requiredParam of docTypeInfo.requiredParams) {
                    // 영문 키는 알 수 없으므로 한글 키만 확인
                    if (!extractedParams[requiredParam]) {
                      missingInfo.push(requiredParam);
                      console.log(`누락된 파라미터 발견(폴백): ${requiredParam}`);
                    } else {
                      console.log(
                        `파라미터 확인 성공(폴백): ${requiredParam} = ${extractedParams[requiredParam]}`
                      );
                    }
                  }
                } else {
                  console.error(`알 수 없는 문서 유형: ${documentType}`);
                }
              } catch (fallbackError) {
                console.error('기본 문서 유형 정보 사용 중 오류:', fallbackError);
              }
            }

            console.log('누락된 정보 목록:', missingInfo);

            if (missingInfo.length > 0) {
              console.log('===== 누락된 정보 요청 메시지 전송 =====');
              // 누락된 정보 요청 메시지 생성
              const missingInfoList = missingInfo.map(info => `- ${info}`).join('\n');
              const response = `
${documentTypeName} 작성을 위해 다음 정보가 필요합니다:

${missingInfoList}

위 정보를 입력해 주시면 ${documentTypeName}를 생성해 드리겠습니다.
              `.trim();

              // 메시지 저장
              await prisma.message.create({
                data: {
                  role: 'assistant',
                  content: response,
                  conversationId,
                  userId,
                },
              });

              // 응답 스트리밍
              stream.update(response);
              safelyCloseStream(stream);
              return;
            }

            // 모든 필요한 정보가 있는 경우 문서 생성 요청
            console.log('===== 문서 생성 요청 시작 =====');
            try {
              const documentRequest = await requestDocument(
                conversationId,
                documentType,
                extractedParams
              );

              console.log('문서 생성 요청 성공, 요청 ID:', documentRequest.id);

              // 문서 생성 중 메시지
              const processingMessage = `${documentTypeName}를 생성하고 있습니다. 잠시만 기다려주세요...`;
              stream.update(processingMessage);

              // 문서 생성 상태 확인 (폴링)
              const checkInterval = 2000; // 2초마다 확인
              const maxAttempts = 30; // 최대 60초(30회) 대기
              let attempts = 0;

              const checkStatus = async () => {
                if (attempts >= maxAttempts) {
                  const timeoutMessage =
                    '문서 생성이 예상보다 오래 걸리고 있습니다. 잠시 후 다시 확인해 주세요.';
                  await prisma.message.create({
                    data: {
                      role: 'assistant',
                      content: timeoutMessage,
                      conversationId,
                      userId,
                    },
                  });

                  stream.update(processingMessage + '\n\n' + timeoutMessage);
                  safelyCloseStream(stream);
                  return;
                }

                attempts++;

                try {
                  const status = await getDocumentStatus(documentRequest.id);
                  console.log(`문서 상태 확인 (${attempts}/${maxAttempts}):`, status);

                  if (status.status === 'completed' && status.fileUrl) {
                    // 이미 완료 메시지가 있는지 확인
                    const existingCompletionMessage = await prisma.message.findFirst({
                      where: {
                        conversationId,
                        role: 'assistant',
                        content: {
                          contains: '다운로드 링크',
                        },
                        createdAt: {
                          // 최근 1분 이내 생성된 메시지만 확인
                          gte: new Date(Date.now() - 60000),
                        },
                      },
                    });

                    // 이미 완료 메시지가 있으면 새 메시지를 생성하지 않음
                    if (existingCompletionMessage) {
                      console.log(
                        '이미 문서 생성 완료 메시지가 있습니다. 중복 메시지를 생성하지 않습니다.'
                      );
                      stream.update(existingCompletionMessage.content);

                      // 클라이언트가 메시지를 처리할 시간을 주기 위해 지연 후 스트림 종료
                      setTimeout(() => {
                        safelyCloseStream(stream);
                      }, 1000);

                      return;
                    }

                    const completionMessage = `
${documentTypeName} 생성이 완료되었습니다.

다음 링크에서 다운로드하실 수 있습니다:
[다운로드 링크](${status.fileUrl})
                    `.trim();

                    // 완료 메시지를 DB에 저장
                    await prisma.message.create({
                      data: {
                        role: 'assistant',
                        content: completionMessage,
                        conversationId,
                        userId,
                      },
                    });

                    // 대화 업데이트 시간 갱신
                    await prisma.conversation.update({
                      where: { id: conversationId },
                      data: { updatedAt: new Date() },
                    });

                    // 스트림 업데이트 및 종료
                    console.log('문서 생성 완료 메시지를 스트림으로 전송:', completionMessage);
                    stream.update(completionMessage);

                    // 클라이언트가 메시지를 처리할 시간을 주기 위해 지연 후 스트림 종료
                    setTimeout(() => {
                      safelyCloseStream(stream);
                    }, 1000);

                    return;
                  } else if (status.status === 'failed') {
                    safelyErrorStream(stream, new Error('문서 생성에 실패했습니다.'));
                    return;
                  }
                } catch (error) {
                  console.error('문서 상태 확인 중 오류:', error);
                  setTimeout(checkStatus, checkInterval);
                }
              };

              // 첫 번째 상태 확인 시작
              setTimeout(checkStatus, checkInterval);
            } catch (error) {
              console.error('문서 생성 요청 중 오류:', error);

              // 오류 메시지
              const errorMessage = '문서 생성 요청 중 오류가 발생했습니다. 다시 시도해 주세요.';

              // 메시지 저장
              await prisma.message.create({
                data: {
                  role: 'assistant',
                  content: errorMessage,
                  conversationId,
                  userId,
                },
              });

              // 오류 응답 스트리밍
              stream.update(errorMessage);
              safelyCloseStream(stream);
              return;
            }
          } catch (error) {
            console.error('파라미터 추출 중 오류:', error);
            const errorMessage =
              '문서 생성에 필요한 정보를 추출하는 중 오류가 발생했습니다. 다시 시도해 주세요.';

            // 메시지 저장
            await prisma.message.create({
              data: {
                role: 'assistant',
                content: errorMessage,
                conversationId,
                userId,
              },
            });

            // 오류 응답 스트리밍
            stream.update(errorMessage);
            safelyCloseStream(stream);
            return;
          }
        } else {
          console.log('===== 일반 질문으로 감지됨 =====');
          // 일반 질문인 경우 기존 로직 사용
          const { textStream } = await streamText({
            model: openai('gpt-4o'),
            system: `
당신은 법률 상담 AI 비서입니다. 사용자의 법률 질문에 친절하고 정확하게 답변해주세요.
한국 법률에 기반하여 답변하되, 법률 조언이 아닌 법률 정보를 제공한다는 점을 명시하세요.
답변은 한국어로 제공하며, 전문 용어는 가능한 쉽게 설명해주세요.
마크다운 형식을 사용하여 표, 코드블록, 볼드체 등 다양한 포맷을 활용해 답변하세요.
            `.trim(),
            messages,
          });

          // AI 응답 저장
          let fullResponse = '';
          for await (const text of textStream) {
            fullResponse += text;
            stream.update(fullResponse);
          }

          // 응답 저장
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: fullResponse,
              conversationId,
              userId,
            },
          });

          // 대화 업데이트 시간 갱신
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });

          safelyCloseStream(stream);
          return;
        }
      } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        // 스트림에 에러 전달 시도
        safelyErrorStream(stream, new Error('AI 응답을 생성하는 중 오류가 발생했습니다.'));
        return;
      }
    })();

    return stream.value;
  } catch (error) {
    console.error('AI 응답 생성 중 오류 발생:', error);
    throw new Error('AI 응답을 생성하는 중 오류가 발생했습니다.');
  }
}

/**
 * 대화 목록 조회
 * @returns 대화 목록
 */
export async function getConversations() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations;
  } catch (error) {
    console.error('대화 목록 조회 중 오류:', error);
    throw new Error('대화 목록을 조회하는 중 오류가 발생했습니다.');
  }
}

/**
 * 대화 및 메시지 조회
 * @param conversationId 대화 ID
 * @returns 대화 및 메시지
 */
export async function getConversationWithMessages(conversationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    return conversation;
  } catch (error) {
    console.error('대화 조회 중 오류:', error);
    throw new Error('대화를 조회하는 중 오류가 발생했습니다.');
  }
}

/**
 * 문서 생성을 위한 추가 정보 제공
 * @param conversationId 대화 ID
 * @param additionalInfo 추가 정보
 * @returns 처리 결과
 */
export async function provideDocumentInfo(
  conversationId: string,
  additionalInfo: Record<string, string>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    const userId = session.user.id;

    // 대화 존재 여부 확인
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    // 마지막 메시지가 AI의 정보 요청인지 확인
    const lastMessage = conversation.messages[0];
    if (
      !lastMessage ||
      lastMessage.role !== 'assistant' ||
      !lastMessage.content.includes('필요합니다')
    ) {
      throw new Error('추가 정보 제공이 필요한 상태가 아닙니다.');
    }

    // 추가 정보를 메시지로 저장
    const infoMessage = Object.entries(additionalInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    await prisma.message.create({
      data: {
        role: 'user',
        content: infoMessage,
        conversationId,
        userId,
      },
    });

    // 대화 업데이트 시간 갱신
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // AI 응답 생성 시작
    generateAiResponse(conversationId).catch(error => {
      console.error('AI 응답 생성 중 오류:', error);
    });

    return { success: true };
  } catch (error) {
    console.error('추가 정보 제공 중 오류:', error);
    throw new Error('추가 정보를 제공하는 중 오류가 발생했습니다.');
  }
}
