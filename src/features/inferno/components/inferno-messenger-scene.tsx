/**
 * [DRAFT] 단톡방·개인톡. 메시지마다 `typing`(입력 중 표시 후 등장), `read`(읽음),
 * `deletedAfterSend`(보냈다 지움) 연출을 붙인다. 시간 조건(실제 시각)은 쓰지 않는다.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import Text from '@/src/components/ui/text';
import type { StoryBlock } from '@/src/features/inferno/types/story';

const SHOW_DELAY_MS = 450;
const SETTLE_DELAY_MS = 1100;

export default function InfernoMessengerScene({
  block,
  index,
  onDone,
}: {
  block: Extract<StoryBlock, { type: 'messenger' }>;
  index: number;
  onDone: () => void;
}) {
  /** 0: 입력 중, 1: 보냄, 2: 읽음·삭제까지 반영됨. */
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const show = setTimeout(() => setStage(1), SHOW_DELAY_MS);
    const settle = setTimeout(() => {
      setStage(2);
      onDone();
    }, SETTLE_DELAY_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(settle);
    };
  }, []);
  const current = block.messages[index];
  const shown = block.messages.slice(0, index + (stage > 0 ? 1 : 0));
  return (
    <View className="flex-1 rounded-[8px] bg-pink-100 px-[28px] py-[12px]">
      <Text variant="heading-h4" className="text-text-primary">
        {block.kind === 'group' ? '단체 대화' : '개인 대화'} · {block.roomName}
      </Text>
      <ScrollView className="flex-1" contentContainerClassName="gap-[12px] py-[12px]">
        {shown.map((message) => {
          const settled = message !== current || stage === 2;
          if (message.kind === 'narration')
            return (
              <Text key={message.id} variant="body-xs" className="text-center text-text-muted">
                {message.text}
              </Text>
            );
          return (
            <View
              key={message.id}
              className={`max-w-[90%] rounded-[8px] bg-default-white px-[14px] py-[4px] ${message.side === 'right' ? 'self-end' : 'self-start'}`}
            >
              <Text variant="body-xs" className="text-text-muted">
                {block.participants.find((person) => person.id === message.participantId)?.name}
              </Text>
              <Text variant="body-m" className="text-text-primary">
                {message.deletedAfterSend && settled ? '삭제된 메시지입니다' : message.text}
              </Text>
              {message.read && settled ? (
                <Text variant="body-xs" className="text-text-muted">
                  읽음
                </Text>
              ) : null}
            </View>
          );
        })}
        {current && current.kind !== 'narration' && (stage === 0 || (current.typing && stage < 2)) ? (
          <Text variant="body-s" className="text-text-muted">
            {block.participants.find((person) => person.id === current.participantId)?.name} 입력
            중…
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
