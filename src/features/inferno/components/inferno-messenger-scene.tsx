/**
 * [DRAFT] 단톡방·개인톡. Figma `채팅방` (7866:4305).
 *
 * 분홍(pink/100) 바탕 위 가운데에 방 이름과 인원 수, 그 아래로 메시지가 한 줄씩 쌓인다. 메시지마다
 * `typing`(입력 중 표시 후 등장), `read`(읽으면 안 읽은 수가 사라짐), `deletedAfterSend`(보냈다 지움)
 * 연출을 붙인다. 시각은 서버 `sentAtLabel` 을 쓰고, 없으면 이야기 속 시각으로 보여준다(utils/format.ts formatStoryClock).
 */
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoMessengerLine from '@/src/features/inferno/components/inferno-messenger-line';
import type { StoryBlock } from '@/src/features/inferno/types/story';
import { formatStoryClock } from '@/src/features/inferno/utils/format';

const SHOW_DELAY_MS = 450;
const SETTLE_DELAY_MS = 1100;

type MessengerBlock = Extract<StoryBlock, { type: 'messenger' }>;

/** 아직 안 읽은 사람 수. 읽었으면 0. 단톡방은 나를 뺀 인원, 개인톡은 상대 한 명. */
function unreadOf(block: MessengerBlock, read: boolean): number {
  if (read) return 0;
  return block.kind === 'group' ? Math.max(0, block.participants.length - 1) : 1;
}

export default function InfernoMessengerScene({
  block,
  index,
  onDone,
}: {
  block: MessengerBlock;
  index: number;
  onDone: () => void;
}) {
  /**
   * 0: 입력 중, 1: 보냄, 2: 읽음·삭제까지 반영됨. 줄이 바뀌어도 장면은 다시 마운트되지 않으므로
   * (스크롤 자리를 지키려고, inferno-episode-body 의 key) 어느 줄의 단계인지 같이 들고 있다가
   * 다른 줄이면 0 으로 본다.
   */
  const [progress, setProgress] = useState({ index, stage: 0 });
  const stage = progress.index === index ? progress.stage : 0;
  const scrollRef = useRef<ScrollView>(null);

  // 한 줄이 입력 중 → 보냄 → 읽음 순으로 지나가는 연출 타이머라 effect 에서 한다. 줄마다 다시 건다.
  useEffect(() => {
    const show = setTimeout(() => setProgress({ index, stage: 1 }), SHOW_DELAY_MS);
    const settle = setTimeout(() => {
      setProgress({ index, stage: 2 });
      onDone();
    }, SETTLE_DELAY_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(settle);
    };
  }, [index]);

  function handleContentSizeChange() {
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  const current = block.messages[index];
  const shown = block.messages.slice(0, index + (stage > 0 ? 1 : 0));
  const typingName =
    current && current.kind !== 'narration' && (stage === 0 || (current.typing && stage < 2))
      ? block.participants.find((person) => person.id === current.participantId)?.name
      : undefined;

  return (
    <View className="flex-1 bg-pink-100">
      {/* Figma 7866:4554: 방 이름은 폭 161 칸 가운데, 칸과 인원 수 사이 12. */}
      <View className="flex-row items-center justify-center gap-[12px] pt-[22px]">
        <Text variant="body-m" className="min-w-[161px] text-center text-text-primary">
          {block.roomName}
        </Text>
        <Text variant="body-m" className="text-text-muted">
          {block.participants.length}
        </Text>
      </View>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        // 간격은 Figma 채팅방(7866:4305)에서 잰 값: 좌우 60, 방 이름 아래 13. 메시지 사이는 시안에서 0(줄이 바로
        // 붙는다)이었는데, 말풍선이 붙어 보여서 12 를 띄웠다(사용자 요청).
        contentContainerClassName="gap-[12px] px-[60px] pb-[16px] pt-[13px]"
        onContentSizeChange={handleContentSizeChange}
      >
        {shown.map((message, position) => {
          const settled = message !== current || stage === 2;
          if (message.kind === 'narration')
            return (
              <Text key={message.id} variant="body-xs" className="text-center text-text-muted">
                {message.text}
              </Text>
            );
          return (
            <InfernoMessengerLine
              key={message.id}
              message={message}
              sender={block.participants.find((person) => person.id === message.participantId)}
              clock={message.sentAtLabel ?? formatStoryClock(position)}
              unread={unreadOf(block, message.read && settled)}
              deleted={message.deletedAfterSend && settled}
            />
          );
        })}
        {typingName ? (
          <Text variant="body-xxs" className="text-text-muted">
            {typingName} 입력 중…
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
