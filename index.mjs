import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const handler = async event => {
    console.log('이벤트 데이터:', JSON.stringify(event));
    let browser = null;

    try {
        console.log('Chromium 설정 시작');
        // Chromium 설정
        chromium.setHeadlessMode = true;
        chromium.setGraphicsMode = false;

        // 이벤트 데이터 로깅
        console.log('템플릿 ID:', event.templateId);
        console.log('파라미터:', event.params);

        console.log('브라우저 실행 시작');
        // 브라우저 실행
        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none',
                '--lang=ko-KR,ko',
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        console.log('브라우저 실행 완료');

        // 새 페이지 생성
        console.log('새 페이지 생성');
        const page = await browser.newPage();

        // 언어 설정
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        });

        // 템플릿과 파라미터 추출
        console.log('템플릿 준비');
        let templateSource =
            event.template ||
            `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap');
            
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            body { 
              font-family: 'Noto Sans KR', 'Nanum Myeongjo', sans-serif;
              margin: 40px;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            h1 {
              font-weight: 700;
              font-size: 18pt;
              margin-bottom: 20px;
              text-align: center;
            }
            
            p {
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <h1>PDF 생성 테스트</h1>
          <p>현재 시간: {{current_time}}</p>
          <p>한글 테스트: 안녕하세요, 반갑습니다.</p>
        </body>
      </html>
    `;

        // 파라미터 매핑 및 처리
        const rawParams = event.params || {};
        console.log('원본 파라미터:', JSON.stringify(rawParams));

        // 파라미터 매핑 (한글 키를 영문 키로 변환)
        const paramMapping = {
            // 임대차계약서 파라미터
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

            // 합의서 파라미터
            갑: 'party_a_name',
            을: 'party_b_name',
            합의사항: 'agreement_content',
            합의일자: 'agreement_date',
            합의금액: 'agreement_amount',
            갑주소: 'party_a_address',
            을주소: 'party_b_address',
            갑연락처: 'party_a_contact',
            을연락처: 'party_b_contact',

            // 위임장 파라미터
            위임인: 'principal_name',
            수임인: 'agent_name',
            위임사항: 'delegation_content',
            위임기간: 'delegation_period',
            위임인주소: 'principal_address',
            수임인주소: 'agent_address',
            위임인연락처: 'principal_contact',
            수임인연락처: 'agent_contact',
        };

        // 매핑된 파라미터 생성
        const mappedParams = {};
        Object.entries(rawParams).forEach(([key, value]) => {
            const mappedKey = paramMapping[key] || key;
            mappedParams[mappedKey] = value;
        });

        // 템플릿 ID에 따른 추가 매핑 처리
        if (event.templateId) {
            console.log('템플릿 ID 기반 추가 매핑 처리:', event.templateId);

            // 합의서 템플릿인 경우
            if (event.templateId.includes('agreement')) {
                // 갑/을 파라미터가 있으면 party_a_name/party_b_name으로 매핑
                if (rawParams['갑']) {
                    mappedParams['party_a_name'] = rawParams['갑'];
                    console.log('갑 -> party_a_name 매핑:', rawParams['갑']);
                }
                if (rawParams['을']) {
                    mappedParams['party_b_name'] = rawParams['을'];
                    console.log('을 -> party_b_name 매핑:', rawParams['을']);
                }
                if (rawParams['합의사항']) {
                    mappedParams['agreement_content'] = rawParams['합의사항'];
                    console.log('합의사항 -> agreement_content 매핑:', rawParams['합의사항']);
                }
                if (rawParams['합의금액']) {
                    mappedParams['agreement_amount'] = rawParams['합의금액'];
                }
                if (rawParams['갑주소']) {
                    mappedParams['party_a_address'] = rawParams['갑주소'];
                }
                if (rawParams['을주소']) {
                    mappedParams['party_b_address'] = rawParams['을주소'];
                }
                if (rawParams['갑연락처']) {
                    mappedParams['party_a_contact'] = rawParams['갑연락처'];
                }
                if (rawParams['을연락처']) {
                    mappedParams['party_b_contact'] = rawParams['을연락처'];
                }
            }

            // 임대차계약서 템플릿인 경우
            if (event.templateId.includes('lease')) {
                // 임대인/임차인 파라미터가 있으면 lessor_name/lessee_name으로 매핑
                if (rawParams['임대인']) {
                    mappedParams['lessor_name'] = rawParams['임대인'];
                }
                if (rawParams['임차인']) {
                    mappedParams['lessee_name'] = rawParams['임차인'];
                }
            }
        }

        // 현재 날짜 추가
        mappedParams.formatted_date = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // 현재 시간 추가 (테스트 템플릿용)
        mappedParams.current_time = new Date().toLocaleString('ko-KR');

        console.log('최종 매핑된 파라미터:', JSON.stringify(mappedParams));
        console.log('템플릿 ID:', event.templateId);

        // Handlebars 조건문 처리 함수 개선
        function processHandlebarsTemplate(template, params) {
            console.log('템플릿 처리 시작 - 사용 가능한 변수들:', Object.keys(params).join(', '));

            // 기본 변수 치환
            let processedTemplate = template;

            // 변수 치환 ({{변수명}})
            processedTemplate = processedTemplate.replace(/\{\{([^#\/][^}]*)\}\}/g, (match, key) => {
                const trimmedKey = key.trim();
                const value = params[trimmedKey] !== undefined ? params[trimmedKey] : '';
                console.log(`변수 치환: {{${trimmedKey}}} => "${value}"`);
                return value;
            });

            // #if 조건문 처리 ({{#if 변수명}}...{{/if}})
            const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
            processedTemplate = processedTemplate.replace(ifRegex, (match, condition, content) => {
                const trimmedCondition = condition.trim();
                const conditionValue = params[trimmedCondition];
                const result = conditionValue ? content : '';
                console.log(
                    `조건문 처리: {{#if ${trimmedCondition}}} => ${conditionValue ? '참' : '거짓'}`
                );
                return result;
            });

            return processedTemplate;
        }

        // 템플릿 처리
        console.log('템플릿 처리 시작');
        const html = processHandlebarsTemplate(templateSource, mappedParams);
        console.log('처리된 HTML 일부:', html.substring(0, 200) + '...');

        // HTML 컨텐츠 설정 (실제 템플릿 사용)
        console.log('HTML 컨텐츠 설정');
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        // 웹 폰트 로딩을 위한 대기
        console.log('웹 폰트 로딩');
        await page.addStyleTag({
            content: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap');
        
        @font-face {
          font-family: 'Nanum Myeongjo';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/nanummyeongjo/v22/9Btx3DZF0dXLMZlywRbVRNhxy2pXV1A0pfCs5Kos.0.woff2) format('woff2');
        }
      `,
        });

        // 폰트 로딩 대기
        console.log('폰트 로딩 대기');
        await page.evaluateHandle('document.fonts.ready');

        // 추가 대기 시간
        console.log('추가 대기 시간');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // PDF 생성
        console.log('PDF 생성 시작');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm',
            },
            preferCSSPageSize: true,
        });
        console.log('PDF 생성 완료, 크기:', pdf.length, 'bytes');

        // PDF 시작 바이트 로깅 (디버깅용)
        const pdfStartBytes = Array.from(pdf.slice(0, 20)).join(',');
        console.log('PDF 시작 바이트:', pdfStartBytes);

        // 응답 형식 수정 - 클라이언트 코드와 일치하도록
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/pdf',
            },
            // PDF 바이트 배열을 직접 반환 (Base64 인코딩 대신)
            body: Array.from(pdf).join(','),
        };

        console.log('응답 준비 완료 (PDF 내용은 생략)');
        return response;
    } catch (error) {
        console.error('오류 발생:', error);
        // 오류 응답 형식도 수정
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'PDF 생성 중 오류가 발생했습니다.',
                error: error.message,
            }),
        };
    } finally {
        if (browser !== null) {
            console.log('브라우저 종료');
            await browser.close();
        }
    }
};