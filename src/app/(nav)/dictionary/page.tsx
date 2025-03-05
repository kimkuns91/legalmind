'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState } from 'react';

// export const metadata = {
//   title: '법률 용어 사전 | LegalMind',
//   description:
//     '법률 용어를 쉽게 이해할 수 있는 용어 사전입니다. 알파벳 순으로 정리된 법률 용어와 그 설명을 제공합니다.',
// };

// 법률 용어 데이터 (알파벳 순으로 정렬)
const legalTerms = [
  {
    id: 1,
    term: '가압류',
    english: 'Provisional Attachment',
    description:
      '채권자가 채무자의 재산을 확보하기 위해 법원에 신청하는 임시적인 조치로, 채무자가 재산을 처분하지 못하도록 하는 제도입니다.',
    category: '민사소송',
  },
  {
    id: 2,
    term: '가처분',
    english: 'Provisional Disposition',
    description:
      '본안 소송의 판결 전에 권리나 법률관계에 대한 임시적인 지위를 정하는 법원의 결정입니다.',
    category: '민사소송',
  },
  {
    id: 3,
    term: '가족관계증명서',
    english: 'Family Relation Certificate',
    description:
      '개인의 가족관계에 관한 사항을 증명하는 공문서로, 출생, 혼인, 입양, 사망 등의 정보가 포함됩니다.',
    category: '가족법',
  },
  {
    id: 4,
    term: '각하',
    english: 'Dismissal',
    description: '소송 요건이 갖추어지지 않아 본안 심리 없이 소송을 종결시키는 법원의 판단입니다.',
    category: '소송절차',
  },
  {
    id: 5,
    term: '갑질',
    english: 'Gapjil',
    description:
      '사회적, 경제적 우위에 있는 사람이 약자에게 행하는 부당한 행위나 갑을 관계에서의 권력 남용을 의미합니다.',
    category: '사회법',
  },
  {
    id: 6,
    term: '개인정보',
    english: 'Personal Information',
    description:
      '살아 있는 개인에 관한 정보로서 성명, 주민등록번호 등을 통해 개인을 식별할 수 있는 정보를 말합니다.',
    category: '정보법',
  },
  {
    id: 7,
    term: '계약',
    english: 'Contract',
    description: '둘 이상의 당사자 간에 법적 구속력이 있는 합의를 말합니다.',
    category: '계약법',
  },
  {
    id: 8,
    term: '공증',
    english: 'Notarization',
    description: '법률행위나 사실을 공증인이 인증하여 그 진정성을 보장하는 제도입니다.',
    category: '공증법',
  },
  {
    id: 9,
    term: '과실',
    english: 'Negligence',
    description: '주의의무를 위반하여 발생한 결과에 대한 책임을 말합니다.',
    category: '불법행위법',
  },
  {
    id: 10,
    term: '구속',
    english: 'Detention',
    description: '형사 절차에서 피의자나 피고인의 신체의 자유를 제한하는 강제 처분입니다.',
    category: '형사소송',
  },
  {
    id: 11,
    term: '금치산자',
    english: 'Person under Full Guardianship',
    description:
      '질병, 장애, 노령 등의 이유로 사무를 처리할 능력이 지속적으로 결여된 사람에 대해 법원이 선고한 상태입니다.',
    category: '민법',
  },
  {
    id: 12,
    term: '기소',
    english: 'Indictment',
    description: '검사가 법원에 형사사건의 심판을 청구하는 소송행위입니다.',
    category: '형사소송',
  },
  {
    id: 13,
    term: '내용증명',
    english: 'Content-Certified Mail',
    description:
      '우체국에서 특정 내용의 문서를 발송했다는 사실과 그 발송 시기를 증명하는 제도입니다.',
    category: '민사소송',
  },
  {
    id: 14,
    term: '대리인',
    english: 'Agent',
    description: '타인의 이름으로 법률행위를 할 수 있는 권한을 가진 사람을 말합니다.',
    category: '민법',
  },
  {
    id: 15,
    term: '명예훼손',
    english: 'Defamation',
    description: '사실 또는 허위의 사실을 유포하여 타인의 명예를 훼손하는 행위입니다.',
    category: '형법',
  },
  {
    id: 16,
    term: '무고',
    english: 'False Accusation',
    description:
      '타인으로 하여금 형사처분이나 징계처분을 받게 할 목적으로 거짓으로 신고하는 행위입니다.',
    category: '형법',
  },
  {
    id: 17,
    term: '배상',
    english: 'Compensation',
    description: '불법행위로 인한 손해를 금전적으로 보상하는 것을 말합니다.',
    category: '민법',
  },
  {
    id: 18,
    term: '보석',
    english: 'Bail',
    description: '구속된 피고인이 일정한 조건 하에 석방되는 제도입니다.',
    category: '형사소송',
  },
  {
    id: 19,
    term: '상속',
    english: 'Inheritance',
    description:
      '사망한 사람의 재산상 권리와 의무가 생존하는 다른 사람에게 이전되는 것을 말합니다.',
    category: '상속법',
  },
  {
    id: 20,
    term: '소멸시효',
    english: 'Statute of Limitations',
    description:
      '권리를 행사할 수 있는 때부터 일정 기간 동안 권리를 행사하지 않으면 그 권리가 소멸하는 제도입니다.',
    category: '민법',
  },
  {
    id: 21,
    term: '양도',
    english: 'Transfer',
    description: '권리나 의무를 타인에게 이전하는 행위를 말합니다.',
    category: '민법',
  },
  {
    id: 22,
    term: '유언',
    english: 'Will',
    description: '사망 후 재산의 처분 등에 관한 의사를 생전에 표시하는 법률행위입니다.',
    category: '상속법',
  },
  {
    id: 23,
    term: '이혼',
    english: 'Divorce',
    description: '법적으로 성립된 혼인관계를 해소하는 것을 말합니다.',
    category: '가족법',
  },
  {
    id: 24,
    term: '저작권',
    english: 'Copyright',
    description: '문학, 예술, 학술 등의 창작물에 대해 창작자가 가지는 배타적 권리입니다.',
    category: '지식재산권',
  },
  {
    id: 25,
    term: '증거',
    english: 'Evidence',
    description: '사실의 진위를 증명하기 위해 제시되는 자료나 정보를 말합니다.',
    category: '소송절차',
  },
  {
    id: 26,
    term: '친권',
    english: 'Parental Authority',
    description: '미성년 자녀에 대해 부모가 가지는 권리와 의무를 말합니다.',
    category: '가족법',
  },
  {
    id: 27,
    term: '파산',
    english: 'Bankruptcy',
    description:
      '채무자가 채무를 변제할 수 없는 상태에 이르렀을 때 법원의 선고에 의해 재산관계를 정리하는 절차입니다.',
    category: '도산법',
  },
  {
    id: 28,
    term: '항소',
    english: 'Appeal',
    description: '제1심 법원의 판결에 불복하여 제2심 법원에 재심리를 청구하는 것을 말합니다.',
    category: '소송절차',
  },
  {
    id: 29,
    term: '형사보상',
    english: 'Criminal Compensation',
    description:
      '무죄판결을 받은 사람이 구금으로 인해 입은 손해에 대해 국가로부터 받는 보상을 말합니다.',
    category: '형사소송',
  },
  {
    id: 30,
    term: '후견인',
    english: 'Guardian',
    description: '미성년자나 피성년후견인의 법률행위를 대리하거나 동의하는 사람을 말합니다.',
    category: '민법',
  },
];

