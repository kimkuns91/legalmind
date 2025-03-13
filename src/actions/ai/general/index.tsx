import { ClientMessage, IMessageContent, ServerMessage } from '../types';
import { createStreamableValue, getMutableAIState, streamUI } from 'ai/rsc';

import { TextStreamMessage } from '@/components/ai/Message';
import { anthropic } from '@ai-sdk/anthropic';
import { generateId } from 'ai';
import { serverMessageToCoreMessage } from '../utils';

export async function handleGeneralMode(
  history: ReturnType<typeof getMutableAIState>
): Promise<ClientMessage> {
  console.log('========== 일반 법률 대화 모드 ==========');

  const messages = history.get() as ServerMessage[];

  const textStream = createStreamableValue('');
  const textComponent = <TextStreamMessage textStream={textStream.value} />;

  await streamUI({
    model: anthropic('claude-3-7-sonnet-20250219'),
    system: `
    당신의 이름은 "해주세요 AI"입니다.
    당신은 법률 상담 AI 비서입니다. 사용자의 법률 질문에 친절하고 정확하게 답변해주세요.
    한국 법률에 기반하여 답변하되, 법률 조언이 아닌 법률 정보를 제공한다는 점을 명시하세요.
    답변은 한국어로 제공하며, 전문 용어는 가능한 쉽게 설명해주세요.
    마크다운 형식을 사용하여 표, 코드블록, 볼드체 등 다양한 포맷을 활용해 답변하세요.
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
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: textComponent,
  };
}
