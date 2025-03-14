import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 설정
const S3_CONFIG = {
  region: process.env.AWS_REGION || 'ap-northeast-2',
  bucket: process.env.AWS_BUCKET_NAME || 'whitemousedev-legal-documents',
};

// S3 클라이언트 초기화
console.log('S3 클라이언트 초기화...');
console.log('설정된 리전:', S3_CONFIG.region);
console.log('설정된 버킷:', S3_CONFIG.bucket);

const s3Client = new S3Client({
  region: S3_CONFIG.region,
});

export async function uploadPDFToS3(pdfBytes: Uint8Array, fileName: string) {
  console.log('S3 업로드 시작 ==================');
  console.log('파일명:', fileName);
  console.log('파일 크기:', pdfBytes.length, 'bytes');
  try {
    // 환경 변수 체크
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS 인증 정보가 설정되지 않았습니다.');
    }

    const buffer = Buffer.from(pdfBytes);
    const key = `documents/${fileName}`;

    console.log('S3 키:', key);
    // S3에 업로드
    console.log('S3 업로드 명령 생성...');
    const putCommand = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    });
    console.log('S3에 파일 업로드 중...');

    await s3Client.send(putCommand);

    // 서명된 URL 생성 (1시간 유효)
    console.log('서명된 URL 생성 중...');
    const getCommand = new GetObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    console.log('생성된 URL:', url);
    console.log('S3 업로드 완료 ==================');
    return { url };
  } catch (error) {
    console.error('PDF 업로드 중 오류 발생:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
      throw new Error(`파일 업로드 실패: ${error.message}`);
    }
    throw new Error('파일 업로드에 실패했습니다.');
  }
}
