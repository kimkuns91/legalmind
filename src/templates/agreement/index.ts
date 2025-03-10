/**
 * 합의서 템플릿 등록
 */
import fs from 'fs';
import path from 'path';
import { ITemplate } from '../types';
import templateRegistry from '../registry';
import agreementSchema from './schema';
import { prepareAgreementTemplateData } from './helpers';

// HTML 템플릿 파일 읽기
const htmlTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/templates/agreement/template.html'),
  'utf-8'
);

// 합의서 템플릿 정의
const agreementTemplate: ITemplate = {
  type: 'agreement',
  typeName: '합의서',
  htmlTemplate,
  schema: agreementSchema,
  prepareTemplateData: prepareAgreementTemplateData,
};

// 템플릿 레지스트리에 등록
templateRegistry.registerTemplate(agreementTemplate);

export default agreementTemplate;
