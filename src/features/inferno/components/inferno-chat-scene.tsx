import { useState } from 'react';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoChatRow from '@/src/features/inferno/components/inferno-chat-row';
import type { InfernoChatPage, InfernoParticipant } from '@/src/features/inferno/types';

interface InfernoChatSceneProps {
  page: InfernoChatPage;
  participants: InfernoParticipant[];
  /** 이 쪽의 마지막 줄까지 다 쳐졌을 때 알린다. */
  onPageDone?: () => void;
}

/**
 * 반죽들이 주고받는 대화 한 쪽. Figma `ep1-전체대화` (5425:886), `ep1-전체대화 끝` (6137:2782).
 *
 * 질문은 처음부터 떠 있고, 대화는 위에서부터 한 줄씩 쳐진다. 한 줄이 끝나야 다음 줄이
 * 나타나므로 화면에 있는 줄 수가 곧 진행도다.
 *
 * 아래 안내("대화가 종료되었습니다")는 마지막 줄까지 다 쳐진 뒤에 나온다. 대화가 아직
 * 이어지는 중에 종료 문구가 떠 있으면 말이 되지 않는다. 대화 묶음 아래에 붙어 있어서
 * 나중에 나타나도 위쪽이 밀리지 않는다.
 *
 * 줄 사이 간격이 없는 건 실수가 아니다(inferno-chat-row 주석 참고).
 *
 * 세로 여백은 시안 값을 그대로 쓴다. 시안 프레임(874x402)이 기준 기기 좌표와 같아서
 * 가운데 정렬로 뭉개지 않고 맞출 수 있다. 질문이 있는 쪽은 위 32, 안내가 있는 쪽은 위 20 으로
 * 시작 위치가 다르다. 남는 공간은 아래에 몰아 두므로 화면이 더 낮은 기기에서는 아래부터 줄어든다.
 */
export default function InfernoChatScene({
  page,
  participants,
  onPageDone,
}: InfernoChatSceneProps) {
  /** 다 쳐진 줄 수. 지금 쳐지고 있는 줄의 인덱스이기도 하다. */
  const [typedCount, setTypedCount] = useState(0);

  const visibleMessages = page.messages.slice(0, typedCount + 1);
  const isPageDone = typedCount >= page.messages.length;

  function handleMessageDone() {
    const nextCount = typedCount + 1;
    setTypedCount(nextCount);

    if (nextCount >= page.messages.length) {
      onPageDone?.();
    }
  }

  return (
    <View className="flex-1 flex-col items-center">
      {page.question ? (
        <>
          <View className="h-[32px]" />
          <Text variant="body-m" className="text-text-muted">
            {page.question}
          </Text>
          <View className="h-[26px]" />
        </>
      ) : (
        <View className="h-[20px]" />
      )}

      <View className="w-full flex-col px-[50px]">
        {visibleMessages.map((message, index) => {
          const participant = participants.find(({ id }) => id === message.participantId);

          // 참가자 목록에 없는 줄. 데이터가 어긋난 경우라 그 줄만 건너뛴다.
          if (!participant) {
            return null;
          }

          return (
            <InfernoChatRow
              key={message.id}
              message={message}
              participant={participant}
              onTypingDone={index === typedCount ? handleMessageDone : undefined}
            />
          );
        })}
      </View>

      {page.notice && isPageDone ? (
        <>
          <View className="h-[26px]" />
          <Text variant="body-m" className="text-text-muted">
            {page.notice}
          </Text>
        </>
      ) : null}

      <View className="flex-1" />
    </View>
  );
}
