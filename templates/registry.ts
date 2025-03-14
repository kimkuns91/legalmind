/**
 * 문서 템플릿 레지스트리 (하이브리드 접근법)
 * - 로컬 템플릿을 기본값으로 사용
 * - S3에서 업데이트된 템플릿을 동적으로 로드 (있는 경우)
 */
import { DocumentType, ITemplate, ITemplateRegistry } from './types';
import { getFileContent, getTemplatePath } from '../src/lib/s3-utils';
import Handlebars from 'handlebars';

/**
 * 템플릿 레지스트리 클래스
 */
class TemplateRegistry implements ITemplateRegistry {
  private templates: Map<DocumentType, ITemplate> = new Map();
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private templateCache: Map<string, { template: ITemplate; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 5; // 5분 캐시

  /**
   * 로컬 템플릿 등록 (기본값으로 사용)
   * @param template 템플릿 객체
   */
  registerTemplate(template: ITemplate): void {
    console.log(`로컬 템플릿 등록: ${template.type}`);
    this.templates.set(template.type, template);
  }

  /**
   * S3에서 템플릿 초기화
   * - 이미 초기화된 경우 재사용
   * - 초기화 중인 경우 기존 Promise 반환
   */
  async initializeFromS3(): Promise<void> {
    // 이미 초기화된 경우
    if (this.isInitialized) return;

    // 초기화 중인 경우 기존 Promise 반환
    if (this.initPromise) return this.initPromise;

    // 초기화 시작
    this.initPromise = this._initializeFromS3();
    return this.initPromise;
  }

  /**
   * S3에서 템플릿 초기화 내부 구현
   * @private
   */
  private async _initializeFromS3(): Promise<void> {
    try {
      console.log('S3에서 템플릿 초기화 시작');

      // 개발 환경에서는 S3 초기화 건너뛰기 (선택적)
      if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_TEMPLATES === 'true') {
        console.log('개발 환경에서 로컬 템플릿만 사용');
        this.isInitialized = true;
        return;
      }

      // S3에서 템플릿 목록 가져오기
      const templateList = await this.fetchTemplateListFromS3();

      // 각 템플릿 로드
      for (const templateInfo of templateList) {
        try {
          const template = await this.fetchTemplateFromS3(templateInfo.type);
          console.log(`S3에서 템플릿 로드 성공: ${templateInfo.type}`);
          this.templates.set(templateInfo.type, template);
        } catch (error) {
          console.warn(`S3에서 템플릿 로드 실패 (${templateInfo.type}), 로컬 템플릿 사용:`, error);
          // 로컬 템플릿이 없으면 오류 로그만 남김 (getTemplate에서 오류 발생)
          if (!this.templates.has(templateInfo.type)) {
            console.error(`템플릿을 찾을 수 없음: ${templateInfo.type}`);
          }
        }
      }

      this.isInitialized = true;
      console.log('S3에서 템플릿 초기화 완료');
    } catch (error) {
      console.error('S3에서 템플릿 초기화 실패:', error);
      // 로컬 템플릿만 사용
      this.isInitialized = true;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * 템플릿 조회 (필요시 S3에서 초기화)
   * @param type 문서 유형
   * @returns 템플릿 객체
   */
  async getTemplate(type: DocumentType): Promise<ITemplate> {
    // S3에서 템플릿 초기화 (필요시)
    await this.initializeFromS3();

    // 캐시에서 템플릿 확인
    const cacheKey = `template:${type}`;
    const cachedItem = this.templateCache.get(cacheKey);
    const now = Date.now();

    if (cachedItem && now - cachedItem.timestamp < this.CACHE_TTL) {
      return cachedItem.template;
    }

    // 템플릿 조회
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${type}`);
    }

    // 캐시 업데이트
    this.templateCache.set(cacheKey, { template, timestamp: now });

    return template;
  }

  /**
   * 동기적으로 템플릿 조회 (S3 초기화 없음)
   * - 이미 초기화된 경우에만 사용
   * - 초기화되지 않은 경우 오류 발생
   * @param type 문서 유형
   * @returns 템플릿 객체
   */
  getTemplateSync(type: DocumentType): ITemplate {
    if (!this.isInitialized) {
      throw new Error(
        '템플릿 레지스트리가 초기화되지 않았습니다. getTemplate()을 먼저 호출하세요.'
      );
    }

    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${type}`);
    }

    return template;
  }

