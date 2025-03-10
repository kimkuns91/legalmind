/**
 * 문서 템플릿 타입 정의
 */

/**
 * 지원하는 문서 유형
 */
export type DocumentType = 'lease' | 'agreement' | 'power-of-attorney';

/**
 * 문서 유형별 한글 이름
 */
export const DOCUMENT_TYPE_NAMES: Record<DocumentType, string> = {
  lease: '임대차 계약서',
  agreement: '합의서',
  'power-of-attorney': '위임장',
};

/**
 * 문서 유형별 메타데이터
 */
export const DOCUMENT_TYPES: Record<
  DocumentType,
  {
    name: string;
    description: string;
    requiredParams: string[];
    optionalParams?: string[];
    keywords: string[]; // 문서 요청 감지에 사용할 키워드
  }
> = {
  lease: {
    name: '임대차 계약서',
    description: '부동산 임대차 계약을 위한 문서',
    requiredParams: ['임대인', '임차인', '주소', '보증금', '월세', '계약기간'],
    optionalParams: ['임대인주소', '임차인주소', '임대인연락처', '임차인연락처', '특약사항'],
    keywords: ['임대차', '계약서', '임대', '임차', '전세', '월세', '보증금'],
  },
  agreement: {
    name: '합의서',
    description: '당사자 간 합의 내용을 담은 문서',
    requiredParams: ['갑', '을', '합의사항'],
    optionalParams: ['합의일자', '합의금액', '갑주소', '을주소', '갑연락처', '을연락처'],
    keywords: ['합의서', '합의', '협의', '동의', '계약'],
  },
  'power-of-attorney': {
    name: '위임장',
    description: '법적 권한을 위임하는 문서',
    requiredParams: ['위임인', '수임인', '위임사항'],
    optionalParams: ['위임기간', '위임인주소', '수임인주소', '위임인연락처', '수임인연락처'],
    keywords: ['위임장', '위임', '대리', '권한', '수임'],
  },
  // 새로운 문서 유형 추가 시 여기에 정의
};

/**
 * 템플릿 파라미터 스키마 인터페이스
 */
export interface ITemplateSchema {
  // 필수 파라미터 목록
  required: string[];
  // 선택적 파라미터 목록
  optional?: string[];
  // 파라미터 설명 (한글)
  descriptions: Record<string, string>;
  // 파라미터 영문 키 매핑 (한글 -> 영문)
  keyMapping: Record<string, string>;
}

/**
 * 템플릿 인터페이스
 */
export interface ITemplate {
  // 문서 유형
  type: DocumentType;
  // 문서 유형 한글 이름
  typeName: string;
  // HTML 템플릿 문자열
  htmlTemplate: string;
  // 파라미터 스키마
  schema: ITemplateSchema;
  // 템플릿 데이터 준비 함수
  prepareTemplateData: (params: Record<string, any>) => Record<string, any>;
}

/**
 * 템플릿 레지스트리 인터페이스
 */
export interface ITemplateRegistry {
  // 문서 유형으로 템플릿 조회
  getTemplate: (type: DocumentType) => ITemplate;
  // 모든 템플릿 목록 반환
  getAllTemplates: () => ITemplate[];
  // 템플릿 등록
  registerTemplate: (template: ITemplate) => void;
}
