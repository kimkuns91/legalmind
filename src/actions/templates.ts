'use server';

import { DocumentType } from '@/templates/types';
import { auth } from '@/lib/auth';
import templateRegistry from '@/templates';

/**
 * 사용 가능한 모든 템플릿 목록 조회
 * @returns 템플릿 목록
 */
export async function getAvailableTemplates() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  // 모든 템플릿 정보 반환 (HTML 템플릿 내용은 제외)
  const templates = await templateRegistry.getAllTemplates();
  return templates.map(template => ({
    type: template.type,
    typeName: template.typeName,
    schema: template.schema,
  }));
}

/**
 * 특정 템플릿 정보 조회
 * @param type 템플릿 유형
 * @returns 템플릿 정보
 */
export async function getTemplateInfo(type: DocumentType) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  try {
    const template = await templateRegistry.getTemplate(type);

    // HTML 템플릿 내용은 제외하고 반환
    return {
      type: template.type,
      typeName: template.typeName,
      schema: template.schema,
    };
  } catch (error) {
    console.error(`템플릿 정보 조회 중 오류 (${type}):`, error);
    throw new Error(`템플릿을 찾을 수 없습니다: ${type}`);
  }
}

/**
 * 템플릿 파라미터 검증
 * @param type 템플릿 유형
 * @param params 파라미터 객체
 * @returns 검증 결과 (성공 여부, 누락된 파라미터 목록)
 */
export async function validateTemplateParameters(type: DocumentType, params: Record<string, any>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  try {
    const template = await templateRegistry.getTemplate(type);
    const { schema } = template;

    // 필수 파라미터 검증
    const missingParams: string[] = [];

    for (const requiredParam of schema.required) {
      // 한글 키 또는 영문 키로 파라미터 확인
      const englishKey = schema.keyMapping[requiredParam];
      if (!params[requiredParam] && !params[englishKey]) {
        missingParams.push(requiredParam);
      }
    }

    return {
      isValid: missingParams.length === 0,
      missingParams,
    };
  } catch (error) {
    console.error(`템플릿 파라미터 검증 중 오류 (${type}):`, error);
    throw new Error(`템플릿을 찾을 수 없습니다: ${type}`);
  }
}
