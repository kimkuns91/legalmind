import { Clock, FileText, HelpCircle, Mail, MessageCircle, Phone } from 'lucide-react';

import Link from 'next/link';

export const metadata = {
  title: '고객 지원 | LegalMind',
  description:
    'LegalMind의 고객 지원 서비스에 대해 알아보세요. 자주 묻는 질문, 문의 방법 등을 확인할 수 있습니다.',
};

export default function SupportPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">고객 지원</h1>
          <p className="text-lg text-gray-600">
            <span className="font-bold text-[#FF7F50]">해주세요</span>는 여러분의 법률 문제 해결을
            위해 항상 함께합니다.
          </p>
        </div>

        {/* 문의 방법 섹션 */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">문의 방법</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">이메일 문의</h3>
              <p className="mb-4 text-gray-600">평일 09:00 - 18:00 이내 답변을 드립니다.</p>
              <a
                href="mailto:support@legalmind.com"
                className="text-orange-600 hover:text-orange-700"
              >
                support@legalmind.com
              </a>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">전화 문의</h3>
              <p className="mb-4 text-gray-600">평일 09:00 - 18:00 상담 가능합니다.</p>
              <a href="tel:02-1234-5678" className="text-orange-600 hover:text-orange-700">
                02-1234-5678
              </a>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">실시간 채팅</h3>
              <p className="mb-4 text-gray-600">평일 09:00 - 18:00 실시간 상담 가능합니다.</p>
              <Link href="/chat" className="text-orange-600 hover:text-orange-700">
                채팅 시작하기
              </Link>
            </div>
          </div>
        </section>

        {/* 운영 시간 섹션 */}
        <section className="mb-16 rounded-lg bg-gray-50 p-6">
          <div className="flex items-start">
            <div className="mt-1 mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">고객 지원 운영 시간</h2>
              <div className="space-y-2 text-gray-600">
                <p>평일: 오전 9시 - 오후 6시</p>
                <p>점심시간: 오후 12시 - 오후 1시</p>
                <p>토요일, 일요일 및 공휴일: 휴무</p>
                <p className="mt-4 text-sm italic">
                  * 운영 시간 외 문의는 이메일로 접수해 주시면 다음 영업일에 순차적으로 답변
                  드리겠습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 자주 묻는 질문 섹션 */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">자주 묻는 질문</h2>
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                <span className="font-medium">해주세요</span> 서비스는 어떻게 이용하나요?
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">해주세요</span>는 회원가입 후 바로 이용 가능합니다.
                메인 페이지에서 법률 질문을 입력하시거나, 채팅 페이지에서 상세한 법률 상담을 받으실
                수 있습니다. 또한 문서 작성 지원 서비스를 통해 다양한 법률 문서 작성에 도움을 받으실
                수 있습니다.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                무료로 이용할 수 있는 서비스가 있나요?
              </h3>
              <p className="text-gray-600">
                네, 기본적인 법률 정보 검색과 간단한 법률 질문은 무료로 이용 가능합니다. 다만,
                전문적인 법률 상담이나 문서 작성 지원 등의 고급 기능은 유료 서비스로 제공됩니다.
                자세한 요금 정보는 요금제 페이지에서 확인하실 수 있습니다.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                개인정보는 어떻게 보호되나요?
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">해주세요</span>는 이용자의 개인정보 보호를 최우선으로
                생각합니다. 모든 개인정보는 암호화되어 안전하게 저장되며, 법률에서 정한 경우를
                제외하고는 제3자에게 제공되지 않습니다. 자세한 내용은 개인정보처리방침을 참고해
                주세요.
              </p>
              <div className="mt-4">
                <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                  개인정보처리방침 보기
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                결제 방법은 어떻게 되나요?
              </h3>
              <p className="text-gray-600">
                신용카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등) 등 다양한 결제 방법을
                지원합니다. 결제 시 발생하는 모든 정보는 안전하게 암호화되어 처리됩니다.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                환불 정책은 어떻게 되나요?
              </h3>
              <p className="text-gray-600">
                서비스 이용 시작 후 7일 이내에는 전액 환불이 가능합니다. 다만, 이미 법률 상담을
                받았거나 문서 작성 지원 서비스를 이용한 경우에는 해당 서비스 이용 금액을 제외한
                금액이 환불됩니다. 자세한 환불 정책은 고객센터로 문의해 주세요.
              </p>
            </div>
          </div>
        </section>

        {/* 추가 지원 자료 섹션 */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">추가 지원 자료</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">이용 가이드</h3>
              <p className="mb-4 text-gray-600">
                LegalMind 서비스 이용 방법에 대한 상세한 가이드를 제공합니다.
              </p>
              <Link
                href="/guide"
                className="inline-flex items-center text-orange-600 hover:text-orange-700"
              >
                가이드 보기
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">법률 용어 사전</h3>
              <p className="mb-4 text-gray-600">
                어려운 법률 용어를 쉽게 이해할 수 있는 용어 사전을 제공합니다.
              </p>
              <Link
                href="/dictionary"
                className="inline-flex items-center text-orange-600 hover:text-orange-700"
              >
                용어 사전 보기
              </Link>
            </div>
          </div>
        </section>

        {/* 문의하기 섹션 */}
        <div className="rounded-lg bg-orange-50 p-8">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-orange-700">
              아직 궁금한 점이 있으신가요?
            </h2>
            <p className="mb-6 text-orange-700">
              문의 양식을 통해 질문을 남겨주시면 빠르게 답변 드리겠습니다.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-orange-500 px-6 py-3 text-base font-medium text-white hover:bg-orange-600"
            >
              문의하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
