import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-32">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-50 to-white" />

      {/* 장식용 원형 요소 */}
      <div className="absolute -top-24 -right-24 z-0 h-96 w-96 rounded-full bg-orange-100 opacity-70 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 z-0 h-96 w-96 rounded-full bg-orange-100 opacity-70 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* 텍스트 섹션 */}
          <div className="max-w-2xl">
            <h1 className="mb-6 text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-5xl">
              음성인식 기술로 더 쉽고 빠른 <br />
              <span className="text-[#F58733]">법률 문서 작성</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              복잡한 법률 문서 작성, 이제 <span className="font-bold text-[#F58733]">해주세요</span>
              와 함께 해결하세요. 24시간 어디서나 법률적 효력을 지닌 문서를 생성 검토 받을 수
              있습니다.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-[#F58733] text-white hover:bg-[#E07722]">
                <Link href="/ai">무료로 시작하기</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[#F58733] text-[#F58733] hover:bg-orange-50"
              >
                <Link href="/pricing">요금제 알아보기</Link>
              </Button>
            </div>

            {/* 신뢰 지표 */}
            <div className="mt-12">
              <p className="mb-4 text-sm text-gray-500">신뢰할 수 있는 서비스</p>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#F58733]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">10,000+ 상담 완료</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#F58733]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">4.9/5 평점</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#F58733]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">24/7 상담 가능</span>
                </div>
              </div>
            </div>
          </div>

          {/* 이미지 섹션 */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 scale-105 rotate-3 transform rounded-2xl bg-gradient-to-br from-[#F58733]/20 to-orange-300/20" />
            <div className="relative rounded-2xl bg-white p-2 shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src="/images/sample.webp"
                  alt="법률 상담 이미지"
                  fill
                  className="rounded-xl border-3 border-[#F58733] object-contain"
                  priority
                />
              </div>
            </div>

            {/* 플로팅 카드 */}
            <div className="absolute -bottom-6 -left-12 rounded-lg bg-white p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[#F58733]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">안전한 데이터 보호</p>
                  <p className="text-xs text-gray-500">개인정보 암호화 처리</p>
                </div>
              </div>
            </div>

            {/* 플로팅 카드 2 */}
            <div className="absolute -top-6 -right-12 rounded-lg bg-white p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[#F58733]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">전문가 검증</p>
                  <p className="text-xs text-gray-500">변호사 감수 시스템</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
