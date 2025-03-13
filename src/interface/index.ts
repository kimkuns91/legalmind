import { JsonValue } from '@prisma/client/runtime/library';

// 사용자 인터페이스
export interface IUser {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  hashedPassword?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 계정 인터페이스
export interface IAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

// 세션 인터페이스
export interface ISession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

// 인증 토큰 인터페이스
export interface IVerificationToken {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
}

// 대화 인터페이스
export interface IConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  messages?: IMessage[];
}

// 메시지 인터페이스
export interface IMessage {
  id: string;
  content: string | JsonValue;
  role: 'user' | 'assistant';
  createdAt: Date;
  conversationId: string;
  userId: string;
}

// 문서 인터페이스
export interface IDocument {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  documentType: DocumentType;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// 문서 유형 열거형
// export enum DocumentType {
//   CONTRACT = 'contract',
//   COMPLAINT = 'complaint',
//   PETITION = 'petition',
//   AGREEMENT = 'agreement',
//   POWER_OF_ATTORNEY = 'powerOfAttorney',
//   OTHER = 'other',
// }

// 문서 요청 인터페이스 (AI 채팅에서 사용)
export interface IDocumentRequest {
  id: string;
  documentType: DocumentType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parameters: Record<string, string | number | boolean | null>;
  fileUrl?: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
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
  result: string | ICaseLaw[] | object;
}

export interface IUIContent {
  type: 'ui';
  uiType: string;
  uiData: object;
}

export type IMessageContent = ITextContent | IToolResultContent | IUIContent;

export interface ICaseLaw {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  court: string;
  caseNumber: string;
  decisionDate: Date;
  url: string;
}
