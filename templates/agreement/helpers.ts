/**
 * 합의서 템플릿 헬퍼 함수
 */

/**
 * 합의서 템플릿 데이터 준비 함수
 * @param params 파라미터 객체
 * @returns 준비된 템플릿 데이터
 */
export function prepareAgreementTemplateData(params: Record<string, any>): Record<string, any> {
  // 기본값 설정
  const today = new Date().toISOString().split('T')[0];

  // 템플릿 데이터 준비
  return {
    // 필수 파라미터
    party_a_name: params.party_a_name || params.갑 || '',
    party_b_name: params.party_b_name || params.을 || '',
    agreement_content: params.agreement_content || params.합의사항 || '',

    // 선택적 파라미터
    agreement_date: params.agreement_date || params.합의일자 || today,
    agreement_amount: params.agreement_amount || params.합의금액 || '',
    party_a_address: params.party_a_address || params.갑주소 || '',
    party_b_address: params.party_b_address || params.을주소 || '',
    party_a_contact: params.party_a_contact || params.갑연락처 || '',
    party_b_contact: params.party_b_contact || params.을연락처 || '',

    // 날짜 포맷팅
    current_date: today,
    formatted_date: formatDate(params.agreement_date || params.합의일자 || today),
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
