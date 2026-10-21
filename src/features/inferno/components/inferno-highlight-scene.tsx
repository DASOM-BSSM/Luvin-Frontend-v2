import { useState } from 'react';
import { FlatList, View, type ViewToken } from 'react-native';

import RiseIn from '@/src/components/ui/rise-in';
import Text from '@/src/components/ui/text';
import type { InfernoHighlight } from '@/src/features/inferno/types';
import { formatEpisodeNumber } from '@/src/features/inferno/utils/format';

/**
 * 카드 사이 간격 — "간격이 좀 있었으면 좋겠다"는 피드백 반영(이전 버전에서 그대로 가져옴).
 * 그 뒤 나온 Figma ep5-하이라이트(7359:3315)의 줄 사이 간격 28 로 맞췄다.
 */
const CARD_GAP_CLASS = 'gap-[28px]';
/** 40% 이상 보여야 그 카드가 "스크롤해서 도달했다"고 본다. */
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 40 };

interface InfernoHighlightSceneProps {
  /** 서버가 준 순서 그대로 보여준다(map-ai-season-report.ts — 중요도 점수가 없어졌다). */
  highlights: InfernoHighlight[];
}

function getHighlightKey(highlight: InfernoHighlight, index: number): string {
  return `${index}-${highlight.text}`;
}

/**
 * ep5 3페이지 — 하이라이트 모아보기.
 *
 * Figma ep5-하이라이트(5760:4351)가 나와서 맞췄다: 회차마다 "Episode 02" + 대화 한 줄 + 고른 이유. 새 형식
 * 리포트가 회차별로 `message`·`reason` 을 준다(map-ai-season-report). 옛 형식 시즌은 회차·이유가 없어서
 * 대화 한 줄만 보인다. 시안처럼 따옴표 없이 쓴다.
 *
 * 스크롤 등장 애니메이션은 이전 버전과 같은 방식이다: `FlatList`의
 * `onViewableItemsChanged`로 카드가 보이는 시점을 잡고 `RiseIn`으로 띄운다. 한 번 보인
 * 카드는 다시 스크롤해 지나가도 계속 나타난 상태로 둔다(재생 반복은 부산스럽다).
 */
export default function InfernoHighlightScene({ highlights }: InfernoHighlightSceneProps) {
  const [revealedKeys, setRevealedKeys] = useState<ReadonlySet<string>>(new Set());

  function handleViewableItemsChanged({ viewableItems }: { viewableItems: ViewToken[] }) {
    setRevealedKeys((current) => {
      const next = new Set(current);
      for (const viewable of viewableItems) {
        if (viewable.index != null) {
          next.add(getHighlightKey(viewable.item as InfernoHighlight, viewable.index));
        }
      }
      return next;
    });
  }

  function renderHighlight({ item: highlight, index }: { item: InfernoHighlight; index: number }) {
    const revealed = revealedKeys.has(getHighlightKey(highlight, index));

    // 7365:3354: 왼쪽 300 칸(회차 Body/S + 대화 한 줄 Heading/H4, 사이 4), 80 띄우고 고른 이유(Body/S).
    // 글자색은 Figma 가 순수 검정(#000)을 써서 `inferno-instruction` 이다(inferno-trait-chip 과 같은 이유).
    return (
      <RiseIn start={revealed}>
        <View className="w-full flex-row items-center gap-[80px]">
          <View className="w-[300px] flex-col gap-[4px]">
            {highlight.episodeOrder !== undefined ? (
              <Text variant="body-s" className="text-inferno-instruction">
                {formatEpisodeNumber(highlight.episodeOrder)}
              </Text>
            ) : null}
            <Text variant="heading-h4" className="text-inferno-instruction">
              {highlight.text}
            </Text>
          </View>
          {highlight.reason ? (
            <Text variant="body-s" className="flex-1 text-inferno-instruction">
              {highlight.reason}
            </Text>
          ) : null}
        </View>
      </RiseIn>
    );
  }

  // 5760:4351: 제목은 쪽지 위에서 42, 목록은 99 에서 시작하고(제목 줄 35.2 를 빼면 21.8) 왼쪽 60 에 붙는다.
  return (
    <View className="flex-1 flex-col items-center">
      <View className="h-[42px]" />
      <Text variant="display-section-title">
        HIGHLIGHT
      </Text>
      <View className="h-[21.8px]" />
      <FlatList
        className="w-full flex-1"
        contentContainerClassName={`flex-col px-[60px] pb-[20px] ${CARD_GAP_CLASS}`}
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
