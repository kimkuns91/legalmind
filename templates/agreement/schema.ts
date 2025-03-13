/**
 * 합의서 템플릿 스키마
 */
import { ITemplateSchema } from '../types';

const agreementSchema: ITemplateSchema = {
  // 필수 파라미터
  required: ['갑', '을', '합의사항'],

  // 선택적 파라미터
  optional: ['합의일자', '합의금액', '갑주소', '을주소', '갑연락처', '을연락처'],

  // 파라미터 설명
  descriptions: {
    갑: '첫 번째 당사자 정보',
    을: '두 번째 당사자 정보',
    합의사항: '합의 내용',
    합의일자: '합의한 날짜',
    합의금액: '합의금 금액',
    갑주소: '첫 번째 당사자 주소',
    을주소: '두 번째 당사자 주소',
    갑연락처: '첫 번째 당사자 연락처',
    을연락처: '두 번째 당사자 연락처',
  },

  // 파라미터 영문 키 매핑
  keyMapping: {
    갑: 'party_a_name',
    을: 'party_b_name',
    합의사항: 'agreement_content',
    합의일자: 'agreement_date',
    합의금액: 'agreement_amount',
    갑주소: 'party_a_address',
    을주소: 'party_b_address',
    갑연락처: 'party_a_contact',
    을연락처: 'party_b_contact',
  },
};

export default agreementSchema;
