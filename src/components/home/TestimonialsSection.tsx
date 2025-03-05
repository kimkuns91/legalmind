'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

import { motion } from 'framer-motion';

const testimonials = [
  {
    name: '김민수',
    role: '개인 사용자',
    content:
      '임대차 계약 관련 문제로 고민이 많았는데, 해주세요의 상담으로 명확한 해결책을 찾을 수 있었습니다. 전문 변호사와 상담한 것처럼 정확하고 이해하기 쉬운 답변이 인상적이었습니다.',
    avatar: '/images/avatars/avatar-1.png',
  },
  {
    name: '이지영',
    role: '소상공인',
    content:
      '사업장 계약 문제로 급하게 법률 자문이 필요했는데, 24시간 이용 가능한 해주세요 덕분에 빠르게 대응할 수 있었습니다. 비용 부담 없이 전문적인 법률 정보를 얻을 수 있어 매우 만족스럽습니다.',
    avatar: '/images/avatars/avatar-2.png',
  },
  {
    name: '박준호',
    role: 'IT 기업 법무팀',
    content:
      '법무팀 업무에 해주세요를 보조 도구로 활용하고 있습니다. 기초적인 법률 검토를 AI가 처리해주니 업무 효율이 크게 향상되었습니다. 특히 계약서 검토 시 놓칠 수 있는 부분을 짚어주어 큰 도움이 됩니다.',
    avatar: '/images/avatars/avatar-3.png',
  },
];

export default function TestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">사용자 후기</h2>
          <p className="text-xl text-gray-600">
            <span className="font-medium">해주세요</span> 통해 법률 문제를 해결한 사용자들의 생생한
            후기를 확인하세요.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="mb-4 flex items-center"
                  >
                    <Avatar className="mr-4 h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-[#F58733] text-white">
                        {testimonial.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </motion.div>
                  <p className="text-gray-600">{testimonial.content}</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="mt-4 flex"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.svg
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="h-5 w-5 text-[#F58733]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
