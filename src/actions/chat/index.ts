/**
 * 채팅 기능 모듈 진입점
 * - 모든 채팅 관련 함수를 내보냅니다.
 */

// 채팅 기본 기능
export {
  sendMessage,
  generateAiResponse,
  getConversations,
  getConversationWithMessages,
  provideDocumentInfo,
} from './chat';

// 문서 요청 감지 기능
export { detectDocumentRequest, extractDocumentParameters } from './document-detection';

// 파라미터 추출 기능
export {
  extractParametersWithRegex,
  extractParametersWithAI,
  isParameterSetComplete,
  extractIdNumber,
} from './parameter-extraction';

// 판례 찾기 기능
export { generateCaseLookupResponse } from './case-lookup';

// 타입 정의
export type { ChatMessage, DocumentRequestDetection } from './types';
