'use server';

/**
 * 파라미터 추출 관련 기능
 */

import { ChatMessage } from './types';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

/**
 * 정규식을 사용하여 문서 파라미터 추출
 * @param content 메시지 내용
 * @param schema 템플릿 스키마
 * @returns 추출된 파라미터
 */
export async function extractParametersWithRegex(
  content: string,
  schema: any
): Promise<Record<string, any>> {
  console.log('정규식으로 파라미터 추출 시작');
  const params: Record<string, any> = {};

  // 기본 패턴: "키: 값" 또는 "키=값" 형식
  const basicPattern = /(?:^|\n|\r)([가-힣\s]+)(?::|=)\s*([^\n\r]+)/g;
  let match;

  while ((match = basicPattern.exec(content)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();

    // 키가 유효한지 확인 (스키마의 required 또는 optional에 포함되는지)
    const isValidKey =
      schema.required.includes(key) || (schema.optional && schema.optional.includes(key));

    if (isValidKey && value) {
      params[key] = value;
      console.log(`파라미터 추출 (기본): ${key} = ${value}`);
    }
  }

  // 특수 패턴: 임대차 계약서 특수 패턴 (예: "나 김건우는 김종식에게 집을 빌리려고 해")
  const leaseSpecialPattern =
    /(?:나|저)\s+([가-힣\s]+)(?:은|는|이|가)\s+([가-힣\s]+)에게\s+(?:집|방|부동산|건물)을\s+(?:빌리|임대)/i;
  const leaseMatch = content.match(leaseSpecialPattern);

  if (leaseMatch && schema.required.includes('임차인') && schema.required.includes('임대인')) {
    params['임차인'] = leaseMatch[1].trim();
    params['임대인'] = leaseMatch[2].trim();
    console.log(`파라미터 추출 (특수): 임차인 = ${params['임차인']}, 임대인 = ${params['임대인']}`);
  }

  // 금액 패턴: "보증금 1000만원" 또는 "월세는 50만원" 형식
  const amountPattern =
    /(?:보증금|전세금|월세)(?:는|은|:|\s*)?\s*(\d+)(?:만원|만\s*원|억원|억\s*원)/g;
  while ((match = amountPattern.exec(content)) !== null) {
    const type = match[0].includes('보증금') || match[0].includes('전세금') ? '보증금' : '월세';
    const amount = match[1] + '만원';

    if (schema.required.includes(type)) {
      params[type] = amount;
      console.log(`파라미터 추출 (금액): ${type} = ${amount}`);
    }
  }

  // 주소 패턴: "주소: 서울시..." 또는 "위치는 서울시..." 형식
  const addressPattern =
    /(?:주소|위치)(?:는|은|:|\s*)?\s*([가-힣\d\s]+(?:시|도|군|구|동|읍|면|리|로|길)\s*[^\n\r]+)/g;
  while ((match = addressPattern.exec(content)) !== null) {
    const address = match[1].trim();

    if (schema.required.includes('주소')) {
      params['주소'] = address;
      console.log(`파라미터 추출 (주소): 주소 = ${address}`);
    }
  }

  // 기간 패턴: "계약기간: 2년" 또는 "기간은 1년" 형식
  const periodPattern = /(?:계약기간|기간)(?:는|은|:|\s*)?\s*(\d+)(?:년|개월|달)/g;
  while ((match = periodPattern.exec(content)) !== null) {
    const period = match[0].includes('년') ? match[1] + '년' : match[1] + '개월';

    if (schema.required.includes('계약기간')) {
      params['계약기간'] = period;
      console.log(`파라미터 추출 (기간): 계약기간 = ${period}`);
    }
  }

  // 영문 키로도 매핑
  if (schema.keyMapping) {
    for (const [korKey, engKey] of Object.entries(schema.keyMapping)) {
      if (params[korKey]) {
        params[engKey as string] = params[korKey];
      }
    }
  }

  console.log('정규식으로 파라미터 추출 완료:', params);
  return params;
}

/**
 * AI를 사용하여 메시지에서 파라미터 추출
 * @param messages 대화 메시지 목록
 * @param documentType 문서 유형
 * @param schema 템플릿 스키마
 * @returns 추출된 파라미터
 */
export async function extractParametersWithAI(
  messages: ChatMessage[],
  documentType: string,
  schema: any
): Promise<Record<string, any>> {
  try {
    // 템플릿 정보 가져오기
    const { DOCUMENT_TYPES } = await import('@/templates/types');

    // 문서 유형이 유효한지 확인
    if (!Object.keys(DOCUMENT_TYPES).includes(documentType)) {
      console.error(`유효하지 않은 문서 유형: ${documentType}`);
      return {};
    }

    const docTypeInfo = DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES];

    // 프롬프트 템플릿 생성
    const promptTemplate = `
사용자 메시지에서 ${docTypeInfo.name} 작성에 필요한 다음 정보를 추출해주세요:

필수 정보:
${docTypeInfo.requiredParams.map(param => `- ${param}`).join('\n')}

${docTypeInfo.optionalParams ? `선택 정보:\n${docTypeInfo.optionalParams.map(param => `- ${param}`).join('\n')}\n` : ''}

JSON 형식으로 응답해주세요:
{
  ${docTypeInfo.requiredParams.map(param => `"${param}": "추출된 값"`).join(',\n  ')}${docTypeInfo.optionalParams ? ',\n  ' + docTypeInfo.optionalParams.map(param => `"${param}": "추출된 값 또는 빈 문자열"`).join(',\n  ') : ''}
}

추출할 수 없는 정보는 빈 문자열로 남겨두세요.
`;

    console.log('AI 파라미터 추출 프롬프트:', promptTemplate);

    // OpenAI API 호출
    const { textStream } = await streamText({
      model: openai('gpt-4o'),
      system: promptTemplate,
      messages: [{ role: 'user', content: messages[messages.length - 1].content }],
      temperature: 0.1,
    });

    // 응답 처리
    let responseText = '';
    for await (const text of textStream) {
      responseText += text;
    }

    console.log('AI 파라미터 추출 응답:', responseText);

    try {
      // JSON 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('파싱된 파라미터:', result);

        // 영문 키로도 매핑
        if (schema.keyMapping) {
          for (const [korKey, engKey] of Object.entries(schema.keyMapping)) {
            if (result[korKey]) {
              result[engKey as string] = result[korKey];
            }
          }
        }

        return result;
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
    }

    return {};
  } catch (error) {
    console.error('AI 파라미터 추출 중 오류:', error);
    return {};
  }
}

