import Link from 'next/link';

export const metadata = {
  title: '이용약관 | 해주세요',
  description: '해주세요의 이용약관에 대해 알아보세요.',
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">이용약관</h1>
          <p className="text-lg text-gray-600">
            <span className="font-medium">해주세요</span> 서비스 이용에 관한 약관입니다.
          </p>
          <div className="mt-6 text-sm text-gray-500">최종 업데이트: 2025년 03월 06일</div>
        </div>

        <div className="prose prose-lg mx-auto max-w-none text-gray-600">
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제1조 (목적)</h2>
            <p>
              이 약관은 <span className="font-medium">해주세요</span>(이하 &quot;회사&quot;라 함)가
              제공하는 법률 정보 서비스(이하 &quot;서비스&quot;라 함)의 이용과 관련하여 회사와
              이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제2조 (정의)</h2>
            <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                &quot;서비스&quot;란 회사가 제공하는 법률 정보 제공, 법률 상담, 법률 문서 작성 지원
                등의 서비스를 의미합니다.
              </li>
              <li>
                &quot;이용자&quot;란 회사의 서비스에 접속하여 이 약관에 따라 회사가 제공하는
                서비스를 이용하는 회원 및 비회원을 말합니다.
              </li>
              <li>
                &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를
                지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를
                말합니다.
              </li>
              <li>
                &quot;비회원&quot;이란 회원으로 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를
                말합니다.
              </li>
              <li>
                &quot;아이디(ID)&quot;란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가
                승인하는 문자와 숫자의 조합을 말합니다.
              </li>
              <li>
                &quot;비밀번호&quot;란 회원의 개인정보 보호를 위하여 회원 자신이 설정한 문자와
                숫자의 조합을 말합니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제3조 (약관의 게시와 개정)</h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </li>
              <li>
                회사는 &quot;약관의 규제에 관한 법률&quot;, &quot;정보통신망 이용촉진 및 정보보호
                등에 관한 법률&quot; 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수
                있습니다.
              </li>
              <li>
                회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께
                서비스 초기 화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만,
                이용자에게 불리한 약관의 개정의 경우에는 30일 이전부터 공지합니다.
              </li>
              <li>
                이용자는 개정된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있으며, 개정된
                약관의 효력 발생일 이후에도 서비스를 계속 사용할 경우 약관의 변경사항에 동의한
                것으로 간주됩니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제4조 (서비스의 제공 및 변경)</h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                회사는 다음과 같은 서비스를 제공합니다.
                <ul className="ml-6 list-disc">
                  <li>법률 정보 제공 서비스</li>
                  <li>법률 상담 서비스</li>
                  <li>법률 문서 작성 지원 서비스</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>
                회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수 있으며, 이 경우 변경된
                서비스의 내용과 제공일자를 명시하여 현행 서비스 내용과 함께 그 제공일자 7일 이전부터
                공지합니다.
              </li>
              <li>
                회사는 서비스 제공에 필요한 경우 정기점검을 실시할 수 있으며, 정기점검시간은 서비스
                제공화면에 공지한 바에 따릅니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              제5조 (서비스 이용계약의 성립)
            </h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                서비스 이용계약은 이용자가 약관의 내용에 대하여 동의를 하고 회사가 정한 가입 양식에
                따라 회원정보를 기입한 후 이용신청을 하고 회사가 이를 승낙함으로써 성립됩니다.
              </li>
              <li>
                회사는 다음 각 호에 해당하는 이용신청에 대하여는 승낙을 하지 않을 수 있습니다.
                <ul className="ml-6 list-disc">
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 요구하는 정보를 제공하지 않은 경우</li>
                  <li>만 14세 미만 아동이 법정대리인(부모 등)의 동의를 얻지 않은 경우</li>
                  <li>이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>기타 회사가 정한 이용신청 요건이 미비한 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제6조 (회원정보의 변경)</h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                회원은 개인정보 관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수
                있습니다.
              </li>
              <li>
                회원은 회원가입 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편
                또는 기타 방법으로 회사에 그 변경사항을 알려야 합니다.
              </li>
              <li>
                제2항의 변경사항을 회사에 알리지 않아 발생한 불이익에 대하여 회사는 책임을 지지
                않습니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제7조 (개인정보보호 의무)</h2>
            <p>
              회사는 &quot;정보통신망 이용촉진 및 정보보호 등에 관한 법률&quot;, &quot;개인정보
              보호법&quot; 등 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해
              노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법 및 회사의 개인정보처리방침이
              적용됩니다. 다만, 회사의 공식 사이트 이외의 링크된 사이트에서는 회사의
              개인정보처리방침이 적용되지 않습니다.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              제8조 (회원의 아이디 및 비밀번호의 관리에 대한 의무)
            </h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                회원의 아이디와 비밀번호에 관한 관리책임은 회원에게 있으며, 이를 제3자가 이용하도록
                하여서는 안 됩니다.
              </li>
              <li>
                회사는 회원의 아이디가 개인정보 유출 우려가 있거나, 반사회적 또는 미풍양속에
                어긋나거나 회사 및 회사의 운영자로 오인한 우려가 있는 경우, 해당 아이디의 이용을
                제한할 수 있습니다.
              </li>
              <li>
                회원은 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 이를
                즉시 회사에 통지하고 회사의 안내에 따라야 합니다.
              </li>
              <li>
                제3항의 경우에 해당 회원이 회사에 그 사실을 통지하지 않거나, 통지한 경우에도 회사의
                안내에 따르지 않아 발생한 불이익에 대하여 회사는 책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제9조 (회원의 의무)</h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                회원은 다음 각 호의 행위를 하여서는 안 됩니다.
                <ul className="ml-6 list-disc">
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>
                    외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에
                    공개 또는 게시하는 행위
                  </li>
                  <li>기타 불법적이거나 부당한 행위</li>
                </ul>
              </li>
              <li>
                회원은 관계법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항,
                회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를
                하여서는 안 됩니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              제10조 (서비스의 제공 및 중단)
            </h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</li>
              <li>
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한
                이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다. 이 경우 회사는
                제9조에 정한 방법으로 이용자에게 통지합니다. 다만, 회사가 사전에 통지할 수 없는
                부득이한 사유가 있는 경우 사후에 통지할 수 있습니다.
              </li>
              <li>
                회사는 서비스의 제공에 필요한 경우 정기점검을 실시할 수 있으며, 정기점검시간은
                서비스 제공화면에 공지한 바에 따릅니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제11조 (서비스 이용제한)</h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우,
                경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
              </li>
              <li>
                회사는 전항에도 불구하고, 명의도용, 저작권법 및 컴퓨터프로그램보호법을 위반한
                불법프로그램의 제공 및 운영방해, 정보통신망법을 위반한 불법통신 및 해킹,
                악성프로그램의 배포, 접속권한 초과행위 등과 같이 관련법을 위반한 경우에는 즉시
                영구이용정지를 할 수 있습니다.
              </li>
              <li>
                회사는 회원이 계속해서 3개월 이상 로그인하지 않는 경우, 회원정보의 보호 및 운영의
                효율성을 위해 이용을 제한할 수 있습니다.
              </li>
              <li>
                회사는 본 조의 이용제한 범위 내에서 제한의 조건 및 세부내용은 이용제한정책 및 개별
                서비스상의 운영정책에서 정하는 바에 의합니다.
              </li>
              <li>
                본 조에 따라 서비스 이용을 제한하거나 계약을 해지하는 경우에는 회사는 제9조에 따라
                통지합니다.
              </li>
              <li>
                회원은 본 조에 따른 이용제한 등에 대해 회사가 정한 절차에 따라 이의신청을 할 수
                있습니다. 이 때 이의가 정당하다고 회사가 인정하는 경우 회사는 즉시 서비스의 이용을
                재개합니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제12조 (책임제한)</h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는
                경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </li>
              <li>
                회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
              </li>
              <li>
                회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지
                않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </li>
              <li>
                회사는 회원이 게재한 정보, 자료, 사실의 신뢰도, 정확성 등 내용에 관하여는 책임을
                지지 않습니다.
              </li>
              <li>
                회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는
                책임이 면제됩니다.
              </li>
              <li>
                회사는 무료로 제공되는 서비스 이용과 관련하여 관련법에 특별한 규정이 없는 한 책임을
                지지 않습니다.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">제13조 (준거법 및 재판관할)</h2>
            <ol className="ml-6 list-decimal space-y-2">
              <li>회사와 회원 간 제기된 소송은 대한민국법을 준거법으로 합니다.</li>
              <li>
                회사와 회원간 발생한 분쟁에 관한 소송은 민사소송법 상의 관할법원에 제소합니다.
              </li>
            </ol>
          </section>

          <div className="mt-12 rounded-lg bg-orange-50 p-6">
            <h3 className="mb-4 text-xl font-semibold text-orange-700">문의하기</h3>
            <p className="text-orange-700">
              이용약관에 대한 문의사항이 있으시면 언제든지 연락주시기 바랍니다.
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
