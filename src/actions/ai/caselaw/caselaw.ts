export interface ICaseLaw {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  court: string;
  caseNumber: string;
  decisionDate: Date;
  url: string;
}
export const getCaseLawsByKeyword = async (keyword: string[]) => {
  // 판례 더미 데이터
  const caseLawDummyData: ICaseLaw[] = [
    {
      id: '1',
      title: '종합소득세 부과처분 취소 청구',
      content:
        '본 사건은 종합소득세 부과처분 취소를 청구한 것으로, 법원은 원고가 주장한 영세율과세표준 부정과소신고가산세 부과처분이 5년의 부과제척기간을 초과하여 위법함을 인정하였다...',
      keywords: ['종합소득세', '부과처분', '부과제척기간', '영세율과세표준'],
      court: '대법원',
      caseNumber: '2024두57262',
      decisionDate: new Date('2025-02-27'),
      url: 'https://taxlaw.nts.go.kr/pd/USEPDA002P.do?ntstDcmId=200000000000010394',
    },
    {
      id: '2',
      title: '부가가치세 부과처분 취소',
      content:
        '거래 당시 실제 공급자와 세금계산서상의 공급자가 다른 명의위장사실을 알지 못하였고, 이에 과실이 없는 특별한 사정이 있다면 사실과 다른 세금계산서로 보아 한 처분은 부적법하다.',
      keywords: ['부가가치세', '세금계산서', '명의위장', '부과처분'],
      court: '대법원',
      caseNumber: '2024두62615',
      decisionDate: new Date('2025-02-27'),
      url: 'https://taxlaw.nts.go.kr/pd/USEPDA002P.do?ntstDcmId=200000000000010395',
    },
    {
      id: '3',
      title: '부당 해고에 대한 복직 판결',
      content:
        '근로자가 부당 해고를 당한 사건으로, 법원은 해고가 부당함을 인정하고 원고의 복직과 미지급 급여 지급을 판결함.',
      keywords: ['부당 해고', '근로기준법', '복직'],
      court: '대법원',
      caseNumber: '2022다67890',
      decisionDate: new Date('2022-11-20'),
      url: 'https://laborlaw.court.go.kr/case/2022다67890',
    },
    {
      id: '4',
      title: '이혼 소송 및 재산분할',
      content:
        '부부간 이혼 소송에서 재산 분할을 다툰 사건으로, 법원은 기여도를 고려하여 재산을 6:4 비율로 분할하도록 판결.',
      keywords: ['이혼', '재산 분할', '위자료'],
      court: '서울가정법원',
      caseNumber: '2021드34567',
      decisionDate: new Date('2021-08-15'),
      url: 'https://familylaw.court.go.kr/case/2021드34567',
    },
    {
      id: '5',
      title: '사기죄 성립 여부',
      content:
        '피고인이 투자 사기를 저질렀다고 주장된 사건으로, 법원은 피고의 기망 행위를 인정하고 유죄를 선고함.',
      keywords: ['사기', '형법', '기망 행위'],
      court: '부산지방법원',
      caseNumber: '2023고4321',
      decisionDate: new Date('2023-06-25'),
      url: 'https://criminallaw.court.go.kr/case/2023고4321',
    },
    {
      id: '6',
      title: '저작권 침해 및 손해배상 청구',
      content:
        '음원 불법 복제 사건으로, 법원은 저작권 침해를 인정하고 피해자에게 손해배상을 지급할 것을 판결함.',
      keywords: ['저작권', '지적재산권', '손해배상'],
      court: '서울중앙지방법원',
      caseNumber: '2022나5678',
      decisionDate: new Date('2022-09-30'),
      url: 'https://ip.court.go.kr/case/2022나5678',
    },
    {
      id: '7',
      title: '상속 분쟁 및 유류분 반환 청구',
      content: '유류분 반환 청구 사건에서 법원은 상속 재산의 일부를 청구인에게 반환할 것을 명령함.',
      keywords: ['상속', '유류분', '재산 분쟁'],
      court: '대법원',
      caseNumber: '2023다4321',
      decisionDate: new Date('2023-02-14'),
      url: 'https://inheritance.court.go.kr/case/2023다4321',
    },
    {
      id: '8',
      title: '명예훼손 및 위자료 청구',
      content:
        '인터넷 커뮤니티에서 허위 사실 유포로 명예훼손을 당한 사건으로, 법원은 피고에게 위자료 지급을 명령.',
      keywords: ['명예훼손', '위자료', '허위사실'],
      court: '서울중앙지방법원',
      caseNumber: '2021나8901',
      decisionDate: new Date('2021-10-05'),
      url: 'https://media.court.go.kr/case/2021나8901',
    },
  ];

  // 키워드에 해당하는 판례 검색
  // 추후 DB에서 검색 결과 가져오기 (유사도 검색 추가 필요)
  const caseLaws = caseLawDummyData.filter(caseLaw =>
    keyword.some(k => caseLaw.keywords.includes(k))
  );

  return caseLaws;
};
