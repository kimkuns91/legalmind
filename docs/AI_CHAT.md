# 해주세요 AI 채팅 프로세스 흐름도

## 채팅 프로세스 단계

### 1. 사용자 질문 입력 및 전송

- 사용자가 채팅 인터페이스(`ChatInterface.tsx`)에서 질문 입력
- `handleSubmit` 함수를 통해 질문 전송
- `sendMessage` Server Action 호출

### 2. 메시지 저장 및 처리 시작

- `sendMessage` 함수에서 사용자 인증 확인
- 사용자 메시지를 DB에 저장
- AI 응답 생성 프로세스 시작 (`generateAiResponse` 호출)

### 3. 문서 요청 여부 판단

- `detectDocumentRequest` 함수를 통해 사용자 메시지가 문서 생성 요청인지 판단
- 문서 요청이 아닌 경우: 일반 법률 질문으로 처리
- 문서 요청인 경우: 문서 유형 식별 및 필요 정보 확인 단계로 진행

### 4-A. 일반 법률 질문 처리 (문서 요청이 아닌 경우)

- OpenAI API를 통해 법률 질문에 대한 응답 생성
- `streamText`를 사용하여 응답을 실시간으로 스트리밍
- 응답 내용을 DB에 저장

### 4-B. 문서 요청 처리 (문서 요청인 경우)

- **문서 유형 식별**:

  - 문서 유형이 식별되지 않은 경우: 사용자에게 문서 유형 선택 요청
  - 문서 유형이 식별된 경우: 필요 정보 확인 단계로 진행

- **필요 정보 확인**:

  - `extractDocumentParameters` 함수를 통해 필요한 정보 추출
  - 정보가 부족한 경우: 사용자에게 추가 정보 요청
  - 정보가 충분한 경우: 문서 생성 단계로 진행

- **문서 생성 요청**:
  - `requestDocument` 함수를 통해 문서 생성 요청
  - 문서 생성 상태를 주기적으로 확인 (`checkStatus` 함수)
  - 생성 완료 시 다운로드 링크 제공

### 5. 추가 정보 제공 처리

- 사용자가 추가 정보 제공 시 `provideDocumentInfo` 함수 호출
- 제공된 정보를 기존 파라미터와 병합
- 문서 생성 프로세스 시작

### 6. 문서 생성 프로세스

- `processDocumentGeneration` 함수에서 비동기적으로 문서 생성
- 템플릿 조회 및 파라미터 매핑 (`getDocumentTemplate`, `fillDocumentTemplate`)
- PDF 생성 (`generatePdfFromHtml`)
- S3에 파일 업로드 및 URL 생성
- 문서 상태 업데이트 (`updateDocumentStatus`)

### 7. 응답 표시 및 다운로드 링크 제공

- 생성된 응답 또는 문서 링크를 채팅 인터페이스에 표시
- 문서 생성 완료 시 다운로드 링크 제공
- 로딩 상태 관리 (`isMessageLoading` 함수)

## 주요 함수 요약

- **사용자 인터페이스**: `ChatInterface`, `handleSubmit`, `isMessageLoading`
- **메시지 처리**: `sendMessage`, `generateAiResponse`
- **문서 요청 감지**: `detectDocumentRequest`, `extractDocumentParameters`
- **파라미터 추출**: `extractParametersWithRegex`, `extractParametersWithAI`
- **문서 생성**: `requestDocument`, `processDocumentGeneration`, `generatePdfFromHtml`
- **추가 정보 처리**: `provideDocumentInfo`
- **상태 관리**: `updateDocumentStatus`, `getDocumentStatus`, `checkStatus`

## 프로젝트 구조 개선 (리팩토링)

### 기존 구조의 문제점

- `chat.ts` 파일이 너무 길어져서 코드 관리와 유지보수가 어려움
- 여러 기능이 한 파일에 혼합되어 있어 가독성이 떨어짐
- 순환 참조 문제 발생 가능성이 높음
- 협업 시 충돌 가능성이 높음

### 개선된 폴더 구조

```
src/actions/
├── chat/
│   ├── index.ts           # 주요 함수들을 내보내는 진입점
│   ├── chat.ts            # 기본 채팅 기능 (메시지 전송, AI 응답 생성 등)
│   ├── document-detection.ts  # 문서 요청 감지 관련 기능
│   ├── case-lookup.ts     # 판례 찾기 관련 기능
│   ├── parameter-extraction.ts # 파라미터 추출 관련 기능
│   ├── types.ts           # 채팅 관련 타입 정의
│   └── utils.ts           # 유틸리티 함수 (스트림 처리 등)
└── document/
    ├── index.ts           # 문서 관련 함수 내보내기
    └── document.ts        # 문서 생성 기능
```

### 파일별 주요 기능

#### `chat/index.ts`

- 모든 채팅 관련 함수를 내보내는 진입점
- 다른 모듈에서 채팅 기능을 사용할 때 이 파일을 통해 접근

#### `chat/chat.ts`

- 메시지 전송 (`sendMessage`)
- AI 응답 생성 (`generateAiResponse`)
- 대화 목록 조회 (`getConversations`)
- 대화 및 메시지 조회 (`getConversationWithMessages`)
- 추가 정보 제공 (`provideDocumentInfo`)

#### `chat/document-detection.ts`

- 문서 요청 감지 (`detectDocumentRequest`)
- 문서 파라미터 추출 (`extractDocumentParameters`)

#### `chat/case-lookup.ts`

- 판례 찾기 응답 생성 (`generateCaseLookupResponse`)

#### `chat/parameter-extraction.ts`

- 정규식을 사용한 파라미터 추출 (`extractParametersWithRegex`)
- AI를 사용한 파라미터 추출 (`extractParametersWithAI`)
- 파라미터 완전성 확인 (`isParameterSetComplete`)
- 주민등록번호 추출 (`extractIdNumber`)

#### `chat/types.ts`

- 채팅 메시지 인터페이스 (`ChatMessage`)
- 문서 요청 감지 결과 인터페이스 (`DocumentRequestDetection`)

#### `chat/utils.ts`

- 스트림 안전 종료 (`safelyCloseStream`)
- 스트림 오류 전달 (`safelyErrorStream`)

### 리팩토링 장점

1. **코드 가독성 향상**: 각 파일이 특정 기능에 집중하므로 코드를 이해하기 쉬워짐
2. **유지보수 용이성**: 특정 기능을 수정할 때 관련 파일만 수정하면 됨
3. **협업 효율성**: 여러 개발자가 동시에 작업할 때 충돌 가능성이 줄어듦
4. **테스트 용이성**: 각 기능별로 테스트를 작성하기 쉬워짐
5. **확장성**: 새로운 기능을 추가할 때 기존 코드를 수정하지 않고 새 파일을 추가할 수 있음
6. **순환 참조 방지**: 모듈 간 의존성이 명확해져 순환 참조 문제를 방지할 수 있음
