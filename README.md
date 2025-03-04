# LegalMind(가칭) - AI 법률 상담 및 서류 자동 생성 서비스

## 📌 소개

이 프로젝트는 AI 기반 법률 상담 및 서류 자동 생성 서비스를 제공합니다.  
사용자는 법률 관련 질문을 하거나, 계약서 등의 문서를 자동으로 생성할 수 있습니다.

## 🚀 기능

- **법률 상담 AI**: AI가 법률 관련 질문을 이해하고 적절한 답변 제공
- **서류 자동 생성**: 사용자의 요청을 분석하여 PDF/Word 계약서 자동 생성
- **OpenAI GPT-4 API 연동**: Function Calling을 활용한 질문 유형 분석 및 자동 응답
- **Next.js 15 기반**: 서버리스 API 라우트를 활용하여 최적화된 응답 처리
- **MongoDB (Prisma) 연동**: 사용자 입력 및 서류 생성 기록 저장

## 🏗️ 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN/UI
- **Backend**: Next.js API Routes (서버리스), OpenAI API (GPT-4 Function Calling)
- **Database**: MongoDB (Prisma ORM)
- **Storage**: AWS S3 (서류 저장)
- **State Management**: Zustand
- **Deployment**: Vercel

## 📂 프로젝트 구조

```
src/
├── app/                      # Next.js App Router 구조
│   ├── api/                  # API 라우트
│   │   ├── auth/             # 인증 관련 API
│   │   ├── chat/             # 법률 상담 채팅 API
│   │   ├── documents/        # 문서 생성 및 관리 API
│   │   └── webhook/          # 외부 서비스 웹훅
│   ├── (auth)/               # 인증 관련 라우트 그룹
│   │   ├── login/            # 로그인 페이지
│   │   ├── register/         # 회원가입 페이지
│   │   └── forgot-password/  # 비밀번호 찾기 페이지
│   ├── chat/                 # 법률 상담 채팅 페이지
│   ├── documents/            # 문서 생성 및 관리 페이지
│   ├── profile/              # 사용자 프로필 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 홈페이지
├── components/               # 재사용 가능한 컴포넌트
│   ├── ui/                   # UI 컴포넌트 (ShadCN/UI)
│   ├── chat/                 # 채팅 관련 컴포넌트
│   ├── documents/            # 문서 관련 컴포넌트
│   ├── forms/                # 폼 관련 컴포넌트
│   └── layout/               # 레이아웃 컴포넌트
├── lib/                      # 유틸리티 및 헬퍼 함수
│   ├── ai/                   # AI 관련 유틸리티 (OpenAI 연동)
│   ├── auth/                 # 인증 관련 유틸리티
│   ├── db/                   # 데이터베이스 관련 유틸리티
│   ├── documents/            # 문서 생성 관련 유틸리티
│   └── utils/                # 기타 유틸리티 함수
├── hooks/                    # 커스텀 React 훅
├── store/                    # Zustand 상태 관리
├── types/                    # TypeScript 타입 정의
├── styles/                   # 글로벌 스타일 (Tailwind 설정 등)
└── prisma/                   # Prisma ORM 설정 및 스키마
    └── schema.prisma         # 데이터베이스 스키마

public/                       # 정적 파일 (이미지, 아이콘 등)
├── images/
├── fonts/
└── favicon.ico

.env                          # 환경 변수
.env.example                  # 환경 변수 예시
next.config.js                # Next.js 설정
tailwind.config.js            # Tailwind CSS 설정
tsconfig.json                 # TypeScript 설정
package.json                  # 프로젝트 의존성 및 스크립트
```

## 🔥 TODO

- **OpenAI Function Calling 적용**

  - 법률 질문 의도 파악 및 분류 로직 구현
  - 답변 생성 프롬프트 최적화
  - 에러 처리 및 폴백 메커니즘 구현

- **서류 자동 생성 로직 개발**

  - 템플릿 기반 문서 생성 시스템 구축
  - PDF/Word 변환 및 다운로드 기능 구현
  - AWS S3 연동 및 문서 저장 로직 개발

- **UI 디자인 및 상태 관리 적용**

  - ShadCN/UI 컴포넌트 커스터마이징
  - 반응형 디자인 구현
  - Zustand를 활용한 전역 상태 관리 설계

- **MongoDB 데이터 모델링 및 Prisma 연동**
  - 사용자, 채팅, 문서 스키마 설계
  - Prisma 모델 정의 및 마이그레이션 설정
  - 데이터 CRUD 작업 최적화

## 📝 라이센스

MIT License
