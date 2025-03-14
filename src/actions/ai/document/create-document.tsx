import Handlebars from 'handlebars';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { templateIndex } from '@/lib/templates/templateRegistry';
import { uploadPDFToS3 } from './upload-pdf';

// 상수 정의
const PDF_CONFIG = {
  format: 'A4' as const,
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm',
  },
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
} as const;

const DOCUMENT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap');
  body { 
    font-family: 'Nanum Myeongjo', serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  @page {
    size: A4;
    margin: 20mm;
  }
  @media print {
    html, body {
      width: 210mm;
      height: 297mm;
    }
  }
`;

// 타입 정의
interface DocumentParams {
  template: string;
  params: Record<string, string>;
  templateId: string;
}

interface HandlebarsContext {
  fn: (context: any) => string;
  inverse: (context: any) => string;
}

type RetryOptions = {
  maxRetries: number;
  delayMs: number;
};

// 재시도 로직을 위한 유틸리티 함수
async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`시도 ${attempt}/${options.maxRetries} 실패:`, error);
      if (attempt < options.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, options.delayMs));
      }
    }
  }

  throw lastError || new Error('모든 재시도 실패');
}

// Handlebars 헬퍼 등록 함수
function registerHandlebarsHelpers() {
  // 기존 if 헬퍼
  Handlebars.registerHelper(
    'if',
    function (this: any, conditional: boolean, options: HandlebarsContext) {
      if (conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  );

  // 날짜 포맷팅 헬퍼
  Handlebars.registerHelper('formatDate', function (date: string) {
    try {
      return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Seoul',
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return date;
    }
  });

  // 금액 포맷팅 헬퍼
  Handlebars.registerHelper('formatNumber', function (number: number | string) {
    try {
      const num = typeof number === 'string' ? parseInt(number.replace(/[^0-9]/g, '')) : number;
      return new Intl.NumberFormat('ko-KR').format(num);
    } catch (error) {
      console.error('숫자 포맷팅 오류:', error);
      return number;
    }
  });

  // 문자열 자르기 헬퍼
  Handlebars.registerHelper('truncate', function (str: string, length: number) {
    if (str.length > length) {
      return str.substring(0, length) + '...';
    }
    return str;
  });
}

export async function createPDF({
  template,
  params,
  templateId,
}: DocumentParams): Promise<Uint8Array> {
  console.log('PDF 생성 시작 ==================');
  console.log('파라미터:', params);

  try {
    // 템플릿 메타데이터 가져오기
    const templateMetadata = templateIndex.getTemplateById(templateId);
    if (!templateMetadata) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    // 필수 파라미터 검증
    const missingParams = templateMetadata.required.filter(param => !params[param]);
    if (missingParams.length > 0) {
      throw new Error(`필수 파라미터가 누락되었습니다: ${missingParams.join(', ')}`);
    }

    // 파라미터 매핑
    const mappedParams = Object.entries(params).reduce(
      (acc, [key, value]) => {
        const mappedKey = templateMetadata.parameterMappings[key];
        if (mappedKey) {
          acc[mappedKey] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // 날짜 추가
    mappedParams.formatted_date = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    });

    console.log('매핑된 파라미터:', mappedParams);

    // Handlebars 헬퍼 등록
    registerHandlebarsHelpers();

    // 템플릿 컴파일 및 데이터 적용
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(mappedParams);

    return await withRetry(
      async () => {
        // Lambda 환경에서 Chromium 실행
        const executablePath = await chromium.executablePath();

        const browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless,
        });

        try {
          const page = await browser.newPage();

          // 폰트 및 스타일 처리
          await page.addStyleTag({ content: DOCUMENT_STYLES });
          await page.evaluateHandle('document.fonts.ready');

          // HTML 컨텐츠 설정
          await page.setContent(html, {
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: PDF_CONFIG.timeout,
          });

          // PDF 생성
          const pdfBuffer = await page.pdf({
            format: PDF_CONFIG.format,
            printBackground: true,
            margin: PDF_CONFIG.margin,
            preferCSSPageSize: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
              <div style="font-size: 8px; text-align: center; width: 100%;">
                <span class="pageNumber"></span> / <span class="totalPages"></span>
              </div>
            `,
          });

          console.log('PDF 생성 완료 ==================');
          return new Uint8Array(pdfBuffer);
        } finally {
          await browser.close();
        }
      },
      { maxRetries: PDF_CONFIG.maxRetries, delayMs: PDF_CONFIG.retryDelay }
    );
  } catch (error) {
    console.error('PDF 생성 중 오류:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }
    throw new Error(`PDF 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// S3에 PDF 업로드하는 함수
export { uploadPDFToS3 };
