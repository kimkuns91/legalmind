/**
 * 임대차 계약서 템플릿 등록
 */
import fs from 'fs';
import path from 'path';
import { ITemplate } from '../types';
import templateRegistry from '../registry';
import leaseSchema from './schema';
import { prepareLeaseTemplateData } from './helpers';

// HTML 템플릿 파일 읽기
const htmlTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/templates/lease/template.html'),
  'utf-8'
);

// 임대차 계약서 템플릿 정의
const leaseTemplate: ITemplate = {
  type: 'lease',
  typeName: '임대차 계약서',
  htmlTemplate,
  schema: leaseSchema,
  prepareTemplateData: prepareLeaseTemplateData,
};

// 템플릿 레지스트리에 등록
templateRegistry.registerTemplate(leaseTemplate);

export default leaseTemplate;
