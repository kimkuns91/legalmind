import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { DocumentType } from '../../../templates/types';
import { templateIndex } from './templateRegistry';

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * S3 버킷과 키를 파싱하는 함수
 */
function parseS3Location(s3Location: string): { bucket: string; key: string } {
  // https://bucket-name.s3.region.amazonaws.com/path/to/file 형식 파싱
  const url = new URL(s3Location);
  const bucket = url.host.split('.')[0];
  const key = url.pathname.slice(1); // 첫 번째 '/' 제거
  return { bucket, key };
}

/**
 * S3에서 템플릿 파일을 로드하는 함수
 */
export async function loadTemplateFromS3(s3Location: string): Promise<string> {
  try {
    const { bucket, key } = parseS3Location(s3Location);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('Empty response body');
    }

    // Stream을 문자열로 변환
    const streamToString = async (stream: any): Promise<string> => {
      const chunks: any[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString('utf-8');
    };

    return await streamToString(response.Body);
  } catch (error) {
    console.error('Failed to load template from S3:', error);
    throw error;
  }
}

/**
 * 템플릿 ID로 템플릿 메타데이터와 내용을 로드
 */
export async function loadTemplateById(templateId: string) {
  const metadata = templateIndex.getTemplateById(templateId);
  if (!metadata) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const content = await loadTemplateFromS3(metadata.s3Location);
  return { metadata, content };
}

/**
 * 키워드로 템플릿 검색
 */
export function searchTemplates(query: string) {
  return templateIndex.searchByKeyword(query);
}

/**
 * 태그로 템플릿 검색
 */
export function searchTemplatesByTags(tags: string[]) {
  return templateIndex.searchByTags(tags);
}

/**
 * 문서 타입으로 템플릿 검색
 */
export function getTemplatesByType(type: DocumentType) {
  return templateIndex.searchByType(type);
}
