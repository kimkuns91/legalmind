import Link from 'next/link';

export const metadata = {
  title: '개인정보처리방침 | 해주세요',
  description: '해주세요의 개인정보처리방침에 대해 알아보세요.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">개인정보처리방침</h1>
          <p className="text-lg text-gray-600">
            <span className="font-medium">해주세요</span>는 이용자의 개인정보를 소중히 여기며 관련
            법규를 준수합니다.
          </p>
          <div className="mt-6 text-sm text-gray-500">최종 업데이트: 2023년 12월 1일</div>
        </div>

        <div className="prose prose-lg mx-auto max-w-none text-gray-600">
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p>
              <span className="font-medium">해주세요</span>는 다음과 같은 목적으로 개인정보를
              수집하고 이용합니다:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>서비스 제공 및 계약 이행</li>
              <li>회원 관리 및 서비스 이용 기록 관리</li>
              <li>신규 서비스 개발 및 마케팅, 광고에의 활용</li>
              <li>법률 상담 및 자문 서비스 제공</li>
              <li>법적 분쟁 해결 및 민원 처리</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">2. 수집하는 개인정보 항목</h2>
            <p>
              <span className="font-medium">해주세요</span>는 서비스 제공을 위해 다음과 같은
              개인정보를 수집합니다:
            </p>
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      구분
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      수집 항목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      수집 방법
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      필수 항목
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      이름, 이메일 주소, 비밀번호, 휴대폰 번호
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">회원가입, 서비스 이용 과정</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      선택 항목
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      직업, 관심 법률 분야, 프로필 이미지
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">회원가입, 프로필 설정</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      자동 수집
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      서비스 이용 과정에서 자동 생성
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              <span className="font-medium">해주세요</span>는 원칙적으로 개인정보 수집 및 이용
              목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만, 관련 법령에 의해 보존할
              필요가 있는 경우 아래와 같이 관련 법령에서 정한 일정한 기간 동안 개인정보를
              보관합니다.
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)
              </li>
              <li>
                대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한
                법률)
              </li>
              <li>
                소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자 보호에 관한
                법률)
              </li>
              <li>로그인 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              4. 개인정보의 파기 절차 및 방법
            </h2>
            <p>
              <span className="font-medium">해주세요</span>는 개인정보 보유기간의 경과, 처리목적
              달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
            <p className="mt-2">
              <strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져
              내부 방침 및 관련 법령에 따라 일정 기간 저장된 후 혹은 즉시 파기됩니다.
            </p>
            <p className="mt-2">
              <strong>파기 방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적
              방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여
              파기합니다.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              5. 이용자 및 법정대리인의 권리와 그 행사 방법
            </h2>
            <p>
              이용자 및 법정대리인은 언제든지 등록되어 있는 자신 혹은 당해 만 14세 미만 아동의
              개인정보를 조회하거나 수정할 수 있으며, 회원탈퇴를 통해 개인정보 이용에 대한 동의 철회
              및 가입 해지를 요청할 수 있습니다.
            </p>
            <p className="mt-2">
              이용자의 개인정보 조회, 수정을 위해서는 &apos;개인정보 변경&apos;(또는 &apos;회원정보
              수정&apos; 등)을, 가입 해지(동의 철회)를 위해서는 &apos;회원탈퇴&apos;를 클릭하여 본인
              확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">6. 개인정보 보호책임자</h2>
            <p>
              <span className="font-medium">해주세요</span>는 개인정보 처리에 관한 업무를 총괄해서
              책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이
              개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p>
                <strong>개인정보 보호책임자</strong>
              </p>
              <p className="mt-2">이름: 김건우</p>
              <p>직위: 개인정보 보호팀장</p>
              <p>연락처: whitemousedev@gmail.com</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">7. 개인정보 처리방침 변경</h2>
            <p>
              이 개인정보처리방침은 2023년 12월 1일부터 적용됩니다. 법령 및 방침에 따른 변경내용의
              추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할
              것입니다.
            </p>
          </section>

          <div className="mt-12 rounded-lg bg-orange-50 p-6">
            <h3 className="mb-4 text-xl font-semibold text-orange-700">문의하기</h3>
            <p className="text-orange-700">
              개인정보 보호 관련 문의사항이 있으시면 언제든지 연락주시기 바랍니다.
            </p>
            <div className="mt-4">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
