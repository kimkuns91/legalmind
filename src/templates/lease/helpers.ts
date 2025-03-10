/**
 * 임대차 계약서 템플릿 헬퍼 함수
 */

/**
 * 임대차 계약서 템플릿 데이터 준비 함수
 * @param params 파라미터 객체
 * @returns 템플릿에 사용할 데이터 객체
 */
export function prepareLeaseTemplateData(params: Record<string, any>): Record<string, any> {
  // 현재 날짜를 계약일로 사용 (다른 날짜가 지정되지 않은 경우)
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 기본 데이터 구성
  const templateData = {
    // 필수 필드
    landlord_name: params.landlord_name || params.임대인 || '',
    tenant_name: params.tenant_name || params.임차인 || '',
    property_address: params.property_address || params.주소 || '',
    deposit: params.deposit || params.보증금 || '',
    monthly_rent: params.monthly_rent || params.월세 || '',
    lease_period: params.lease_period || params.계약기간 || '',

    // 선택적 필드
    landlord_address: params.landlord_address || params.임대인주소 || '',
    tenant_address: params.tenant_address || params.임차인주소 || '',
    landlord_contact: params.landlord_contact || params.임대인연락처 || '',
    tenant_contact: params.tenant_contact || params.임차인연락처 || '',
    special_terms: params.special_terms || params.특약사항 || '',

    // 계약일 (파라미터에 없으면 현재 날짜 사용)
    contract_date: params.contract_date || params.계약일 || formattedDate,
  };

  return templateData;
}
