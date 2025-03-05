'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

// export const metadata: Metadata = {
//   title: '이용가이드 | 해주세요',
//   description: '해주세요 서비스 이용 방법을 안내합니다.',
// };

interface IGuideStep {
  title: string;
  description: string;
  steps: string[];
  tip: string;
}

interface IFaqItem {
  question: string;
  answer: string;
}

const GuidePage = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const guideSteps: IGuideStep[] = [
    {
      title: 'Step 1: 회원가입 및 로그인',
      description: '서비스 이용을 위한 첫 단계',
      steps: [
        '홈페이지 우측 상단의 회원가입 버튼을 클릭합니다.',
        '이메일, 비밀번호 등 필요한 정보를 입력합니다.',
        '이메일 인증을 완료합니다.',
        '로그인하여 서비스를 이용할 수 있습니다.',
      ],
      tip: '소셜 로그인(구글, 네이버 등)을 통해 더 간편하게 가입할 수도 있습니다.',
    },
    {
      title: 'Step 2: 질문하기',
      description: '법률 질문 작성 방법',
      steps: [
        '메인 페이지 또는 채팅 페이지에서 질문을 입력합니다.',
        '가능한 구체적이고 명확하게 상황을 설명해 주세요.',
        '관련 법률, 조항 등을 알고 있다면 함께 언급해 주세요.',
        '질문 전송 버튼을 클릭하면 AI가 답변을 생성합니다.',
      ],
      tip: '질문이 구체적일수록 더 정확한 답변을 받을 수 있습니다.',
    },
    {
      title: 'Step 3: 답변 활용하기',
      description: 'AI 답변 이해하고 활용하기',
      steps: [
        'AI가 제공한 답변을 꼼꼼히 읽어보세요.',
        '관련 법률 조항이나 판례가 언급된 경우 참고하세요.',
        '추가 질문이 있다면 이어서 질문할 수 있습니다.',
        '필요한 경우 답변을 저장하거나 공유할 수 있습니다.',
      ],
      tip: '답변 내용 중 이해가 어려운 부분은 추가 질문을 통해 더 자세히 알아볼 수 있습니다.',
    },
    {
      title: 'Step 4: 대화 기록 관리',
      description: '상담 내역 확인 및 관리',
      steps: [
        '마이페이지에서 과거 상담 내역을 확인할 수 있습니다.',
        '중요한 상담은 북마크하여 쉽게 찾을 수 있습니다.',
        '필요 없는 상담 기록은 삭제할 수 있습니다.',
        '상담 내용은 PDF로 내보내기가 가능합니다.',
      ],
      tip: '모든 상담 기록은 안전하게 암호화되어 저장됩니다.',
    },
  ];

  const faqItems: IFaqItem[] = [
    {
      question: '해주세요의 답변은 법적 효력이 있나요?',
      answer:
        '해주세요의 답변은 법적 효력이 없으며, 참고용 정보로만 활용해 주세요. 정확한 법률 자문은 반드시 변호사와 상담하시기 바랍니다.',
    },
    {
      question: '무료로 이용할 수 있나요?',
      answer:
        '기본적인 기능은 무료로 이용 가능하지만, 고급 기능과 무제한 상담은 유료 구독 서비스를 통해 제공됩니다. 자세한 내용은 요금제 페이지를 참고해 주세요.',
    },
    {
      question: '개인정보는 안전하게 보호되나요?',
      answer:
        '네, 모든 개인정보와 상담 내용은 암호화되어 안전하게 보관됩니다. 자세한 내용은 개인정보처리방침을 참고해 주세요.',
    },
    {
      question: '오류나 문제가 발생하면 어떻게 해야 하나요?',
      answer:
        '고객지원 페이지를 통해 문의하시면 빠르게 도움을 드리겠습니다. 또는 support@haejuseyo.com으로 이메일을 보내주셔도 됩니다.',
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            <span className="font-medium text-[#FF7F50]">해주세요</span> 이용가이드
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            해주세요 서비스를 효과적으로 활용하는 방법을 안내합니다.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-4xl rounded-3xl bg-gradient-to-r from-orange-50 to-orange-100 p-8 shadow-sm sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">서비스 소개</h2>
          <p className="mt-4 text-lg leading-8 text-gray-700">
            해주세요는 법률 질문에 대한 답변을 AI 기술을 활용하여 제공하는 서비스입니다. 복잡한 법률
            문제에 대한 기초적인 이해와 방향성을 제시해 드립니다.
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            ※ 해주세요의 답변은 법률 조언이 아닌 참고용 정보로만 활용해 주세요. 정확한 법률 자문은
            변호사와 상담하시기 바랍니다.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-y-10 sm:mt-20 sm:gap-y-8 md:grid-cols-2 md:gap-x-8">
          {guideSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative flex h-full flex-col rounded-3xl bg-white p-8 ring-1 ring-gray-200 hover:shadow-md"
            >
              <div className="mb-4">
                <h3 className="text-xl leading-8 font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
              </div>

              <div className="mt-2 flex-1">
                <ol className="list-inside list-decimal space-y-4">
                  {step.steps.map((item, index) => (
                    <motion.li
                      key={index}
                      className="text-sm leading-6 font-medium text-gray-900"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </ol>
                <p className="mt-4 text-sm leading-6 text-gray-600 italic">💡 {step.tip}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mx-auto mt-24 max-w-4xl rounded-3xl bg-gray-50 p-8 ring-1 ring-gray-200 sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">자주 묻는 질문 (FAQ)</h2>
          <div className="mt-8 grid gap-y-6">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="rounded-xl border border-gray-200 bg-white shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ scale: 1.01 }}
              >
                <motion.button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full cursor-pointer items-center justify-between p-6 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-base leading-7 font-semibold text-gray-900">
                    {item.question}
                  </h3>
                  <motion.span
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl text-orange-500"
                  >
                    ↓
                  </motion.span>
                </motion.button>
                <motion.div
                  animate={{
                    height: expandedFaq === index ? 'auto' : 0,
                    opacity: expandedFaq === index ? 1 : 0,
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden px-6"
                  style={{ paddingBottom: expandedFaq === index ? '1.5rem' : 0 }}
                >
                  <p className="text-sm leading-7 text-gray-600">{item.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-24 max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            지금 바로 <span className="font-bold text-[#FF7F50]">해주세요</span>와 함께하세요
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            법률 문제 해결을 위한 첫 걸음,{' '}
            <span className="font-bold text-[#FF7F50]">해주세요</span>가 함께합니다.
          </p>
          <motion.div
            className="mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Link href="/ai">
              <Button className="cursor-pointer bg-orange-500 px-8 py-6 text-base font-bold text-white hover:bg-orange-600">
                무료로 시작하기
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-gray-600">
            추가 문의사항이 있으시면 언제든지 고객지원 센터로 연락해 주세요.
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            이메일: support@haejuseyo.com | 전화: 02-123-4567 (평일 9:00-18:00)
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default GuidePage;
