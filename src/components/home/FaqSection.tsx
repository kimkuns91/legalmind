'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { motion } from 'framer-motion';

export default function FaqSection() {
  const faqs = [
    {
      question: "'해주세요'는 어떤 법률 분야를 다루나요?",
      answer:
        "'해주세요'는 민사, 형사, 가족, 부동산, 노동, 상법 등 다양한 법률 분야에 대한 상담을 제공합니다. 전문적인 지식이 필요한 특수 분야의 경우 전문 변호사를 연결해 드립니다.",
    },
    {
      question: "'해주세요'의 답변은 법적 효력이 있나요?",
      answer:
        "'해주세요'의 답변은 법률 정보 제공을 목적으로 하며, 공식적인 법적 조언으로 간주되지 않습니다. 중요한 법적 결정을 내리기 전에는 반드시 변호사와 상담하시기 바랍니다.",
    },
    {
      question: '무료로 사용할 수 있나요?',
      answer:
        '기본적인 법률 상담은 무료로 제공됩니다. 더 심층적인 분석이나 지속적인 법률 지원이 필요한 경우 프리미엄 요금제를 이용하실 수 있습니다.',
    },
    {
      question: '개인정보는 안전하게 보호되나요?',
      answer:
        "네, '해주세요'는 사용자의 개인정보와 상담 내용을 철저히 보호합니다. 모든 데이터는 암호화되어 저장되며, 법적 요구가 있는 경우를 제외하고는 제3자에게 공개되지 않습니다.",
    },
    {
      question: '상담 내용은 얼마나 정확한가요?',
      answer:
        "'해주세요'는 최신 법률 데이터베이스와 AI 기술을 기반으로 정확한 정보를 제공하기 위해 노력합니다. 다만, 개별 사례의 특수성에 따라 실제 법률 적용은 달라질 수 있으므로, 중요한 사안은 전문가의 확인을 받으시기 바랍니다.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">자주 묻는 질문</h2>
          <p className="text-xl text-gray-600">서비스에 대해 궁금한 점이 있으신가요?</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto max-w-3xl"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants} custom={index}>
                <AccordionItem
                  value={`item-${index}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <AccordionTrigger className="cursor-pointer px-6 py-4 text-left text-lg font-semibold text-gray-900 hover:text-[#F58733]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
