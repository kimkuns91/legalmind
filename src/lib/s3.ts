import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from '@/config';

import { S3Client } from '@aws-sdk/client-s3';

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
