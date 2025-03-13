'use client';

import { ICaseLaw } from '@/actions/ai/caselaw/caselaw';
import { cn } from '@/lib/utils';

interface CaseLawsProps {
  results: ICaseLaw[];
}

const CaseLaws = ({ results }: CaseLawsProps) => {
  if (!results || results.length === 0) {
    return <div className="text-muted-foreground py-8 text-center">검색된 판례가 없습니다.</div>;
  }

  const handleCaseLawClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-bold">검색된 판례 ({results.length}건)</h2>
      </div>

      <div className="grid gap-6">
        {results.map(caseLaw => (
          <article
            key={caseLaw.id}
            onClick={() => handleCaseLawClick(caseLaw.url)}
            className={cn(
              'rounded-xl border p-6 shadow-sm',
              'transition-all duration-200',
              'group cursor-pointer',
              'bg-card',
              'border-border',
              'hover:border-primary/20',
              'hover:shadow-md'
            )}
          >
            <div className="space-y-4">
              {/* 헤더 영역 */}
              <header className="flex items-start justify-between gap-4">
                <h3 className="text-foreground group-hover:text-primary text-lg font-semibold transition-colors">
                  {caseLaw.title}
                </h3>
                <div className="flex flex-col items-end text-sm">
                  <span className="text-primary font-medium">{caseLaw.court}</span>
                  <time
                    dateTime={caseLaw.decisionDate.toISOString()}
                    className="text-muted-foreground"
                  >
                    {new Date(caseLaw.decisionDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </header>

              {/* 판결 요지 */}
              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-foreground mb-2 text-sm font-medium">판결 요지</h4>
                <p className="text-muted-foreground line-clamp-3 text-sm">{caseLaw.content}</p>
              </div>

              {/* 판결 내용 */}
              <div>
                <h4 className="text-foreground mb-2 text-sm font-medium">판결 상세</h4>
                <div className="text-muted-foreground space-y-2 text-sm">
                  <p>
                    <span className="font-medium">사건번호:</span> {caseLaw.caseNumber}
                  </p>
                  <p className="line-clamp-3">{caseLaw.content}</p>
                </div>
              </div>

              {/* 키워드 및 링크 */}
              <footer className="border-border flex items-center justify-between border-t pt-2">
                <div className="flex flex-wrap gap-2">
                  {caseLaw.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <span className="text-primary text-sm group-hover:underline">자세히 보기 →</span>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default CaseLaws;
