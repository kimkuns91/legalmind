'use server';

/**
 * 문서 요청 감지 관련 기능
 */

import { ChatMessage, DocumentRequestDetection } from './types';
import { extractParametersWithAI, extractParametersWithRegex } from './parameter-extraction';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

/**
 * 문서 생성 요청 및 판례 찾기 요청 감지
 * @param messages 대화 메시지 목록
 * @returns 문서 요청 감지 결과
 */
export async function detectDocumentRequest(
  messages: ChatMessage[]
): Promise<DocumentRequestDetection> {
  try {
    const content = messages[messages.length - 1].content;
    console.log('요청 유형 감지 시작:', content);

    // 판례 찾기 키워드 및 패턴 정의
    const caseLookupKeywords = [
      '판례',
      '판결',
      '대법원',
      '사례',
      '선례',
      '법원',
      '판결문',
      '판시',
      '판결례',
      '판례 찾아',
      '판례 검색',
      '관련 판례',
      '유사 판례',
      '판례 알려',
    ];

    const caseLookupPatterns = [
      /판례\s*(?:찾|검색|조회|알려|알아)/i,
      /(?:관련|유사|비슷한)\s*판례/i,
      /대법원\s*판례/i,
      /판결문\s*(?:찾|검색|조회)/i,
      /(?:사건|소송)\s*(?:판례|판결)/i,
    ];

    // 판례 찾기 요청 감지
    const hasCaseLookupPattern = caseLookupPatterns.some(pattern => pattern.test(content));
    const hasCaseLookupKeyword = caseLookupKeywords.some(keyword => content.includes(keyword));

    if (hasCaseLookupPattern || hasCaseLookupKeyword) {
      console.log('판례 찾기 요청 감지됨');

      // 판례 키워드 추출 (간단한 구현)
      const keywords = content
        .replace(/판례|판결|대법원|사례|선례|법원|판결문|판시|판결례|찾아|검색|조회/g, '')
        .split(/\s+/)
        .filter(word => word.length > 1)
        .slice(0, 5); // 최대 5개 키워드

      return {
        isDocumentRequest: false,
        isCaseLookup: true,
        caseKeywords: keywords,
      };
    }

    // 직접적인 키워드 매칭으로 빠른 감지 시도
    const leaseKeywords = [
      '임대차',
      '계약서',
      '임대',
      '임차',
      '전세',
      '월세',
      '보증금',
      '집을 빌리',
    ];
    const agreementKeywords = ['합의서', '합의', '협의', '동의', '계약'];
    const poaKeywords = ['위임장', '위임', '대리', '권한', '수임'];

    // 임대차 계약서 키워드 확인 - 더 정확한 패턴 매칭
    const leasePatterns = [
      /임대차\s*계약서/i,
      /(?:집|방|부동산|건물)을\s*(?:빌리|임대)/i,
      /(?:나|저)[\s\w]*(?:은|는)[\s\w]*(?:에게)[\s\w]*(?:집|방|부동산|건물)을\s*(?:빌리|임대)/i,
    ];

    const hasLeasePattern = leasePatterns.some(pattern => pattern.test(content));
    const hasLeaseKeyword = leaseKeywords.some(keyword => content.includes(keyword));

    if (hasLeasePattern || hasLeaseKeyword) {
      console.log('임대차 계약서 패턴/키워드 감지됨');
      return {
        isDocumentRequest: true,
        documentType: 'lease',
        documentTypeName: '임대차 계약서',
      };
    }

    // 합의서 키워드 확인
    const hasAgreementKeywords = agreementKeywords.some(keyword => content.includes(keyword));
    if (hasAgreementKeywords) {
      console.log('합의서 키워드 감지됨');
      return {
        isDocumentRequest: true,
        documentType: 'agreement',
        documentTypeName: '합의서',
      };
    }

    // 위임장 키워드 확인
    const hasPoaKeywords = poaKeywords.some(keyword => content.includes(keyword));
    if (hasPoaKeywords) {
      console.log('위임장 키워드 감지됨');
      return {
        isDocumentRequest: true,
        documentType: 'power-of-attorney',
        documentTypeName: '위임장',
      };
    }

    // 임대차 계약서 특수 패턴 확인 (예: "나 김건우는 김종식에게 집을 빌리려고 해")
    const leaseSpecialPattern =
      /(?:나|저)\s+([가-힣\s]+)(?:은|는|이|가)\s+([가-힣\s]+)에게\s+(?:집|방|부동산|건물)을\s+(?:빌리|임대)/i;
    if (leaseSpecialPattern.test(content)) {
      console.log('임대차 계약서 특수 패턴 감지됨');
      return {
        isDocumentRequest: true,
        documentType: 'lease',
        documentTypeName: '임대차 계약서',
      };
    }

    // 문서 유형 정보 가져오기
    const { DOCUMENT_TYPES } = await import('@/templates/types');

    // OpenAI API 호출
    const { textStream } = await streamText({
      model: openai('gpt-4o'),
      system: `
당신은 사용자의 메시지에서 법률 문서 생성 요청 또는 판례 찾기 요청을 감지하는 AI입니다.
사용자의 요청을 분석하여 다음 세 가지 중 하나로 분류하세요:
1. 일반 법률 질문
2. 법률 문서 생성 요청
3. 판례 찾기 요청

다음 형식으로 JSON 응답을 제공하세요:
{
  "requestType": "general" | "document" | "case",
  "isDocumentRequest": true/false,
  "documentType": ${Object.keys(DOCUMENT_TYPES)
    .map(type => `"${type}"`)
    .join('/')} /null,
  "documentTypeName": ${Object.values(DOCUMENT_TYPES)
    .map(metadata => `"${metadata.name}"`)
    .join('/')} /null,
  "isCaseLookup": true/false,
  "caseKeywords": ["키워드1", "키워드2", ...],
  "confidence": 0-100 (확신도 점수)
}

문서 유형:
${Object.entries(DOCUMENT_TYPES)
  .map(([type, metadata]) => `- ${type}: ${metadata.name} (${metadata.description})`)
  .join('\n')}

다음과 같은 경우 문서 생성 요청으로 판단하세요:
1. 사용자가 직접적으로 문서 생성을 요청하는 경우 ("합의서 만들어줘", "임대차 계약서 작성해줘" 등)
2. 사용자가 문서 내용을 직접 입력하는 경우 ("갑: 홍길동, 을: 김철수, 합의사항: ..." 등)
3. 사용자가 문서 양식이나 템플릿을 요청하는 경우 ("위임장 양식 알려줘" 등)
4. 사용자가 임대차 관련 정보를 제공하는 경우 ("나 김건우는 김종식에게 집을 빌리려고 해" 등)

다음과 같은 경우 판례 찾기 요청으로 판단하세요:
1. 사용자가 특정 법률 문제에 대한 판례를 요청하는 경우 ("임대차 계약 해지 관련 판례 알려줘" 등)
2. 사용자가 판례 검색을 명시적으로 요청하는 경우 ("대법원 판례 찾아줘" 등)
3. 사용자가 특정 법률 상황에 대한 판례를 요청하는 경우 ("임차인이 보증금을 돌려받지 못하는 경우 판례" 등)

판례 찾기 요청인 경우, 검색에 유용한 키워드를 caseKeywords 배열에 추출하세요.
문서 생성 요청이 아니고 판례 찾기 요청도 아닌 경우는 일반 법률 질문으로 분류하세요.
      `,
      messages: [{ role: 'user', content }],
      temperature: 0.1,
    });

    // 응답 처리
    let responseText = '';
    for await (const text of textStream) {
      responseText += text;
    }

    console.log('요청 유형 감지 응답:', responseText);

    try {
      // JSON 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);

        // 판례 찾기 요청인 경우
        if (result.requestType === 'case' || result.isCaseLookup) {
          return {
            isDocumentRequest: false,
            isCaseLookup: true,
            caseKeywords: result.caseKeywords || [],
          };
        }

        // 문서 생성 요청인 경우
        if (result.requestType === 'document' || result.isDocumentRequest) {
          return {
            isDocumentRequest: true,
            documentType: result.documentType || undefined,
            documentTypeName: result.documentTypeName || undefined,
          };
        }

        // 일반 질문인 경우
        return {
          isDocumentRequest: false,
          isCaseLookup: false,
        };
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
    }

    // 기본값 반환
    return { isDocumentRequest: false, isCaseLookup: false };
  } catch (error) {
    console.error('요청 유형 감지 중 오류:', error);
    return { isDocumentRequest: false, isCaseLookup: false };
  }
}

