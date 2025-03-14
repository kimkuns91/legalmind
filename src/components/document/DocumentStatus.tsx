'use client';

import { StreamableValue, useStreamableValue } from 'ai/rsc';

import React from 'react';

interface IDocumentStatusProps {
  textStream: StreamableValue;
}

const DocumentStatus: React.FC<IDocumentStatusProps> = ({ textStream }) => {
  const [value] = useStreamableValue(textStream);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <h3 className="text-lg font-medium">문서 생성 진행 상태</h3>
      </div>
      <div className="space-y-2">
        {value.includes('시작') && (
          <div className="flex items-center text-blue-600">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            문서 생성을 시작합니다
          </div>
        )}
        {value.includes('템플릿') && (
          <div className="flex items-center text-blue-600">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            템플릿 검색 중
          </div>
        )}
        {value.includes('PDF') && (
          <div className="flex items-center text-blue-600">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            PDF 파일 생성 중
          </div>
        )}
        {value.includes('완료') && (
          <div className="flex items-center text-green-600">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            문서 생성 완료!
          </div>
        )}
        {value.includes('오류') && (
          <div className="flex items-center text-red-600">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            오류가 발생했습니다
          </div>
        )}
      </div>
      <div className="text-sm break-words whitespace-pre-wrap text-gray-500">{value}</div>
    </div>
  );
};

export default DocumentStatus;
