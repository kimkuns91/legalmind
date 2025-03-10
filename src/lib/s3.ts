import {
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  DOCUMENT_URL_EXPIRATION,
} from '@/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * AWS S3 클라이언트 초기화
 *
 * AWS S3 서비스에 접근하기 위한 클라이언트 객체를 생성합니다.
 * 환경 변수에서 액세스 키, 시크릿 키, 리전 정보를 가져와 설정합니다.
 */
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 버킷 이름 export
export { AWS_BUCKET_NAME };

/**
 * S3에서 파일 내용 가져오기
 * @param key S3 객체 키 (경로)
 * @returns 파일 내용 (문자열)
 */
export async function getFileContent(key: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();

    return content || null;
  } catch (error) {
    console.error(`S3에서 파일 가져오기 실패 (${key}):`, error);
    return null;
  }
}

/**
 * S3에 파일 업로드
 * @param key S3 객체 키 (경로)
 * @param content 파일 내용 (Buffer 또는 문자열)
 * @param contentType 파일 MIME 타입
 * @returns 성공 여부
 */
export async function uploadFileToS3(
  key: string,
  content: Buffer | string,
  contentType: string = 'application/octet-stream'
): Promise<boolean> {
  try {
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`S3에 파일 업로드 실패 (${key}):`, error);
    return false;
  }
}

/**
 * S3 파일에 대한 서명된 URL 생성
 * @param key S3 객체 키 (경로)
 * @param expiresIn URL 만료 시간 (초)
 * @returns 서명된 URL
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn: number = DOCUMENT_URL_EXPIRATION
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error(`서명된 URL 생성 실패 (${key}):`, error);
    throw error;
  }
}

/**
 * 템플릿 파일 경로 생성
 * @param documentType 문서 유형
 * @param fileName 파일 이름
 * @returns S3 객체 키 (경로)
 */
export function getTemplatePath(documentType: string, fileName: string): string {
  return `templates/${documentType}/${fileName}`;
}

/**
 * 생성된 문서 파일 경로 생성
 * @param documentType 문서 유형
 * @param fileName 파일 이름
 * @returns S3 객체 키 (경로)
 */
export function getGeneratedDocPath(documentType: string, fileName: string): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `generated/${yearMonth}/${documentType}_${fileName}`;
}
