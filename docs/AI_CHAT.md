# 해주세요 AI 채팅 기능 명세서

## 개요

해주세요 AI 채팅 기능은 사용자의 법률 관련 질문에 답변하고, 필요한 법률 서류를 자동으로 생성해주는 서비스입니다. 최신 버전의 `@ai-sdk/openai`를 활용하여 자연어 처리 및 문서 생성 기능을 구현합니다. Next.js의 Server Actions를 활용하여 서버-클라이언트 간 통신을 효율적으로 처리합니다.

## 기술 스택

- **AI 모델**: OpenAI GPT-4
- **프레임워크**: Next.js (App Router)
- **AI SDK**: @ai-sdk/openai (최신 버전), ai 패키지
- **서버 통신**: Next.js Server Actions
- **문서 생성**: PDF/Word 파일 생성 라이브러리
- **데이터 저장**: Prisma ORM을 통한 데이터베이스 연동
- **타입 검증**: Zod

## 서비스 플로우

### 1️⃣ 유저 질문 입력

- 유저가 AI 챗봇에 질문 입력 (법률 상담 또는 서류 작성 요청)
- 질문 내용은 데이터베이스에 저장되어 대화 히스토리 관리
- Server Actions를 통해 메시지 저장 및 AI 응답 생성 프로세스 시작

### 2️⃣ AI가 질문 유형 분류

- 단순 법률 질문인지 서류 작성 요청인지 판단
- 자연어 처리(NLP) 모델을 이용해 질문을 분류
- 예시:
  - "임대차 계약서에서 보증금 반환 조항은 어떻게 설정하나요?" → 단순 질문
  - "임대차 계약서를 작성해줘." → 서류 작성 요청

### 3️⃣ 단순 법률 질문 처리

- 법률 관련 Q&A 데이터 기반으로 답변 생성
- 필요시 참고할 법률 조항 제공
- 답변은 마크다운 형식으로 제공하여 가독성 향상
- Server Actions를 통해 AI 응답을 스트리밍 방식으로 클라이언트에 전달

### 4️⃣ 서류 작성 요청 처리

#### 서류 템플릿 분석

- 기존 서류 템플릿을 읽고 유저 질문에 맞는 변수를 채움
- 서류 템플릿은 JSON/YAML 기반으로 관리 (예: 계약서, 합의서, 위임장 등)
- Server Actions를 통해 템플릿 데이터 접근 및 처리

#### 질문을 분석해 필요한 정보 요청

- "임대차 계약서를 작성해줘"라고 하면,
  → "임대인/임차인 이름, 보증금, 월세, 계약 기간을 입력해주세요."
- 추가 정보가 필요하면 유저에게 다시 질문
- Server Actions를 통해 필요한 정보 요청 및 응답 처리

#### 서류 자동 생성

- 유저가 입력한 정보를 바탕으로 PDF 또는 Word 파일 생성
- OpenAI Function Calling을 이용해 AI가 적절한 문장을 자동 완성
- 예시: "계약 기간: 2024년 3월 1일 ~ 2025년 2월 28일" 자동 삽입
- Server Actions를 통해 문서 생성 프로세스 실행 및 상태 관리

#### 완성된 서류 제공

- 최종 계약서 파일을 다운로드 가능하도록 제공 (PDF, Word)
- Server Actions를 통해 생성된 파일 URL 반환

## 데이터 모델

### 대화(Conversation)

```typescript
interface IConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  messages: IMessage[];
  documentRequests?: IDocumentRequest[];
}
```

### 메시지(Message)

```typescript
interface IMessage {
  id: string;
  content: string;
  role: string; // 'user' | 'assistant'
  createdAt: Date;
  userId: string;
  conversationId: string;
}
```

### 문서 요청(DocumentRequest)

```typescript
interface IDocumentRequest {
  id: string;
  documentType: string; // 'lease', 'agreement', 'power_of_attorney', etc.
  status: string; // 'pending', 'processing', 'completed', 'failed'
  parameters: Record<string, any>; // 문서 생성에 필요한 파라미터
  fileUrl?: string; // 생성된 문서 URL
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Server Actions 구현

### 채팅 관련 Server Actions

```typescript
// src/actions/chat.ts
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { OpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// 메시지 전송 및 AI 응답 생성 Server Action
export async function sendMessage(conversationId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  // 사용자 메시지 저장
  await prisma.message.create({
    data: {
      content: message,
      role: 'user',
      conversationId,
      userId,
    },
  });

  // AI 응답 스트리밍
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const stream = await streamText({
    model: openai.chat({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            '당신은 법률 전문가입니다. 사용자의 법률 관련 질문에 정확하고 도움이 되는 답변을 제공하세요.',
        },
        { role: 'user', content: message },
      ],
    }),
  });

  // 응답 저장 및 경로 재검증
  const aiResponse = await stream.text();
  await prisma.message.create({
    data: {
      content: aiResponse,
      role: 'assistant',
      conversationId,
      userId,
    },
  });

  revalidatePath(`/ai/${conversationId}`);
  return { stream };
}

