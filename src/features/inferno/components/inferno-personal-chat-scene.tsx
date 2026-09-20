import { useState } from 'react';
import { Pressable, View } from 'react-native';

import FolderIcon from '@/src/assets/icons/FolderIcon';
import HeartBadgeIcon from '@/src/assets/icons/HeartBadgeIcon';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import TypewriterText from '@/src/components/ui/typewriter-text';
import InfernoChatBubble from '@/src/features/inferno/components/inferno-chat-bubble';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { InfernoChatPage, InfernoParticipant } from '@/src/features/inferno/types';

interface InfernoPersonalChatSceneProps {
  page: InfernoChatPage;
  participants: InfernoParticipant[];
  /** 이 쪽의 마지막 줄까지 다 쳐졌을 때 알린다. */
  onPageDone?: () => void;
  /** "나의 빵에게" 를 눌렀을 때. 넘기지 않으면 눌러도 아무 일도 하지 않는다. */
  onFeedbackPress?: () => void;
}

interface PersonalChatShortcutProps {
  label: string;
  /** 넘기지 않으면 갈 곳이 없다는 뜻이라 눌러도 아무 일도 하지 않는다. */
  onPress?: () => void;
}

/** 왼쪽 위 바로가기 하나. Figma `Frame 73`/`Frame 71` (5379:3575, 5379:3579). */
function PersonalChatShortcut({ label, onPress }: PersonalChatShortcutProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      className="flex-col items-center gap-[8px]"
      onPress={onPress}
    >
      <FolderIcon />
      <Text variant="body-m" className="text-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * 매칭 발표 뒤 1:1 대화. Figma `ep2-대화` (5379:3570), `ep2-대화 끝` (5467:5564).
 *
 * 전체 대화(`InfernoChatScene`)와 생김새가 다르다: 아바타가 줄마다 붙지 않고 왼쪽에 두
 * 반죽 초상화로 고정돼 있고, 말풍선은 분홍이다(InfernoChatBubble 의 palette="pink").
 *
 * 왼쪽 위 바로가기 둘 중 "나의 빵에게" 는 피드백 화면으로 이어진다(onFeedbackPress).
 * "다시 굽기" 는 아직 갈 곳이 없어서 눌러도 아무 동작을 하지 않는다(BottomNav 의 감정일기
 * 탭과 같은 이유 — 목적지가 정해지면 그때 연결한다).
 *
 * 줄이 하나씩 쳐지는 방식은 InfernoChatScene 과 같다.
 */
export default function InfernoPersonalChatScene({
  page,
  participants,
  onPageDone,
  onFeedbackPress,
}: InfernoPersonalChatSceneProps) {
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

  const mine = participants.find(({ isMine }) => isMine);
  const other = participants.find(({ isMine }) => !isMine);

  return (
    <View className="w-full flex-1 flex-row items-center px-[46px]">
      <View className="w-[140px] flex-col items-center gap-[24px]">
        <View className="flex-col items-center gap-[12px]">
          <PersonalChatShortcut label="다시 굽기" />
          <PersonalChatShortcut label="나의 빵에게" onPress={onFeedbackPress} />
        </View>
        <View className="flex-row items-end gap-[12px]">
          {mine ? (
            <BreadCharacter
              type={mine.type}
              state="dough"
              className={findDoughFigure(mine.type).chatSizeClass}
              accessibilityLabel={mine.name}
            />
          ) : null}
          {other ? (
            <BreadCharacter
              type={other.type}
              state="dough"
              className={findDoughFigure(other.type).chatSizeClass}
              accessibilityLabel={other.name}
            />
          ) : null}
        </View>
      </View>

      <View className="flex-1 flex-col gap-[20px] px-[24px]">
        {visibleMessages.map((message, index) => {
          const participant = participants.find(({ id }) => id === message.participantId);

          // 참가자 목록에 없는 줄. 데이터가 어긋난 경우라 그 줄만 건너뛴다.
          if (!participant) {
            return null;
          }

          const isRight = message.side === 'right';

          return (
            <View key={message.id} className="w-full flex-col items-start">
              <View className={`w-full flex-row ${isRight ? 'justify-end' : 'justify-start'}`}>
                <InfernoChatBubble side={message.side} isMine={participant.isMine} palette="pink">
                  <TypewriterText
                    text={message.text}
                    variant="body-m"
                    className="text-text-primary"
                    onDone={index === typedCount ? handleMessageDone : undefined}
                  />
                </InfernoChatBubble>
              </View>
              {message.showHeart && index < typedCount ? (
                <View className="-mt-[8px] pl-[12px]">
                  <HeartBadgeIcon />
                </View>
              ) : null}
            </View>
          );
        })}

        {page.notice && isPageDone ? (
          <Text variant="body-m" className="text-text-muted">
            {page.notice}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
