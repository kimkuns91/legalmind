/**
 * 위임장 템플릿 스키마
 */
import { ITemplateSchema } from '../types';

const powerOfAttorneySchema: ITemplateSchema = {
  // 필수 파라미터
  required: ['위임인', '수임인', '위임사항'],

  // 선택적 파라미터
  optional: ['위임기간', '위임인주소', '수임인주소', '위임인연락처', '수임인연락처'],

  // 파라미터 설명
  descriptions: {
    위임인: '권한을 위임하는 사람',
    수임인: '권한을 위임받는 사람',
    위임사항: '위임하는 권한 또는 업무 내용',
    위임기간: '위임 기간',
    위임인주소: '위임인의 주소',
    수임인주소: '수임인의 주소',
    위임인연락처: '위임인의 연락처',
    수임인연락처: '수임인의 연락처',
  },

  // 파라미터 영문 키 매핑
  keyMapping: {
    위임인: 'principal_name',
    수임인: 'agent_name',
    위임사항: 'scope_of_authority',
    위임기간: 'duration',
    위임인주소: 'principal_address',
    수임인주소: 'agent_address',
    위임인연락처: 'principal_contact',
    수임인연락처: 'agent_contact',
  },
};

export default powerOfAttorneySchema;
