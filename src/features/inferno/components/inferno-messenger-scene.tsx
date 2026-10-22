/** [DRAFT] Timed typing and deleted-message reveal; no wall-clock gating. */
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Text from '@/src/components/ui/text';
import type { SceneBlock } from '@/src/features/inferno/types/scene-block';
export default function InfernoMessengerScene({
  block,
  index,
  onDone,
}: {
  block: Extract<SceneBlock, { type: 'messenger' }>;
  index: number;
  onDone: () => void;
}) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const show = setTimeout(() => setStage(1), 450);
    const finish = setTimeout(() => {
      setStage(2);
      onDone();
    }, 1100);
    return () => {
      clearTimeout(show);
      clearTimeout(finish);
    };
  }, []);
  const current = block.messages[index];
  return (
    <View className="flex-1 rounded-[8px] bg-pink-100 px-[28px] py-[12px]">
      <Text variant="heading-h4" className="text-text-primary">
        {block.kind === 'group' ? '단체 대화' : '개인 대화'} · {block.roomName}
      </Text>
      <ScrollView className="flex-1" contentContainerClassName="gap-[12px] py-[12px]">
        {block.messages.slice(0, index + (stage > 0 ? 1 : 0)).map((message) => (
          <View
            key={message.id}
            className={`max-w-[90%] rounded-[8px] bg-default-white px-[14px] py-[4px] ${message.participantId === 'me' ? 'self-end' : 'self-start'}`}
          >
            <Text variant="body-xs" className="text-text-muted">
              {block.participants.find((person) => person.id === message.participantId)?.name}
            </Text>
            <Text variant="body-m" className="text-text-primary">
              {block.events[message.id] === 'deleted' && (message !== current || stage === 2)
                ? '삭제된 메시지입니다'
                : message.text}
            </Text>
            {block.events[message.id] === 'read' && (message !== current || stage === 2) ? (
              <Text variant="body-xs" className="text-text-muted">
                읽음
              </Text>
            ) : null}
          </View>
        ))}
        {stage === 0 || (current && block.events[current.id] === 'typing' && stage < 2) ? (
          <Text variant="body-s" className="text-text-muted">
            {block.participants.find((person) => person.id === current?.participantId)?.name} 입력
            중…
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
