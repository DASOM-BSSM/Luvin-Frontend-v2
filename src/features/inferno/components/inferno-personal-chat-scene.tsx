import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoPersonalChatLine from '@/src/features/inferno/components/inferno-personal-chat-line';
import InfernoPersonalChatSidebar from '@/src/features/inferno/components/inferno-personal-chat-sidebar';
import type { InfernoChatPage, InfernoParticipant } from '@/src/features/inferno/types';

interface InfernoPersonalChatSceneProps {
  page: InfernoChatPage;
  participants: InfernoParticipant[];
  /**
   * 왼쪽 아래에 내 반죽과 나란히 설 1:1 상대. 1:1 대화 전체에서 정해서 넘긴다
   * (utils/personal-chat 의 findPersonalChatPartner) — 쪽마다 바뀌지 않게.
   */
  partner?: InfernoParticipant;
  /** 이 쪽의 마지막 줄까지 다 쳐졌을 때 알린다. */
  onPageDone?: () => void;
  /** "나의 빵에게" 를 눌렀을 때. 넘기지 않으면 눌러도 아무 일도 하지 않는다. */
  onFeedbackPress?: () => void;
  /** "나의 빵에게" 피드백을 이미 썼는지. 맞으면 폴더가 쓴 기회 모양(pink/300)이 된다. */
  isFeedbackUsed?: boolean;
  /** "다시 굽기" 를 눌렀을 때. 넘기지 않으면 갈 곳이 없거나 이미 다시 굽기를 썼다는 뜻. */
  onRebakePress?: () => void;
  /** 다시 굽기로 고른 상대와의 대화인지. 맞으면 "다시 굽기" 가 선택된 모양으로 흐려진다. */
  isRebakeSelected?: boolean;
  /** 하트를 누른 줄 id 목록. */
  likedMessageIds?: string[];
  /** 다 쳐진 말풍선을 눌렀을 때. 그 줄의 하트를 켜고 끈다. 넘기지 않으면 하트를 누를 수 없다. */
  onMessageLikePress?: (messageId: string) => void;
}

/**
 * 매칭 발표 뒤 1:1 대화. Figma `ep2-대화` (5379:3570), `ep2-대화 끝` (5467:5564),
 * `ep4-대화` (5449:1735), `ep4-끝` (5467:5675).
 *
 * 전체 대화(`InfernoChatScene`)와 생김새가 다르다: 아바타가 줄마다 붙지 않고 왼쪽 아래에 두
 * 반죽으로 고정돼 있고(InfernoPersonalChatSidebar), 말풍선은 분홍이다(palette="pink").
 *
 * 자리는 시안 프레임(874x402 = 기준 기기 가로 좌표)에서 옮겼다. 상하 바 51 씩을 뺀
 * 본문(874x300) 안에서 시안은 말풍선 칸이 x=384 부터 폭 450 인데, 대화창을 가로로 더
 * 길게 쓰려고(사용자 요청) 왼쪽 묶음을 300 으로 줄여 말풍선 칸이 x=300 부터 폭 534 다
 * (300 + 534 + 40 = 874). 왼쪽 묶음과 마찬가지로 본문 위에서 25 에서 시작한다(위쪽 정렬).
 *
 * 줄이 하나씩 쳐지는 방식은 InfernoChatScene 과 같다.
 *
 * 다 쳐진 말풍선을 누르면 그 줄에 하트가 켜진다(InfernoPersonalChatLine). 1:1 대화에서만 된다.
 *
 * 말풍선 칸은 위아래로 끌어서 볼 수 있다(사용자 요청). 쪽 나누기(paginate-chat)는 하트 높이를
 * 모르고, 말이 길면 계산이 빗나갈 수도 있어서 넘치는 만큼은 끌어서 본다. 타자가 쳐지는 동안은
 * 새 줄이 보이게 맨 아래를 따라가고, 다 쳐진 뒤(하트를 켤 때 등)에는 보던 자리를 지킨다.
 */
export default function InfernoPersonalChatScene({
  page,
  participants,
  partner,
  onPageDone,
  onFeedbackPress,
  isFeedbackUsed,
  onRebakePress,
  isRebakeSelected,
  likedMessageIds = [],
  onMessageLikePress,
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

  const scrollRef = useRef<ScrollView>(null);

  // 타자가 쳐지며 말풍선이 자라는 동안만 맨 아래를 따라간다. 다 쳐진 뒤에 하트가 붙어 높이가
  // 바뀌어도 끌어 올려 보던 자리에서 튀지 않게 한다.
  function handleContentSizeChange() {
    if (!isPageDone) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }

  const mine = participants.find(({ isMine }) => isMine);

  return (
    <View className="w-full flex-1 flex-row">
      <InfernoPersonalChatSidebar
        mine={mine}
        partner={partner}
        onFeedbackPress={onFeedbackPress}
        isFeedbackUsed={isFeedbackUsed}
        onRebakePress={onRebakePress}
        isRebakeSelected={isRebakeSelected}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="flex-col pr-[40px]"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={handleContentSizeChange}
      >
        <View className="h-[25px]" />

        <View className="w-full flex-col gap-[20px]">
          {visibleMessages.map((message, index) => {
            const participant = participants.find(({ id }) => id === message.participantId);

            // 참가자 목록에 없는 줄. 데이터가 어긋난 경우라 그 줄만 건너뛴다.
            if (!participant) {
              return null;
            }

            return (
              <InfernoPersonalChatLine
                key={message.id}
                message={message}
                participant={participant}
                isTyped={index < typedCount}
                isLiked={likedMessageIds.includes(message.id)}
                onTypingDone={index === typedCount ? handleMessageDone : undefined}
                onLikePress={onMessageLikePress}
              />
            );
          })}

          {page.notice && isPageDone ? (
            <View className="w-full items-center">
              <Text variant="body-m" className="text-text-muted">
                {page.notice}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 맨 아래 줄의 하트가 하단 바에 붙지 않게 위쪽과 같은 만큼 띄운다. */}
        <View className="h-[25px]" />
      </ScrollView>
    </View>
  );
}
