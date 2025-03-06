'use client';

import { ILegalTerm, legalTerms } from '@/constants/legalTerms';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

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
const groupTermsByInitial = (terms: ILegalTerm[]) => {
  const grouped: Record<string, ILegalTerm[]> = {};

  terms.forEach((term: ILegalTerm) => {
    const initial = getKoreanInitial(term.term[0]);
    if (initial) {
      if (!grouped[initial]) {
        grouped[initial] = [];
      }
      grouped[initial].push(term);
    }
  });

  return grouped;
};

export default function LegalDictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeInitial, setActiveInitial] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [groupedTerms, setGroupedTerms] = useState<Record<string, ILegalTerm[]>>({});

  useEffect(() => {
    setGroupedTerms(groupTermsByInitial(legalTerms));
  }, []);

  // 검색어나 활성 초성에 따라 필터링된 용어 목록
  const filteredTerms = searchTerm
    ? legalTerms.filter(
        (term: ILegalTerm) =>
          term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : activeInitial
      ? groupedTerms[activeInitial] || []
      : legalTerms;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">법률 용어 사전</h1>
          <p className="text-lg text-gray-600">
            법률 용어의 의미를 쉽게 찾아보세요. 초성별로 분류되어 있어 원하는 용어를 빠르게 찾을 수
            있습니다.
          </p>
        </div>

        {/* 검색창 */}
        <div className="mb-10">
          <div className="relative">
            <Input
              type="text"
              placeholder="법률 용어 검색..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                if (e.target.value) setActiveInitial(null);
              }}
              className="h-12 rounded-lg border-gray-300 pr-4 pl-12 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 초성 인덱스 */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {koreanInitials.map(initial => (
            <button
              key={initial}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium ${
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
            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium ${
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
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                &apos;{activeInitial}&apos; 시작 용어
              </h2>
              <div className="space-y-4">
                {filteredTerms.map((term: ILegalTerm, index: number) => (
                  <motion.div
                    key={term.term}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                  >
                    <div
                      className="cursor-pointer p-4"
                      onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{term.term}</h3>
                        <span className="text-gray-500">
                          {expandedTerm === term.term ? '▲' : '▼'}
                        </span>
                      </div>
                      {expandedTerm === term.term && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 text-gray-600"
                        >
                          <p>{term.description}</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            koreanInitials.map(initial => {
              const termsForInitial = searchTerm
                ? filteredTerms.filter(
                    (term: ILegalTerm) => getKoreanInitial(term.term[0]) === initial
                  )
                : groupedTerms[initial] || [];

              if (termsForInitial.length === 0) return null;

              return (
                <div key={initial}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    &apos;{initial}&apos; 시작 용어
                  </h2>
                  <div className="space-y-4">
                    {termsForInitial.map((term: ILegalTerm, index: number) => (
                      <motion.div
                        key={term.term}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                      >
                        <div
                          className="cursor-pointer p-4"
                          onClick={() =>
                            setExpandedTerm(expandedTerm === term.term ? null : term.term)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{term.term}</h3>
                            <span className="text-gray-500">
                              {expandedTerm === term.term ? '▲' : '▼'}
                            </span>
                          </div>
                          {expandedTerm === term.term && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.3 }}
                              className="mt-2 text-gray-600"
                            >
                              <p>{term.description}</p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
