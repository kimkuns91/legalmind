export interface ILegalTerm {
  id: number;
  term: string;
  english: string;
  description: string;
  category: string;
}

export const legalTerms: ILegalTerm[] = [
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
