import { createPDF, uploadPDFToS3 } from './create-document';
import { createStreamableValue, getMutableAIState } from 'ai/rsc';

import { ClientMessage } from '../types';
import DocumentStatus from '@/components/document/DocumentStatus';
import { Message } from '@/components/ai/Message';
import { ServerMessage } from '../types';
import { anthropic } from '@ai-sdk/anthropic';
import { generateId } from 'ai';
import { generateObject } from 'ai';
import { loadTemplateById } from '@/lib/templates/templateLoader';
import { templateIndex } from '@/lib/templates/templateRegistry';
import { z } from 'zod';

// 문서 생성 상태 관리
interface DocumentState {
  templateId: string | null;
  collectedParams: Record<string, string>;
  requiredParams: string[];
  optionalParams: string[];
}

const documentState: DocumentState = {
  templateId: null,
  collectedParams: {},
  requiredParams: [],
  optionalParams: [],
};

export async function handleDocumentMode(
  history: ReturnType<typeof getMutableAIState>
): Promise<ClientMessage> {
  const messages = history.get() as ServerMessage[];
  const lastMessage = messages[messages.length - 1];

  // 스트리밍을 위한 설정
  const textStream = createStreamableValue('');
  const display = <DocumentStatus stream={textStream.value} />;

  const updatedMessages = [...messages, { role: 'assistant', content: '', display }];
  history.update(updatedMessages);

  console.log('문서 생성 프로세스 시작 ==================');
  textStream.update('시작: 문서 생성을 시작합니다...');

  // 상태 로깅 및 스트리밍
  console.log('현재 상태:', {
    templateId: documentState.templateId,
    collectedParams: documentState.collectedParams,
    requiredParams: documentState.requiredParams,
    optionalParams: documentState.optionalParams,
  });

  // 1단계: 템플릿 식별
  if (!documentState.templateId) {
    console.log('1단계: 템플릿 식별 시작');
    textStream.update('템플릿: 문서 템플릿을 찾는 중...');

    const analysis = await generateObject({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: messages.map(msg => ({
        role: msg.role === 'tool' ? 'assistant' : msg.role,
        content:
          typeof msg.content === 'string'
            ? msg.content
            : msg.content.map(c => (c.type === 'text' ? c.text : '')).join('\n'),
      })),
      system: `당신은 사용자의 요청에서 필요한 법률 문서 종류를 식별하는 AI입니다.
               제공된 문서 템플릿 중에서 가장 적합한 것을 선택하세요.
               문서 종류: "lease" (임대차계약서), "agreement" (합의서), "power-of-attorney" (위임장)`,
      schema: z.object({
        documentType: z.enum(['lease', 'agreement', 'power-of-attorney']),
        confidence: z.number().min(0).max(100),
      }),
      temperature: 0.3,
    });

    console.log('문서 유형 분석 결과:', analysis.object);

    if (analysis.object.confidence < 70) {
      console.log('신뢰도 부족으로 문서 유형 식별 실패');
      const newMessage: ServerMessage = {
        role: 'assistant',
        content:
          '죄송합니다. 어떤 종류의 법률 문서가 필요하신지 명확하게 말씀해 주시겠어요?\n예: "임대차계약서 작성해줘" 또는 "위임장 만들어줘"',
      };
      const updatedMessages = [...messages, newMessage];
      history.done(updatedMessages);
      textStream.done();
      return {
        id: generateId(),
        role: 'assistant',
        display,
      };
    }

    // 템플릿 검색
    const templates = templateIndex.searchByType(analysis.object.documentType);
    console.log('검색된 템플릿:', templates);

    if (templates.length === 0) {
      console.log('해당하는 템플릿을 찾을 수 없음');
      const newMessage: ServerMessage = {
        role: 'assistant',
        content: '죄송합니다. 해당하는 문서 템플릿을 찾을 수 없습니다.',
      };
      const updatedMessages = [...messages, newMessage];
      history.done(updatedMessages);
      textStream.done();
      return {
        id: generateId(),
        role: 'assistant',
        display: (
          <Message
            role="assistant"
            content="죄송합니다. 해당하는 문서 템플릿을 찾을 수 없습니다."
          />
        ),
      };
    }

    // 첫 번째 템플릿 선택
    const selectedTemplate = templates[0];
    documentState.templateId = selectedTemplate.id;
    console.log('선택된 템플릿:', selectedTemplate);

    // 필요한 파라미터 설정
    documentState.requiredParams = selectedTemplate.required;
    documentState.optionalParams = selectedTemplate.optional;
    console.log('필요한 파라미터:', {
      required: documentState.requiredParams,
      optional: documentState.optionalParams,
    });

    // 사용자 입력에서 파라미터 추출 시도
    console.log('사용자 입력에서 파라미터 추출 시도');
    const paramExtraction = await generateObject({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: messages.map(msg => ({
        role: msg.role === 'tool' ? 'assistant' : msg.role,
        content:
          typeof msg.content === 'string'
            ? msg.content
            : msg.content.map(c => (c.type === 'text' ? c.text : '')).join('\n'),
      })),
      system: `사용자의 메시지에서 다음 파라미터들의 값을 추출하세요:
               필수 파라미터: ${documentState.requiredParams.join(', ')}
               선택 파라미터: ${documentState.optionalParams.join(', ')}
               
               명확하게 값을 찾을 수 있는 파라미터만 반환하세요.
               값이 불확실하거나 찾을 수 없는 경우 해당 파라미터는 반환하지 마세요.
               
               예시:
               입력: "임대인은 홍길동입니다"
               출력: { "임대인": "홍길동" }
               
               입력: "계약서 작성해주세요"
               출력: {}`,
      schema: z.object({
        params: z.record(z.string()),
      }),
      temperature: 0.1,
    });

    // 추출된 파라미터 저장
    documentState.collectedParams = paramExtraction.object.params;
    console.log('추출된 파라미터:', documentState.collectedParams);

    // 누락된 필수 파라미터 확인
    const missingParams = documentState.requiredParams.filter(
      param =>
        !documentState.collectedParams[param] ||
        documentState.collectedParams[param] === '<UNKNOWN>'
    );
    console.log('누락된 필수 파라미터:', missingParams);

    if (missingParams.length > 0) {
      const getParamDisplayName = (param: string) => {
        return param;
      };

      // 현재까지 수집된 파라미터 정보 문자열 생성
      const collectedParamsStr = Object.entries(documentState.collectedParams)
        .filter(([, value]) => value && value !== '<UNKNOWN>')
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');

      const message = collectedParamsStr
        ? `현재까지 입력된 정보:\n${collectedParamsStr}\n\n추가로 필요한 정보:\n${missingParams
            .map(param => `- ${getParamDisplayName(param)}`)
            .join('\n')}`
        : `${selectedTemplate.name} 작성을 위해 다음 정보가 필요합니다:\n\n${missingParams
            .map(param => `- ${getParamDisplayName(param)}`)
            .join('\n')}`;

      const newMessage: ServerMessage = {
        role: 'assistant',
        content: message,
      };
      const updatedMessages = [...messages, newMessage];
      history.done(updatedMessages);
      textStream.done();
      return {
        id: generateId(),
        role: 'assistant',
        display: <Message role="assistant" content={message} />,
      };
    }

    textStream.update('문서 템플릿을 찾았습니다.\n필요한 정보를 확인하는 중...\n');
  } else {
    // 2단계: 파라미터 수집
    console.log('2단계: 추가 파라미터 수집');
    textStream.update('추가 정보를 확인하는 중...\n');

    console.log('현재까지 수집된 파라미터:', documentState.collectedParams);

    const paramExtraction = await generateObject({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: [lastMessage].map(msg => ({
        role: msg.role === 'tool' ? 'assistant' : msg.role,
        content:
          typeof msg.content === 'string'
            ? msg.content
            : msg.content.map(c => (c.type === 'text' ? c.text : '')).join('\n'),
      })),
      system: `사용자의 응답에서 다음 파라미터들의 값을 추출하세요:
               ${documentState.requiredParams
                 .filter(
                   param =>
                     !documentState.collectedParams[param] ||
                     documentState.collectedParams[param] === '<UNKNOWN>'
                 )
                 .join(', ')}
               
               명확하게 값을 찾을 수 있는 파라미터만 반환하세요.
               값이 불확실하거나 찾을 수 없는 경우 해당 파라미터는 반환하지 마세요.
               
               예시:
               입력: "임대인은 홍길동입니다"
               출력: { "임대인": "홍길동" }
               
               입력: "계약서 작성해주세요"
               출력: {}`,
      schema: z.object({
        params: z.record(z.string()),
      }),
      temperature: 0.1,
    });

    // 새로 추출된 파라미터 추가
    const newParams = paramExtraction.object.params;
    console.log('새로 추출된 파라미터:', newParams);

    documentState.collectedParams = {
      ...documentState.collectedParams,
      ...newParams,
    };
    console.log('업데이트된 파라미터:', documentState.collectedParams);

    // 누락된 필수 파라미터 확인
    const missingParams = documentState.requiredParams.filter(
      param =>
        !documentState.collectedParams[param] ||
        documentState.collectedParams[param] === '<UNKNOWN>'
    );
    console.log('남은 필수 파라미터:', missingParams);

    if (missingParams.length > 0) {
      const getParamDisplayName = (param: string) => {
        return param;
      };

      // 현재까지 수집된 파라미터 정보 문자열 생성
      const collectedParamsStr = Object.entries(documentState.collectedParams)
        .filter(([, value]) => value && value !== '<UNKNOWN>')
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');

      const message = collectedParamsStr
        ? `현재까지 입력된 정보:\n${collectedParamsStr}\n\n추가로 필요한 정보:\n${missingParams
            .map(param => `- ${getParamDisplayName(param)}`)
            .join('\n')}`
        : `아직 다음 정보가 필요합니다:\n\n${missingParams
            .map(param => `- ${getParamDisplayName(param)}`)
            .join('\n')}`;

      const newMessage: ServerMessage = {
        role: 'assistant',
        content: message,
      };
      const updatedMessages = [...messages, newMessage];
      history.done(updatedMessages);
      textStream.done();
      return {
        id: generateId(),
        role: 'assistant',
        display,
      };
    }
  }

  // 3단계: 문서 생성
  try {
    textStream.update('모든 정보가 준비되었습니다.\n문서 생성을 시작합니다...\n');

    const template = await loadTemplateById(documentState.templateId!);
    const templateMetadata = templateIndex.getTemplateById(documentState.templateId!);

    if (!template || !templateMetadata) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    console.log('템플릿 로드 결과 ==================');
    console.log('템플릿 ID:', documentState.templateId);
    console.log('템플릿 메타데이터:', {
      name: templateMetadata.name,
      type: templateMetadata.type,
      required: templateMetadata.required,
      optional: templateMetadata.optional,
    });
    console.log('템플릿 내용:', template.content);
    console.log('템플릿 로드 완료 ==================\n');

    textStream.update('PDF: PDF 파일을 생성하는 중...');
    const pdfBytes = await createPDF({
      template: template.content,
      params: documentState.collectedParams,
      templateId: documentState.templateId!,
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${templateMetadata.name}_${timestamp}.pdf`;

    textStream.update('완료: 문서 생성이 완료되었습니다!');

    textStream.update('생성된 문서를 저장하는 중...\n');
    const pdfUrl = await uploadPDFToS3(pdfBytes, fileName);

    // 상태 초기화
    documentState.templateId = null;
    documentState.collectedParams = {};
    documentState.requiredParams = [];
    documentState.optionalParams = [];

    const newMessage: ServerMessage = {
      role: 'assistant',
      content: `문서가 성공적으로 생성되었습니다.\n\n[문서 다운로드](${pdfUrl.url})\n\n입력된 정보:\n${Object.entries(
        documentState.collectedParams
      )
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n')}`,
    };

    const updatedMessages = [...messages, newMessage];
    history.done(updatedMessages);
    textStream.done();

    return {
      id: generateId(),
      role: 'assistant',
      display,
    };
  } catch (error) {
    console.error('문서 생성 중 오류 발생:', error);
    textStream.update('오류: 문서 생성 중 오류가 발생했습니다.');
    textStream.done();

    return {
      id: generateId(),
      role: 'assistant',
      display,
    };
  } finally {
    console.log('문서 생성 프로세스 종료 ==================\n');
  }
}
