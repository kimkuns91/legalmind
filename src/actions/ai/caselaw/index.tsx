import { ClientMessage, IMessageContent, ServerMessage } from '../types';
import { createStreamableValue, getMutableAIState, streamUI } from 'ai/rsc';

import CaseLaws from '@/components/ai/CaseLaws';
import { TextStreamMessage } from '@/components/ai/Message';
import { generateId } from 'ai';
import { getCaseLawsByKeyword } from './caselaw';
import { openai } from '@ai-sdk/openai';
import { serverMessageToCoreMessage } from '../utils';
import { z } from 'zod';

export async function handleCaseMode(
  history: ReturnType<typeof getMutableAIState>,
  caseKeywords: string[] = []
): Promise<ClientMessage> {
  console.log('========== 판례 검색 ==========');
  console.log('caseKeywords:', caseKeywords);

  const messages = history.get() as ServerMessage[];

  const textStream = createStreamableValue('');
  const textComponent = <TextStreamMessage textStream={textStream.value} />;

  const searchResult = await streamUI({
    model: openai('gpt-4-turbo'),
    system: `당신은 법률 판례 검색을 도와주는 전문 비서입니다. 
    사용자의 요청에 따라 다양한 판례를 검색하고, 필요한 정보를 친절하게 안내해드립니다.
    모든 응답은 한국어로 제공합니다.
    
    caseKeywords: ${caseKeywords.join(', ')}

    caseKeywords가 없다면 사용자에게 어떤 판례를 검색해야 하는지 물어보세요.
    `.trim(),
    messages: messages.map(serverMessageToCoreMessage),
    text: async function* ({ content, done }) {
      if (done) {
        const assistantMessageContent: IMessageContent[] = [{ type: 'text', text: content }];
        const newMessage: ServerMessage = {
          role: 'assistant',
          content: assistantMessageContent,
        };
        const updatedMessages = [...messages, newMessage];
        history.update(updatedMessages);
        history.done(updatedMessages);
        textStream.done();
      } else {
        textStream.update(content);
      }
      return textComponent;
    },
    tools: {
      getCaseLawsByKeyword: {
        description: '검색할 키워드 배열',
        parameters: z.object({
          keywords: z.array(z.string()).describe('검색할 키워드 배열'),
        }),
        generate: async function* ({ keywords }) {
          yield <div>판례 검색 중입니다...</div>;

          await new Promise(resolve => setTimeout(resolve, 1000));

          const results = await getCaseLawsByKeyword(keywords);

          if (results.length === 0) {
            yield <div>검색 결과가 없습니다.</div>;
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));

          yield <div>판례를 찾았습니다.</div>;

          const textContent = `판례 검색 결과입니다.`;

          const toolResultContent: IMessageContent[] = [
            {
              type: 'text',
              text: textContent,
            },
            {
              type: 'tool-result',
              toolName: 'get-case-laws-by-keyword',
              toolCallId: generateId(),
              result: results,
            },
            {
              type: 'ui',
              uiType: 'case-laws',
              uiData: results,
            },
          ];

          const newMessage: ServerMessage = {
            role: 'assistant',
            content: toolResultContent,
          };
          const updatedMessages = [...messages, newMessage];
          history.update(updatedMessages);
          history.done(updatedMessages);
          return <CaseLaws results={results} />;
        },
      },
    },
    temperature: 0.3,
    maxTokens: 2000,
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: searchResult.value,
  };
}