/**
 * 파라미터 세트가 완전한지 확인
 * @param params 파라미터 객체
 * @param documentType 문서 유형
 * @returns 완전 여부
 */
export async function isParameterSetComplete(
  params: Record<string, any>,
  documentType: string
): Promise<boolean> {
  try {
    // 템플릿 정보 가져오기
    const { DOCUMENT_TYPES } = await import('@/templates/types');
    const templateRegistry = (await import('@/templates')).default;

    // 문서 유형이 유효한지 확인
    if (!Object.keys(DOCUMENT_TYPES).includes(documentType)) {
      console.error(`유효하지 않은 문서 유형: ${documentType}`);
      return false;
    }

    const docTypeInfo = DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES];
    const template = await templateRegistry.getTemplate(documentType as any);
    const { schema } = template;

    // 필수 파라미터 확인
    for (const requiredParam of docTypeInfo.requiredParams) {
      // 한글 키 또는 영문 키로 파라미터 확인
      const engKey = schema.keyMapping[requiredParam];

      if (!params[requiredParam] && !params[engKey]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('파라미터 완전성 확인 중 오류:', error);
    return false;
  }
}

/**
 * 주민등록번호 추출
 * @param text 텍스트
 * @returns 추출된 주민등록번호
 */
export async function extractIdNumber(text: string): Promise<string> {
  // 주민등록번호 패턴: 6자리-7자리 또는 6자리 7자리
  const idNumberPattern = /(\d{6})[-\s]?(\d{7})/g;
  const match = idNumberPattern.exec(text);

  if (match) {
    return `${match[1]}-${match[2]}`;
  }

  return '';
}
