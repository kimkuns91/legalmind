'use server';

/**
 * 판례 찾기 관련 기능
 */

import { ChatMessage } from './types';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

/**
 * 판례 찾기 응답 생성
 * @param messages 대화 메시지 목록
 * @param keywords 검색 키워드
 * @returns 생성된 응답 텍스트
 */
export async function generateCaseLookupResponse(
  messages: ChatMessage[],
  keywords: string[] = []
): Promise<string> {
  console.log('판례 찾기 응답 생성 시작');
  console.log('검색 키워드:', keywords);

  // 판례 검색 프롬프트 구성
  const keywordsText =
    keywords.length > 0
      ? `특히 다음 키워드와 관련된 판례를 중점적으로 찾아주세요: ${keywords.join(', ')}`
      : '';

  const { textStream } = await streamText({
    model: openai('gpt-4o'),
    system: `
당신은 법률 판례 검색 전문가입니다. 사용자의 질문에 관련된 한국 법원의 판례를 찾아 요약해서 제공해주세요.
판례를 제공할 때는 다음 형식을 따라주세요:

## 관련 판례 목록
1. [판례 번호 및 선고일] - 판례 제목
   - 주요 쟁점: 판례의 핵심 쟁점
   - 판결 요지: 판결의 핵심 내용 요약
   - 시사점: 이 판례가 가지는 법적 의미나 유사 사례에 대한 적용 가능성

2. [판례 번호 및 선고일] - 판례 제목
   ...

## 법률적 해석
위 판례들을 종합적으로 고려할 때, 사용자의 질문에 대한 법률적 해석을 제공해주세요.

## 주의사항
이 정보는 법률 정보 제공 목적이며, 구체적인 법률 조언은 변호사와 상담하시기 바랍니다.

${keywordsText}
    `,
    messages,
  });

  // AI 응답 저장
  let fullResponse = '';
  for await (const text of textStream) {
    fullResponse += text;
  }

  console.log('판례 찾기 응답 생성 완료');
  return fullResponse;
}
