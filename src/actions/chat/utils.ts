'use server';

/**
 * 채팅 관련 유틸리티 함수
 */

/**
 * 스트림을 안전하게 종료
 * @param stream 스트림 객체
 */
export async function safelyCloseStream(stream: any) {
  try {
    if (stream && typeof stream.close === 'function') {
      stream.close();
    }
  } catch (error) {
    console.error('스트림 종료 중 오류:', error);
  }
}

/**
 * 스트림에 오류 전달
 * @param stream 스트림 객체
 * @param error 오류 객체
 */
export async function safelyErrorStream(stream: any, error: Error) {
  try {
    if (stream && typeof stream.error === 'function') {
      stream.error(error);
    }
  } catch (streamError) {
    console.error('스트림 오류 전달 중 오류:', streamError);
  }
}
