/**
 * 임대차 계약서 템플릿 스키마
 */
import { ITemplateSchema } from '../types';

const leaseSchema: ITemplateSchema = {
  // 필수 파라미터
  required: ['임대인', '임차인', '주소', '보증금', '월세', '계약기간'],

  // 선택적 파라미터
  optional: ['임대인주소', '임차인주소', '임대인연락처', '임차인연락처', '특약사항'],

  // 파라미터 설명
  descriptions: {
    임대인: '임대인의 이름을 입력하세요',
    임차인: '임차인의 이름을 입력하세요',
    주소: '임대 물건의 주소를 입력하세요',
    보증금: '보증금 금액을 입력하세요 (예: 1000만원)',
    월세: '월세 금액을 입력하세요 (예: 50만원)',
    계약기간: '계약 기간을 입력하세요 (예: 2023년 1월 1일부터 2024년 12월 31일까지)',
    임대인주소: '임대인의 주소를 입력하세요',
    임차인주소: '임차인의 주소를 입력하세요',
    임대인연락처: '임대인의 연락처를 입력하세요',
    임차인연락처: '임차인의 연락처를 입력하세요',
    특약사항: '특약사항이 있다면 입력하세요',
  },

  // 파라미터 영문 키 매핑
  keyMapping: {
    임대인: 'landlord_name',
    임차인: 'tenant_name',
    주소: 'property_address',
    보증금: 'deposit',
    월세: 'monthly_rent',
    계약기간: 'lease_period',
    임대인주소: 'landlord_address',
    임차인주소: 'tenant_address',
    임대인연락처: 'landlord_contact',
    임차인연락처: 'tenant_contact',
    특약사항: 'special_terms',
  },
};

export default leaseSchema;
