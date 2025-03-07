import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { AWS_BUCKET_NAME } from '@/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3';

/**
 * S3에 파일 업로드
 *
 * 제공된 파일 버퍼를 AWS S3에 업로드합니다.
 *
 * @param fileBuffer 파일 버퍼 (Buffer 형식)
 * @param fileName 저장할 파일 이름
 * @param contentType 파일 MIME 타입 (예: 'application/pdf')
 * @param folder 저장할 폴더 경로 (기본값: 'documents')
 * @returns 업로드된 파일의 키 (S3 내 경로)
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'documents'
): Promise<string> {
  // 파일명에 타임스탬프 추가하여 고유성 보장
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}-${fileName}`;

  // S3에 파일 업로드
  await s3Client.send(
    new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  return key;
}

/**
 * 파일 다운로드 URL 생성
 *
 * S3에 저장된 파일에 접근할 수 있는 서명된 URL을 생성합니다.
 * 서명된 URL은 지정된 시간 동안만 유효합니다.
 *
 * @param key 파일 키 (S3 내 경로)
 * @param expiresIn URL 만료 시간(초) (기본값: 3600초 = 1시간)
 * @returns 서명된 URL
 */
export async function getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * S3에서 파일 삭제
 *
 * 지정된 키에 해당하는 파일을 S3에서 삭제합니다.
 *
 * @param key 파일 키 (S3 내 경로)
 */
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * 파일 키에서 파일명 추출
 *
 * S3 파일 키에서 원본 파일명을 추출합니다.
 *
 * @param key 파일 키 (S3 내 경로)
 * @returns 원본 파일명
 */
export function getFileNameFromKey(key: string): string {
  // 경로에서 파일명 부분만 추출 (마지막 '/' 이후 부분)
  const fileName = key.split('/').pop() || '';

  // 타임스탬프 제거 (첫 번째 '-' 이후 부분)
  const originalFileName = fileName.split('-').slice(1).join('-');

  return originalFileName;
}
