import { DocumentType } from '../../../templates/types';

interface TemplateMetadata {
  id: string;
  type: DocumentType;
  name: string;
  description: string;
  keywords: string[];
  s3Location: string;
  version: string;
  lastUpdated: string;
  isPublic: boolean;
  tags: string[];
  required: string[]; // 필수 파라미터 목록
  optional: string[]; // 선택 파라미터 목록
  parameterMappings: Record<string, string>; // 한글-영문 변수 매핑
}

// 템플릿 메타데이터 저장소
const templateMetadata: TemplateMetadata[] = [
  {
    id: 'lease-agreement-v1',
    type: 'lease',
    name: '임대차계약서',
    description: '부동산 임대차 계약을 위한 표준 계약서',
    keywords: ['임대', '임차', '전세', '월세', '부동산'],
    s3Location:
      'https://whitemousedev-legal-documents.s3.ap-northeast-2.amazonaws.com/templates/lease/template.html',
    version: '1.0.0',
    lastUpdated: '2024-03-19',
    isPublic: true,
    tags: ['법률', '계약', '부동산'],
    required: ['임대인', '임차인', '주소', '보증금', '월세', '계약기간'],
    optional: [
      '임대인주소',
      '임차인주소',
      '임대인연락처',
      '임차인연락처',
      '물건종류',
      '면적',
      '특약사항',
    ],
    parameterMappings: {
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
  },
  {
    id: 'power-of-attorney-v1',
    type: 'power-of-attorney',
    name: '위임장',
    description: '특정 권한이나 업무를 타인에게 위임할 때 사용하는 문서',
    keywords: ['위임', '위임장', '권한', '위임계약', '대리', '대리권'],
    s3Location:
      'https://whitemousedev-legal-documents.s3.ap-northeast-2.amazonaws.com/templates/power-of-attorney/template.html',
    version: '1.0.0',
    lastUpdated: '2024-03-19',
    isPublic: true,
    tags: ['법률', '위임', '공증'],
    required: ['위임인', '수임인', '위임사항'],
    optional: ['위임기간', '위임인주소', '수임인주소', '위임인연락처', '수임인연락처'],
    parameterMappings: {
      위임인: 'grantor_name',
      수임인: 'grantee_name',
      위임사항: 'delegation_matters',
      위임기간: 'delegation_period',
      위임인주소: 'grantor_address',
      수임인주소: 'grantee_address',
      위임인연락처: 'grantor_contact',
      수임인연락처: 'grantee_contact',
    },
  },
  {
    id: 'agreement-v1',
    type: 'agreement',
    name: '합의서',
    description: '당사자 간의 합의 내용을 문서화하는 표준 양식',
    keywords: ['합의', '협의', '동의', '계약', '약정'],
    s3Location:
      'https://whitemousedev-legal-documents.s3.ap-northeast-2.amazonaws.com/templates/agreement/template.html',
    version: '1.0.0',
    lastUpdated: '2024-03-19',
    isPublic: true,
    tags: ['법률', '합의', '계약'],
    required: ['갑', '을', '합의사항'],
    optional: ['합의일자', '합의금액', '갑주소', '을주소', '갑연락처', '을연락처'],
    parameterMappings: {
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
  },
];

// 검색 인덱스
class TemplateSearchIndex {
  private keywordIndex: Map<string, Set<string>> = new Map();
  private typeIndex: Map<DocumentType, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private templates: Map<string, TemplateMetadata> = new Map();

  constructor(templates: TemplateMetadata[]) {
    this.initializeIndexes(templates);
  }

  private initializeIndexes(templates: TemplateMetadata[]) {
    templates.forEach(template => {
      // 템플릿 저장
      this.templates.set(template.id, template);

      // 키워드 인덱싱
      const allKeywords = [
        ...template.keywords,
        ...template.tags,
        template.name,
        template.description,
      ].map(k => k.toLowerCase());

      allKeywords.forEach(keyword => {
        const ids = this.keywordIndex.get(keyword) || new Set();
        ids.add(template.id);
        this.keywordIndex.set(keyword, ids);
      });

      // 문서 타입 인덱싱
      const typeIds = this.typeIndex.get(template.type) || new Set();
      typeIds.add(template.id);
      this.typeIndex.set(template.type, typeIds);

      // 태그 인덱싱
      template.tags.forEach(tag => {
        const tagIds = this.tagIndex.get(tag) || new Set();
        tagIds.add(template.id);
        this.tagIndex.set(tag, tagIds);
      });
    });
  }

  // 키워드 기반 검색
  searchByKeyword(query: string): TemplateMetadata[] {
    const normalizedQuery = query.toLowerCase();
    const matchedIds = new Set<string>();

    this.keywordIndex.forEach((ids, keyword) => {
      if (keyword.includes(normalizedQuery) || normalizedQuery.includes(keyword)) {
        ids.forEach(id => matchedIds.add(id));
      }
    });

    return Array.from(matchedIds)
      .map(id => this.templates.get(id)!)
      .sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(normalizedQuery);
        const bNameMatch = b.name.toLowerCase().includes(normalizedQuery);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return 0;
      });
  }

  // 문서 타입별 검색
  searchByType(type: DocumentType): TemplateMetadata[] {
    const ids = this.typeIndex.get(type) || new Set();
    return Array.from(ids).map(id => this.templates.get(id)!);
  }

  // 태그 기반 검색
  searchByTags(tags: string[]): TemplateMetadata[] {
    const matchedIds = new Set<string>();

    tags.forEach(tag => {
      const ids = this.tagIndex.get(tag) || new Set();
      ids.forEach(id => matchedIds.add(id));
    });

    return Array.from(matchedIds).map(id => this.templates.get(id)!);
  }

  // ID로 템플릿 조회
  getTemplateById(id: string): TemplateMetadata | undefined {
    return this.templates.get(id);
  }
}

// 템플릿 검색 인덱스 초기화
export const templateIndex = new TemplateSearchIndex(templateMetadata);
