/**
 * 임대차계약서 템플릿 스키마
 */
import { ITemplateSchema } from '../types';

const leaseSchema: ITemplateSchema = {
  // 필수 파라미터
  required: ['임대인', '임차인', '주소', '보증금', '월세', '계약기간'],

  // 선택적 파라미터
  optional: [
    '임대인주소',
    '임차인주소',
    '임대인연락처',
    '임차인연락처',
    '물건종류',
    '면적',
    '특약사항',
  ],

  // 파라미터 설명
  descriptions: {
    임대인: '임대인의 이름',
    임차인: '임차인의 이름',
    주소: '임대물건의 소재지 주소',
    보증금: '임대 보증금 금액',
    월세: '월 임대료 금액',
    계약기간: '임대차 계약기간',
    임대인주소: '임대인의 주소',
    임차인주소: '임차인의 주소',
    임대인연락처: '임대인의 연락처',
    임차인연락처: '임차인의 연락처',
    물건종류: '임대물건의 종류 (예: 아파트, 오피스텔 등)',
    면적: '임대물건의 면적',
    특약사항: '계약 당사자 간의 특별한 약정사항',
  },

  // 파라미터 영문 키 매핑
  keyMapping: {
    임대인: 'lessor_name',
    임차인: 'lessee_name',
    주소: 'property_address',
    보증금: 'deposit',
    월세: 'monthly_rent',
    계약기간: 'lease_period',
    임대인주소: 'lessor_address',
    임차인주소: 'lessee_address',
    임대인연락처: 'lessor_contact',
    임차인연락처: 'lessee_contact',
    물건종류: 'property_type',
    면적: 'property_size',
    특약사항: 'special_terms',
  },
};

export default leaseSchema;