  /**
   * 모든 템플릿 목록 반환 (필요시 S3에서 초기화)
   * @returns 템플릿 객체 배열
   */
  async getAllTemplates(): Promise<ITemplate[]> {
    await this.initializeFromS3();
    return Array.from(this.templates.values());
  }

  /**
   * S3에서 템플릿 목록 가져오기
   * @returns 템플릿 정보 배열
   * @private
   */
  private async fetchTemplateListFromS3(): Promise<{ type: DocumentType; path: string }[]> {
    try {
      // S3에서 템플릿 목록 파일 가져오기
      const templateListJson = await getFileContent('templates/index.json');
      if (!templateListJson) {
        console.warn('S3에서 템플릿 목록을 찾을 수 없습니다.');
        return [];
      }

      // JSON 파싱
      const templateList = JSON.parse(templateListJson);
      return templateList.templates || [];
    } catch (error) {
      console.error('S3에서 템플릿 목록 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * S3에서 특정 템플릿 가져오기
   * @param type 문서 유형
   * @returns 템플릿 객체
   * @private
   */
  private async fetchTemplateFromS3(type: DocumentType): Promise<ITemplate> {
    // 템플릿 메타데이터 가져오기
    const metadataPath = getTemplatePath(type, 'metadata.json');
    const metadataJson = await getFileContent(metadataPath);

    if (!metadataJson) {
      throw new Error(`S3에서 템플릿 메타데이터를 찾을 수 없습니다: ${type}`);
    }

    // 메타데이터 파싱
    const metadata = JSON.parse(metadataJson);

    // HTML 템플릿 가져오기
    const htmlPath = getTemplatePath(type, 'template.html');
    const htmlContent = await getFileContent(htmlPath);

    if (!htmlContent) {
      throw new Error(`S3에서 HTML 템플릿을 찾을 수 없습니다: ${type}`);
    }

    // 헬퍼 스크립트 가져오기 (있는 경우)
    let prepareTemplateData;
    if (metadata.helperScript) {
      const helperPath = getTemplatePath(type, metadata.helperScript);
      const helperScript = await getFileContent(helperPath);

      if (helperScript) {
        // 주의: eval 사용은 보안 위험이 있으므로 실제 프로덕션에서는 더 안전한 방법 사용 권장
        // eslint-disable-next-line no-eval
        prepareTemplateData = eval(`(${helperScript})`);
      }
    }

    // 기본 데이터 준비 함수 (헬퍼 스크립트가 없는 경우)
    if (!prepareTemplateData) {
      prepareTemplateData = (params: Record<string, any>) => {
        const result: Record<string, any> = {};

        // 한글 키와 영문 키 모두 처리
        if (metadata.schema && metadata.schema.keyMapping) {
          for (const [korKey, engKey] of Object.entries(metadata.schema.keyMapping) as [
            string,
            string,
          ][]) {
            result[engKey] = params[engKey] || params[korKey] || '';
          }
        }

        return result;
      };
    }

    // 템플릿 객체 생성
    return {
      type: type,
      typeName: metadata.typeName || type,
      htmlTemplate: htmlContent,
      schema: metadata.schema || { required: [], descriptions: {}, keyMapping: {} },
      prepareTemplateData,
    };
  }

  /**
   * 템플릿 캐시 초기화
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * S3 초기화 상태 재설정 (테스트용)
   */
  resetInitialization(): void {
    this.isInitialized = false;
    this.initPromise = null;
    this.clearCache();
  }
}

// 싱글톤 인스턴스 생성
const templateRegistry = new TemplateRegistry();

export default templateRegistry;
