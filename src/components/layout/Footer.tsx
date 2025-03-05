import Link from 'next/link';
import Logo from '@/components/common/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-1">
            <Logo width={150} height={36} className="mb-4" />
            <p className="mb-4 text-gray-600">
              AI 기술을 활용한 법률 상담 서비스로 누구나 쉽게 법률 정보에 접근할 수 있도록 돕습니다.
            </p>
            <div className="flex space-x-4">
              {/* 소셜 미디어 아이콘 */}
              {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 transition-colors hover:text-[#F58733]"
                >
                  <span className="sr-only">{social}</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">서비스</h3>
            <ul className="space-y-3">
              {[
                { name: '법률 상담', href: '/chat' },
                { name: '요금제', href: '/pricing' },
                { name: '자주 묻는 질문', href: '/faq' },
                { name: '이용 가이드', href: '/guide' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 transition-colors hover:text-[#F58733]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">회사</h3>
            <ul className="space-y-3">
              {[
                { name: '회사 소개', href: '/about' },
                { name: '팀', href: '/team' },
                { name: '채용', href: '/careers' },
                { name: '블로그', href: '/blog' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 transition-colors hover:text-[#F58733]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">고객지원</h3>
            <ul className="space-y-3">
              {[
                { name: '고객센터', href: '/support' },
                { name: '문의하기', href: '/contact' },
                { name: '개인정보처리방침', href: '/privacy' },
                { name: '이용약관', href: '/terms' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 transition-colors hover:text-[#F58733]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} WhiteMouseDev. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
