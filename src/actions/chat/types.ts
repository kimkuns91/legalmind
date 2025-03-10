/**
 * 채팅 관련 타입 정의
 */

/**
 * 채팅 메시지 인터페이스
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * 문서 요청 감지 결과 인터페이스
 */
export interface DocumentRequestDetection {
  isDocumentRequest: boolean;
  documentType?: string;
  documentTypeName?: string;
  requiredInfo?: string[];
  // 판례 찾기 관련 필드
  isCaseLookup?: boolean;
  caseKeywords?: string[];
}
