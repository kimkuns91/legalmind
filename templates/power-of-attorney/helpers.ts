/**
 * 위임장 템플릿 헬퍼 함수
 */

/**
 * 위임장 템플릿 데이터 준비 함수
 * @param params 파라미터 객체
 * @returns 준비된 템플릿 데이터
 */
export function preparePowerOfAttorneyTemplateData(
  params: Record<string, any>
): Record<string, any> {
  // 기본값 설정
  const today = new Date().toISOString().split('T')[0];
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const defaultDuration = `${today} ~ ${oneYearLater.toISOString().split('T')[0]}`;

  // 템플릿 데이터 준비
  return {
    // 필수 파라미터
    principal_name: params.principal_name || params.위임인 || '',
    agent_name: params.agent_name || params.수임인 || '',
    scope_of_authority: params.scope_of_authority || params.위임사항 || '',

    // 선택적 파라미터
    duration: params.duration || params.위임기간 || defaultDuration,
    principal_address: params.principal_address || params.위임인주소 || '',
    agent_address: params.agent_address || params.수임인주소 || '',
    principal_contact: params.principal_contact || params.위임인연락처 || '',
    agent_contact: params.agent_contact || params.수임인연락처 || '',

    // 날짜 포맷팅
    current_date: today,
    formatted_date: formatDate(today),
  };
}

/**
 * 날짜 포맷팅 함수
 * @param dateStr 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // 유효하지 않은 날짜는 그대로 반환
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return dateStr;
  }
}