// 대화 목록 조회 Server Action
export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  return prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

// 특정 대화 조회 Server Action
export async function getConversation(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}
```

### 문서 생성 관련 Server Actions

```typescript
// src/actions/document.ts
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { OpenAI } from '@ai-sdk/openai';

// 문서 생성 요청 Server Action
export async function requestDocument(
  conversationId: string,
  documentType: string,
  parameters: Record<string, any>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  // 문서 요청 생성
  const documentRequest = await prisma.documentRequest.create({
    data: {
      documentType,
      status: 'pending',
      parameters,
      conversationId,
      userId,
    },
  });

  // 비동기 문서 생성 프로세스 시작 (실제 구현은 별도 작업)
  processDocumentGeneration(documentRequest.id);

  revalidatePath(`/ai/${conversationId}`);
  return documentRequest;
}

// 문서 생성 프로세스 (비동기 처리)
async function processDocumentGeneration(documentRequestId: string) {
  try {
    // 상태 업데이트: 처리 중
    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { status: 'processing' },
    });

    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId },
    });

    if (!documentRequest) throw new Error('문서 요청을 찾을 수 없습니다.');

    // 문서 생성 로직 (실제 구현은 별도 작업)
    // ...

    // 생성된 문서 URL 저장
    const fileUrl = '생성된_문서_URL';

    // 상태 업데이트: 완료
    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: {
        status: 'completed',
        fileUrl,
      },
    });

    revalidatePath(`/ai/${documentRequest.conversationId}`);
  } catch (error) {
    console.error('문서 생성 중 오류 발생:', error);

    // 상태 업데이트: 실패
    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { status: 'failed' },
    });
  }
}
```

## 구현 계획

### 1단계: 기본 채팅 인터페이스 구현

- 채팅 UI 컴포넌트 개발
- Server Actions를 통한 메시지 전송 및 표시 기능 구현
- 대화 히스토리 저장 및 불러오기

### 2단계: AI 연동 및 질문 분류 기능

- @ai-sdk/openai 및 Server Actions 연동
- 질문 유형 분류 로직 구현
- 단순 법률 질문에 대한 답변 생성 기능

### 3단계: 서류 생성 기능 구현

- 서류 템플릿 시스템 개발
- Server Actions를 통한 필요 정보 수집 대화 흐름 구현
- PDF/Word 문서 생성 기능 개발

### 4단계: 사용자 경험 개선

- 로딩 상태 및 에러 처리
- 응답 속도 최적화
- 모바일 환경 대응

## 기술적 고려사항

### 보안

- 사용자 데이터 암호화
- API 키 보안 관리 (환경 변수 사용)
- 권한 관리 및 인증 (Server Actions 내 인증 검증)

### 성능

- 대화 내용 캐싱
- Server Actions 최적화
- 문서 생성 비동기 처리

### 확장성

- 다양한 AI 모델 지원 가능한 구조
- 새로운 문서 템플릿 쉽게 추가 가능
- 다국어 지원 준비

## 클라이언트 컴포넌트 구현

### 채팅 인터페이스 컴포넌트

```tsx
// src/components/ai/ChatInterface.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { sendMessage } from '@/actions/chat';
import { IMessage, IConversation } from '@/interface';

interface ChatInterfaceProps {
  conversation: IConversation;
  messages: IMessage[];
}

export default function ChatInterface({ conversation, messages }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await sendMessage(conversation.id, input.trim());
      setInput('');
      router.refresh();
    } catch (error) {
      console.error('메시지 전송 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            {/* 메시지 내용 */}
          </div>
        ))}
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-l-md border p-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-r-md bg-blue-500 px-4 py-2 text-white"
            disabled={isLoading}
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
```

## 테스트 계획

- 단위 테스트: 각 Server Action 및 컴포넌트 테스트
- 통합 테스트: Server Actions와 클라이언트 컴포넌트 간 상호작용 테스트
- E2E 테스트: 사용자 시나리오 기반 테스트