/**
 * 문서 생성에 필요한 파라미터 추출
 * @param messages 대화 메시지 목록
 * @param documentType 문서 유형
 * @returns 추출된 파라미터
 */
export async function extractDocumentParameters(
  messages: ChatMessage[],
  documentType: string
): Promise<Record<string, any>> {
  try {
    console.log('파라미터 추출 시작 - 문서 유형:', documentType);

    // 템플릿 정보 가져오기
    const { DOCUMENT_TYPES } = await import('@/templates/types');
    const templateRegistry = (await import('@/templates')).default;

    // 문서 유형이 유효한지 확인
    if (!Object.keys(DOCUMENT_TYPES).includes(documentType)) {
      console.error(`유효하지 않은 문서 유형: ${documentType}`);
      return {};
    }

    // 템플릿 스키마 가져오기
    const template = await templateRegistry.getTemplate(documentType as any);
    const { schema } = template;

    // 정규식으로 파라미터 추출 (먼저 시도)
    const extractedParams = await extractParametersWithRegex(
      messages[messages.length - 1].content,
      schema
    );

    // 필수 파라미터가 모두 있는지 확인
    const missingParams = schema.required.filter(param => {
      const engKey = schema.keyMapping[param];
      return !extractedParams[param] && !extractedParams[engKey];
    });

    // 모든 필수 파라미터가 있으면 AI 호출 없이 바로 반환
    if (missingParams.length === 0) {
      console.log('정규식으로 모든 필수 파라미터 추출 성공');
      return extractedParams;
    }

    console.log('정규식으로 추출 실패한 파라미터:', missingParams);
    console.log('AI를 사용하여 파라미터 추출 시도');

    // AI를 사용하여 파라미터 추출
    const aiExtractedParams = await extractParametersWithAI(messages, documentType, schema);

    // 두 결과 병합 (AI 결과가 우선)
    const mergedParams = { ...extractedParams, ...aiExtractedParams };

    console.log('최종 추출된 파라미터:', mergedParams);
    return mergedParams;
  } catch (error) {
    console.error('파라미터 추출 중 오류:', error);
    return {};
  }
}
