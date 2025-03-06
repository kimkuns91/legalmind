import LegalDictionary from '@/components/dictionary/LegalDictionary';

export const metadata = {
  title: '법률 용어 사전 | 해주세요',
  description:
    '법률 용어를 쉽게 이해할 수 있는 용어 사전입니다. 초성별로 정리된 법률 용어와 그 설명을 제공합니다.',
  keywords: '법률 용어, 법률 사전, 법률 용어 설명, 법률 용어 정의, 법률 용어 검색',
};

export default function DictionaryPage() {
  return <LegalDictionary />;
}
