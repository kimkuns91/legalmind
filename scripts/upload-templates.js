/**
 * 템플릿 파일을 S3 버킷에 업로드하는 스크립트
 *
 * 사용법:
 * node scripts/upload-templates.js
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
dotenv.config();

// __dirname 대체 (ESM에서는 __dirname이 없음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3 버킷 이름
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// 템플릿 소스 디렉토리
const TEMPLATES_DIR = path.join(__dirname, '../src/templates/s3-examples');

// 업로드할 파일 목록
const filesToUpload = [];

/**
 * 디렉토리 내 파일을 재귀적으로 탐색
 * @param {string} dir - 탐색할 디렉토리 경로
 * @param {string} baseDir - 기준 디렉토리 경로
 */
function scanDirectory(dir, baseDir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath, baseDir);
    } else {
      // S3 키 생성 (templates/ 접두사 추가)
      const relativePath = path.relative(baseDir, filePath);
      const s3Key = `templates/${relativePath.replace(/\\/g, '/')}`;

      filesToUpload.push({
        localPath: filePath,
        s3Key,
      });
    }
  }
}

/**
 * 파일을 S3에 업로드
 * @param {string} filePath - 로컬 파일 경로
 * @param {string} s3Key - S3 키
 */
async function uploadFile(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);

    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(params));
    console.log(`✅ 업로드 성공: ${s3Key}`);
  } catch (error) {
    console.error(`❌ 업로드 실패: ${s3Key}`, error);
  }
}

/**
 * 파일 확장자에 따른 Content-Type 반환
 * @param {string} filePath - 파일 경로
 * @returns {string} Content-Type
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'application/javascript';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('템플릿 파일 업로드 시작...');

  // 환경 변수 확인
  if (!BUCKET_NAME) {
    console.error('❌ AWS_S3_BUCKET_NAME 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  // 템플릿 디렉토리 탐색
  scanDirectory(TEMPLATES_DIR, TEMPLATES_DIR);

  console.log(`총 ${filesToUpload.length}개 파일 업로드 예정`);

  // 파일 업로드
  for (const file of filesToUpload) {
    await uploadFile(file.localPath, file.s3Key);
  }

  console.log('템플릿 파일 업로드 완료!');
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
