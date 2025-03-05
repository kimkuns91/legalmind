'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HowToUseSection() {
  const steps = [
    {
      number: 1,
      title: '질문 입력하기',
      description: '상담 페이지에서 법률 관련 질문을 자연어로 입력하세요.',
    },
    {
      number: 2,
      title: 'AI 분석',
      description: 'AI가 질문을 분석하고 관련 법률 정보를 검색합니다.',
    },
    {
      number: 3,
      title: '답변 확인',
      description: '정확하고 이해하기 쉬운 법률 답변을 받아보세요.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">어떻게 사용하나요?</h2>
          <p className="text-xl text-gray-600">
            <span className="font-bold text-[#F58733]">해주세요</span>는 누구나 쉽게 사용할 수
            있습니다. 단 세 단계로 법률 상담을 시작해보세요.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="text-center">
              <motion.div
                initial={{ scale: 0.5, backgroundColor: '#FFF7ED' }}
                whileInView={{ scale: 1, backgroundColor: '#FEF2F2' }}
                whileHover={{ scale: 1.05, backgroundColor: '#FFEDD5' }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100"
              >
                <span className="text-2xl font-bold text-[#F58733]">{step.number}</span>
              </motion.div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg" className="bg-[#F58733] text-white hover:bg-[#E07722]">
              <Link href="/chat">지금 시작하기</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
