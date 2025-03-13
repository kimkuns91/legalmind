/**
 * 위임장 템플릿 등록
 */
import fs from 'fs';
import path from 'path';
import { ITemplate } from '../types';
import templateRegistry from '../registry';
import poaSchema from './schema';
import { preparePowerOfAttorneyTemplateData } from './helpers';

// HTML 템플릿 파일 읽기
const htmlTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/templates/power-of-attorney/template.html'),
  'utf-8'
);

// 위임장 템플릿 정의
const poaTemplate: ITemplate = {
  type: 'power-of-attorney',
  typeName: '위임장',
  htmlTemplate,
  schema: poaSchema,
  prepareTemplateData: preparePowerOfAttorneyTemplateData,
};

// 템플릿 레지스트리에 등록
templateRegistry.registerTemplate(poaTemplate);

export default poaTemplate;
