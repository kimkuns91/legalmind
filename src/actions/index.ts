/**
 * 액션 모듈 진입점
 * - 모든 액션 함수를 내보냅니다.
 */

// 채팅 관련 함수 내보내기
export {
  sendMessage,
  generateAiResponse,
  getConversations,
  getConversationWithMessages,
  provideDocumentInfo,
  detectDocumentRequest,
  extractDocumentParameters,
  extractParametersWithRegex,
  extractParametersWithAI,
  isParameterSetComplete,
  extractIdNumber,
  generateCaseLookupResponse,
} from './chat';

// 문서 관련 함수 내보내기
export {
  requestDocument,
  getDocumentStatus,
  processDocumentGeneration,
  streamDocumentGeneration,
} from './document/document';
