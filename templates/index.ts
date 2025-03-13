/**
 * 문서 템플릿 모듈 진입점
 * - 모든 템플릿을 등록하고 내보냅니다.
 */
import templateRegistry from './registry';

// 템플릿 레지스트리 내보내기
export default templateRegistry;

// 템플릿 등록 함수 (필요한 곳에서 호출)
export async function registerAllTemplates() {
  // 동적으로 템플릿 모듈 가져오기
  await Promise.all([import('./lease'), import('./agreement'), import('./power-of-attorney')]);

  console.log('모든 템플릿 등록 완료');
}

// 서버 컴포넌트나 서버 액션에서 사용할 수 있는 템플릿 초기화 함수
let initialized = false;
export async function initializeTemplates() {
  if (initialized) return;

  await registerAllTemplates();
  initialized = true;
  return templateRegistry;
}
