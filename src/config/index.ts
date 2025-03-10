/**
 * 환경 변수 설정
 *
 * 애플리케이션에서 사용하는 환경 변수들을 중앙에서 관리합니다.
 * process.env에서 값을 가져오며, 필요한 경우 기본값을 설정합니다.
 */

// 인증 관련 환경 변수
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET; // NextAuth 암호화 키
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL; // NextAuth URL

// 소셜 로그인 관련 환경 변수
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Google OAuth 클라이언트 ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Google OAuth 클라이언트 시크릿
export const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID; // Kakao OAuth 클라이언트 ID
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET; // Kakao OAuth 클라이언트 시크릿

// API 관련 환경 변수
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL; // API 기본 URL
export const EMAIL_USER = process.env.EMAIL_USER; // 이메일 발송 계정
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD; // 이메일 앱 비밀번호
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // 관리자 이메일

// OpenAI 관련 환경 변수
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // OpenAI API 키

// AWS S3 관련 환경 변수
export const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-2';
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'legalmind-documents';

// 문서 템플릿 관련 설정
export const TEMPLATE_PATH = 'templates';
export const GENERATED_DOCS_PATH = 'generated';
export const ASSETS_PATH = 'assets';

// 문서 URL 관련 설정
export const DOCUMENT_URL_EXPIRATION = 86400; // 24시간 (초 단위)

// 기타 설정
export const APP_NAME = 'LegalMind';
export const DEFAULT_LOCALE = 'ko';
