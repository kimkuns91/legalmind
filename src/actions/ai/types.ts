/**
 * 채팅 관련 타입 정의
 */

import { ReactNode } from 'react';

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

export interface ServerMessage {
  role: 'user' | 'assistant' | 'tool';
  content: IMessageContent[] | string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  display: string | ReactNode;
}

// 메시지 콘텐츠 타입 정의
export interface ITextContent {
  type: 'text';
  text: string;
}

export interface IToolResultContent {
  type: 'tool-result';
  toolName: string;
  toolCallId: string;
  result: string | object;
}

export interface IUIContent {
  type: 'ui';
  uiType: string;
  uiData: object;
}

export type IMessageContent = ITextContent | IToolResultContent | IUIContent;
