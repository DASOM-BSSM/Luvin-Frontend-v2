import { useState } from 'react';
import { FlatList, View, type ViewToken } from 'react-native';

import RiseIn from '@/src/components/ui/rise-in';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import { formatEpisodeLabel } from '@/src/features/home/utils/format-episode';
import InfernoHighlightChatLine from '@/src/features/inferno/components/inferno-highlight-chat-line';
import type { InfernoHighlight } from '@/src/features/inferno/types';

/** 대화 줄이 하나씩 떠오르는 사이 시간(ms). */
const LINE_STAGGER_MS = 220;
/** 회차 블록 사이 간격 — "간격이 좀 있었으면 좋겠다"는 피드백 반영. */
const EPISODE_GAP_CLASS = 'gap-[36px]';
/** 40% 이상 보여야 그 회차가 "스크롤해서 도달했다"고 본다. */
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 40 };

interface InfernoHighlightSceneProps {
  highlights: InfernoHighlight[];
}

function getHighlightKey(highlight: InfernoHighlight): string {
  return String(highlight.episodeOrder);
}

/**
 * [DRAFT] ep5 3페이지 — 하이라이트 모아보기.
 *
 * Figma "ep5-하이라이트"(5760:4351)에 쪽지 틀(781x300)과 "HIGHLIGHT" 타이틀까지만 잡혀
 * 있다(재확인 완료). 회차별로 나눠서 하나씩 골라보게 하지 않고, ep1~4 각 회차의 하이라이트
 * 대화 3마디(pickEpisodeHighlight)를 회차 순서대로 이어 붙여 하나의 흐름처럼 보여준다.
 *
 * 타이핑 애니메이션(본편의 `InfernoChatRow`) 대신 이미 쓰인 문장을 그대로 두고, 그 회차
 * 블록이 스크롤로 화면에 들어올 때 대화가 한 줄씩 나타난다 — `FlatList`의
 * `onViewableItemsChanged`로 회차 블록이 보이는 시점을 잡고, 그때부터 각 줄을 `RiseIn`으로
 * 지연 차등(LINE_STAGGER_MS)을 줘서 띄운다. 일반 `ScrollView`는 "지금 몇 번째 회차가 보이는지"
 * 를 알 방법이 없어 이 감지에는 `FlatList`를 쓴다(이 파일이 이 기능의 첫 사용처).
 * 한 번 보인 회차는 다시 스크롤해 지나가도 계속 나타난 상태로 둔다(재생 반복은 부산스럽다).
 */
export default function InfernoHighlightScene({ highlights }: InfernoHighlightSceneProps) {
  const [revealedOrders, setRevealedOrders] = useState<ReadonlySet<number>>(new Set());

  function handleViewableItemsChanged({ viewableItems }: { viewableItems: ViewToken[] }) {
    setRevealedOrders((current) => {
      const next = new Set(current);
      for (const viewable of viewableItems) {
        const highlight = viewable.item as InfernoHighlight;
        next.add(highlight.episodeOrder);
      }
      return next;
    });
  }

  function renderHighlight({ item: highlight }: { item: InfernoHighlight }) {
    const revealed = revealedOrders.has(highlight.episodeOrder);
    const palette = highlight.isPersonalChat ? 'pink' : 'yellow';

    return (
      <View className="w-full flex-col gap-[8px]">
        <Text variant="body-xxs" className="text-text-muted">
          {formatEpisodeLabel(highlight.episodeOrder)}
        </Text>
        {highlight.lines.map(({ message, participant }, index) => (
          <RiseIn key={message.id} start={revealed} delayMs={index * LINE_STAGGER_MS}>
            <InfernoHighlightChatLine message={message} participant={participant} palette={palette} />
          </RiseIn>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col items-center gap-[8px] px-[30px] py-[16px]">
      <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
        HIGHLIGHT
      </Text>
      <FlatList
        className="w-full flex-1"
        contentContainerClassName={`flex-col ${EPISODE_GAP_CLASS}`}
        data={highlights}
        keyExtractor={getHighlightKey}
        renderItem={renderHighlight}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={handleViewableItemsChanged}
      />
    </View>
  );
}
