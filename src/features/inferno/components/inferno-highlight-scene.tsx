import { useState } from 'react';
import { FlatList, View, type ViewToken } from 'react-native';

import RiseIn from '@/src/components/ui/rise-in';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import type { InfernoHighlight } from '@/src/features/inferno/types';

/** 카드 사이 간격 — "간격이 좀 있었으면 좋겠다"는 피드백 반영(이전 버전에서 그대로 가져옴). */
const CARD_GAP_CLASS = 'gap-[36px]';
/** 40% 이상 보여야 그 카드가 "스크롤해서 도달했다"고 본다. */
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 40 };

interface InfernoHighlightSceneProps {
  /** `episodeId` 기준이 아니라 이미 중요도 순으로 정렬돼 들어온다(map-ai-season-report.ts). */
  highlights: InfernoHighlight[];
}

function getHighlightKey(highlight: InfernoHighlight): string {
  return `${highlight.episodeId}-${highlight.title}`;
}

/**
 * [DRAFT] ep5 3페이지 — 하이라이트 모아보기.
 *
 * Figma "ep5-하이라이트"(5760:4351)에 쪽지 틀(781x300)과 "HIGHLIGHT" 타이틀까지만 잡혀
 * 있다(재확인 완료). 원래는 ep1~4 대화에서 결정적인 줄을 직접 뽑아 채팅 말풍선으로
 * 보여줬는데, `GET /api/simulation/highlights`가 이미 완성된 제목/한 줄 요약을 주는 걸
 * 확인해서 카드 리스트로 바꿨다 — `episodeId`가 우리 회차 순서(1~4)와 다른 채번 체계로
 * 보여서(예시 응답에 5도 나옴) 회차 번호 배지 없이 title/summary만 보여준다.
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
        next.add(getHighlightKey(viewable.item as InfernoHighlight));
      }
      return next;
    });
  }

  function renderHighlight({ item: highlight }: { item: InfernoHighlight }) {
    const revealed = revealedKeys.has(getHighlightKey(highlight));

    return (
      <RiseIn start={revealed}>
        <View className="w-full flex-col gap-[4px]">
          <Text variant="heading-h4" className="text-text-primary">
            {highlight.title}
          </Text>
          <Text variant="body-s" className="text-text-muted">
            {highlight.summary}
          </Text>
        </View>
      </RiseIn>
    );
  }

  return (
    <View className="flex-1 flex-col items-center gap-[8px] px-[30px] py-[16px]">
      <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
        HIGHLIGHT
      </Text>
      <FlatList
        className="w-full flex-1"
        contentContainerClassName={`flex-col ${CARD_GAP_CLASS}`}
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
