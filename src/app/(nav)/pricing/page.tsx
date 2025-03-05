'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface IPricingFeature {
  text: string;
  included: boolean;
}

interface IPricingPlan {
  name: string;
  price: string;
  description: string;
  features: IPricingFeature[];
  buttonText: string;
  popular?: boolean;
}

interface IFaqItem {
  question: string;
  answer: string;
}

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const pricingPlans: IPricingPlan[] = [
    {
      name: '무료 체험',
      price: '0원',
      description: '법률 서비스를 처음 이용해보는 분들을 위한 기본 플랜',
      features: [
        { text: '기본 법률 질문 5회', included: true },
        { text: '법률 문서 템플릿 3개', included: true },
        { text: '기본 법률 정보 검색', included: true },
        { text: '커뮤니티 접근', included: true },
        { text: '전문 변호사 상담', included: false },
        { text: '맞춤형 법률 문서 작성', included: false },
      ],
      buttonText: '무료로 시작하기',
    },
    {
      name: '스탠다드',
      price: '29,900원',
      description: '개인 사용자를 위한 기본적인 법률 서비스',
      features: [
        { text: '무제한 법률 질문', included: true },
        { text: '법률 문서 템플릿 전체 이용', included: true },
        { text: '고급 법률 정보 검색', included: true },
        { text: '커뮤니티 접근', included: true },
        { text: '월 1회 전문 변호사 상담', included: true },
        { text: '맞춤형 법률 문서 작성', included: false },
      ],
      buttonText: '스탠다드 시작하기',
      popular: true,
    },
    {
      name: '프리미엄',
      price: '59,900원',
      description: '전문적인 법률 서비스가 필요한 개인 및 소규모 비즈니스',
      features: [
        { text: '무제한 법률 질문', included: true },
        { text: '법률 문서 템플릿 전체 이용', included: true },
        { text: '고급 법률 정보 검색', included: true },
        { text: '커뮤니티 접근', included: true },
        { text: '월 3회 전문 변호사 상담', included: true },
        { text: '맞춤형 법률 문서 작성', included: true },
      ],
      buttonText: '프리미엄 시작하기',
    },
  ];

  const faqItems: IFaqItem[] = [
    {
      question: '결제는 어떻게 이루어지나요?',
      answer:
        '신용카드, 체크카드, 계좌이체 등 다양한 결제 방법을 지원합니다. 구독은 매월 자동으로 갱신되며, 언제든지 취소할 수 있습니다.',
    },
    {
      question: '환불 정책은 어떻게 되나요?',
      answer:
        '구독 시작 후 7일 이내에 요청하시면 전액 환불해 드립니다. 그 이후에는 남은 기간에 대한 부분 환불이 가능합니다.',
    },
    {
      question: '요금제를 변경할 수 있나요?',
      answer:
        '네, 언제든지 요금제를 업그레이드하거나 다운그레이드할 수 있습니다. 변경 사항은 다음 결제 주기부터 적용됩니다.',
    },
    {
      question: '전문 변호사 상담은 어떻게 이용하나요?',
      answer:
        '스탠다드 이상의 요금제에서는 전문 변호사와의 상담이 포함되어 있습니다. 마이페이지에서 상담 예약을 진행할 수 있습니다.',
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
            합리적인 가격의 법률 서비스
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            필요한 만큼만 선택하세요. 언제든지 업그레이드하거나 다운그레이드할 수 있습니다.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-10 sm:mt-20 sm:gap-y-8 lg:max-w-4xl lg:grid-cols-3 lg:gap-x-8">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative flex h-full flex-col rounded-3xl p-8 ${
                plan.popular
                  ? 'z-10 bg-white shadow-xl ring-1 ring-orange-200 sm:-mx-4 sm:rounded-xl lg:-mx-4 lg:rounded-3xl'
                  : 'bg-white/60 ring-1 ring-gray-200 hover:shadow-md sm:mx-0 lg:mx-0'
              }`}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-5 right-0 left-0 mx-auto w-36 rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-bold text-white shadow-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  인기 선택
                </motion.div>
              )}

              <div className="mb-6">
                <h3 className="text-xl leading-8 font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-sm leading-6 font-semibold text-gray-600">/ 월</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">{plan.description}</p>
              </div>

              <div className="mt-2 flex-1">
                <ul role="list" className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <motion.li
                      key={feature.text}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <motion.div
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full ${
                          feature.included ? 'bg-orange-500' : 'bg-gray-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <Check
                          className={`h-4 w-4 ${feature.included ? 'text-white' : 'text-gray-400'}`}
                          aria-hidden="true"
                        />
                      </motion.div>
                      <span
                        className={`text-sm leading-6 font-medium ${
                          feature.included ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="mt-8"
              >
                <Button
                  className={`w-full cursor-pointer rounded-xl py-6 text-base font-bold ${
                    plan.popular
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mx-auto mt-24 max-w-2xl rounded-3xl bg-gradient-to-r from-orange-50 to-orange-100 p-8 text-center shadow-sm sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            기업 고객을 위한 맞춤형 요금제
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-700">
            대규모 기업이나 특별한 요구사항이 있으신가요?
          </p>
          <motion.div
            className="mt-6"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              className="cursor-pointer border-2 border-orange-500 bg-white px-6 py-5 text-base font-bold text-orange-500 hover:bg-orange-50"
            >
              기업 맞춤 요금제 문의하기
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto mt-24 max-w-4xl rounded-3xl bg-gray-50 p-8 ring-1 ring-gray-200 sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">자주 묻는 질문</h2>
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
            <span className="font-bold text-[#FF7F50]">해주세요</span>이 함께합니다.
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
      </div>
    </div>
  );
}
