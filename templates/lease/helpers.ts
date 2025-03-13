/**
 * 임대차 계약서 템플릿 헬퍼 함수
 */

/**
 * 임대차 계약서 템플릿 데이터 준비 함수
 * @param params 파라미터 객체
 * @returns 준비된 템플릿 데이터
 */
export function prepareLeaseTemplateData(params: Record<string, any>): Record<string, any> {
  // 기본값 설정
  const today = new Date().toISOString().split('T')[0];

  // 템플릿 데이터 준비
  return {
    // 필수 파라미터
    lessor_name: params.lessor_name || params.임대인 || '',
    lessee_name: params.lessee_name || params.임차인 || '',
    property_address: params.property_address || params.주소 || '',
    deposit: params.deposit || params.보증금 || '',
    monthly_rent: params.monthly_rent || params.월세 || '',
    lease_period: params.lease_period || params.계약기간 || '',

    // 선택적 파라미터
    lessor_address: params.lessor_address || params.임대인주소 || '',
    lessee_address: params.lessee_address || params.임차인주소 || '',
    lessor_contact: params.lessor_contact || params.임대인연락처 || '',
    lessee_contact: params.lessee_contact || params.임차인연락처 || '',
    property_type: params.property_type || params.물건종류 || '',
    property_size: params.property_size || params.면적 || '',
    special_terms: params.special_terms || params.특약사항 || '',

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
