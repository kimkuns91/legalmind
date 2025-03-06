# 채팅 및 문서 생성 기능 구현

## 개요

LegalMind 프로젝트의 채팅 및 문서 생성 기능은 Next.js의 Server Actions를 활용하여 구현되었습니다. 이 문서는 채팅 기능과 문서 생성 기능의 구현 방식과 흐름을 설명합니다.

## 주요 기능

- 사용자-AI 간 대화 기능
- 법률 문서 생성 요청 감지
- 문서 생성을 위한 정보 수집
- 문서 생성 및 다운로드 제공

## 파일 구조

- `src/actions/chat.ts`: 채팅 관련 Server Actions
- `src/actions/document.ts`: 문서 생성 관련 Server Actions
- `src/components/ai/ChatInterface.tsx`: 채팅 인터페이스 컴포넌트
- `src/components/ai/Intro.tsx`: 초기 대화 시작 컴포넌트

## 데이터 모델

```prisma
model Conversation {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String    @db.ObjectId
  messages    Message[]
  documentRequests DocumentRequest[]

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Message {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  content        String
  role           String
  createdAt      DateTime @default(now())
  conversationId String   @db.ObjectId
  userId         String   @db.ObjectId

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model DocumentRequest {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  documentType   String
  status         String   // processing, completed, failed
  parameters     Json?
  fileUrl        String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  conversationId String   @db.ObjectId
  userId         String   @db.ObjectId

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 주요 함수 및 흐름

### 1. 대화 시작 및 메시지 전송

#### 대화 생성 및 리다이렉트

```typescript
// src/actions/conversation.ts
export async function createConversationAndRedirect(message: string) {
  'use server';

  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

    const userId = session.user.id;

    // 대화 생성
    const conversation = await prisma.conversation.create({
      data: {
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        userId,
        messages: {
          create: {
            content: message,
            role: 'user',
            userId,
          },
        },
      },
    });

    // 리다이렉트 URL 반환
    return { redirectUrl: `/ai/${conversation.id}` };
  } catch (error) {
    console.error('대화 생성 중 오류 발생:', error);
    throw new Error('대화를 생성하는 중 오류가 발생했습니다.');
  }
}
```

#### 메시지 전송 및 AI 응답 생성

```typescript
// src/actions/chat.ts
export async function sendMessage(conversationId: string, message: string) {
  'use server';

  // 사용자 인증 확인
  // 사용자 메시지 저장
  // 대화 내역 가져오기
  // 스트림 생성

  // 비동기 함수로 AI 응답 생성 및 스트림 업데이트
  (async () => {
    // 대화 내용을 OpenAI 메시지 형식으로 변환
    // 사용자 의도 파악 (문서 생성 요청인지 확인)

    if (documentRequestDetection.isDocumentRequest) {
      // 문서 생성 요청 처리
    } else {
      // 일반 질문인 경우 AI 응답 생성
    }
  })();

  return stream.value;
}
```

### 2. 문서 생성 요청 감지

```typescript
// src/actions/chat.ts
async function detectDocumentRequest(messages: ChatMessage[]): Promise<DocumentRequestDetection> {
  // 기본 응답 객체
  // 마지막 메시지 확인

  // 간단한 키워드 기반 감지
  const isDocumentRequest =
    content.includes('계약서') ||
    content.includes('작성해') ||
    content.includes('만들어') ||
    content.includes('위임장') ||
    content.includes('합의서');

  // 문서 유형 감지
  if (content.includes('임대차') || content.includes('계약서')) {
    documentType = 'lease';
    documentTypeName = '임대차 계약서';
    requiredInfo = ['임대인', '임차인', '주소', '보증금', '월세', '계약기간'];
  } else if (content.includes('합의서')) {
    // ...
  }

  return { isDocumentRequest, documentType, documentTypeName, requiredInfo };
}
```

### 3. 문서 생성 프로세스

#### 문서 생성 요청

```typescript
// src/actions/document.ts
export async function requestDocument(
  conversationId: string,
  documentType: string,
  parameters: Prisma.InputJsonValue
) {
  // 사용자 인증 확인
  // 문서 요청 생성
  // 비동기 문서 생성 프로세스 시작
  processDocumentGeneration(documentRequest.id);

  return documentRequest;
}
```

#### 문서 생성 처리

```typescript
// src/actions/document.ts
async function processDocumentGeneration(documentRequestId: string) {
  try {
    // 문서 요청 정보 가져오기
    // 문서 템플릿 가져오기
    // OpenAI를 사용하여 템플릿 채우기
    // PDF 또는 Word 파일 생성
    // 문서 요청 상태 업데이트
    // 대화에 문서 생성 완료 메시지 추가
  } catch (error) {
    console.error('문서 생성 중 오류 발생:', error);
  }
}
```

#### 문서 템플릿 관리

```typescript
// src/actions/document.ts
async function getDocumentTemplate(documentType: string) {
  // 문서 유형에 따른 템플릿 반환
  const templates: Record<string, DocumentTemplate> = {
    lease: {
      title: '임대차 계약서',
      sections: [
        {
          title: '계약 당사자',
          fields: ['임대인', '임차인'],
        },
        // ...
      ],
    },
    // 다른 문서 유형 템플릿...
  };

  return templates[documentType] || null;
}
```

### 4. 문서 생성 상태 확인 및 다운로드

```typescript
// src/actions/document.ts
export async function getDocumentStatus(documentRequestId: string) {
  // 사용자 인증 확인
  // 문서 요청 상태 확인
  return {
    status: documentRequest.status,
    fileUrl: documentRequest.fileUrl,
  };
}

export async function streamDocumentGeneration(
  conversationId: string,
  documentType: string,
  parameters: Prisma.InputJsonValue
) {
  // 스트림 생성
  // 문서 생성 요청
  // 주기적으로 문서 생성 상태 확인
  // 완료되면 다운로드 링크 제공

  return stream.value;
}
```

## 사용자 경험 흐름

1. 사용자가 초기 메시지 입력 (`Intro.tsx`)
2. 새 대화 생성 및 채팅방으로 리다이렉트
3. 채팅 인터페이스에서 AI 응답 표시 (`ChatInterface.tsx`)
4. 사용자가 문서 생성 요청 시:
   - 시스템이 문서 유형 감지
   - 필요한 정보 요청
   - 정보 수집 완료 시 문서 생성 시작
   - 문서 생성 완료 시 다운로드 링크 제공

## 개선 사항

- 문서 생성 시 실제 파일(PDF/Word) 생성 및 S3 저장 구현
- 더 정교한 문서 요청 감지 알고리즘 개발
- 다양한 법률 문서 템플릿 추가
- 문서 생성 과정의 실시간 진행 상황 표시 개선