// 한글 초성 배열
const koreanInitials = [
  'ㄱ',
  'ㄴ',
  'ㄷ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅅ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

// 한글 초성 추출 함수
const getKoreanInitial = (char: string) => {
  const code = char.charCodeAt(0);
  if (code < 44032 || code > 55203) return null;
  return koreanInitials[Math.floor((code - 44032) / 588)];
};

// 용어를 초성별로 그룹화하는 함수
const groupTermsByInitial = (terms: typeof legalTerms) => {
  const groups: Record<string, typeof legalTerms> = {};

  koreanInitials.forEach(initial => {
    groups[initial] = terms.filter(term => {
      const termInitial = getKoreanInitial(term.term[0]);
      return termInitial === initial;
    });
  });

  return groups;
};

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeInitial, setActiveInitial] = useState<string | null>(null);

  // 검색어에 따른 필터링
  const filteredTerms = searchTerm
    ? legalTerms.filter(
        term =>
          term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : legalTerms;

  // 초성별로 그룹화
  const groupedTerms = groupTermsByInitial(filteredTerms);

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">법률 용어 사전</h1>
          <p className="text-lg text-gray-600">
            어려운 법률 용어를 쉽게 이해할 수 있도록 정리했습니다.
          </p>
        </div>

        {/* 검색 바 */}
        <div className="mb-10">
          <div className="relative mx-auto max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-white p-4 pl-10 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
              placeholder="용어 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 초성 인덱스 */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {koreanInitials.map(initial => (
            <button
              key={initial}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeInitial === initial
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => {
                setActiveInitial(initial === activeInitial ? null : initial);
                setSearchTerm('');
              }}
            >
              {initial}
            </button>
          ))}
          <button
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeInitial === null && searchTerm === ''
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              setActiveInitial(null);
              setSearchTerm('');
            }}
          >
            전체
          </button>
        </div>

        {/* 용어 목록 */}
        <div className="space-y-12">
          {activeInitial ? (
            <div>
              <h2 className="mb-6 inline-block border-b-2 border-orange-500 pb-2 text-2xl font-bold text-gray-900">
                {activeInitial}
              </h2>
              {groupedTerms[activeInitial].length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {groupedTerms[activeInitial].map(term => (
                    <div
                      key={term.id}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                          {term.category}
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-gray-500 italic">{term.english}</p>
                      <p className="text-gray-600">{term.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">해당 초성으로 시작하는 용어가 없습니다.</p>
              )}
            </div>
          ) : searchTerm ? (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">검색 결과</h2>
              {filteredTerms.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredTerms.map(term => (
                    <div
                      key={term.id}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                          {term.category}
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-gray-500 italic">{term.english}</p>
                      <p className="text-gray-600">{term.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
              )}
            </div>
          ) : (
            koreanInitials.map(initial => (
              <div key={initial}>
                {groupedTerms[initial].length > 0 && (
                  <>
                    <h2 className="mb-6 inline-block border-b-2 border-orange-500 pb-2 text-2xl font-bold text-gray-900">
                      {initial}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                      {groupedTerms[initial].map(term => (
                        <div
                          key={term.id}
                          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                              {term.category}
                            </span>
                          </div>
                          <p className="mb-4 text-sm text-gray-500 italic">{term.english}</p>
                          <p className="text-gray-600">{term.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* 하단 안내 */}
        <div className="mt-16 rounded-lg bg-orange-50 p-6">
          <div className="text-center">
            <h3 className="mb-4 text-xl font-semibold text-orange-700">
              찾으시는 용어가 없으신가요?
            </h3>
            <p className="mb-6 text-orange-700">
              더 많은 법률 용어나 상세한 설명이 필요하시면 문의해 주세요.
            </p>
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
  );
}
