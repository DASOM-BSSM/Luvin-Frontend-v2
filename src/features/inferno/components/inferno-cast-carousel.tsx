/**
 * [DRAFT] 1화 등장인물 소개. 빵을 한 명씩 카드로 좌우로 넘겨 보고, 마지막 카드에서 "시작하기".
 * 이름 + 이 배경에서의 역할 + 행동으로만 쓴 성격 한 줄. 애착 유형 이름은 서버가 보내도 쓰지 않는다
 * (변환 단계에서 이미 버린다 — utils/map-story.ts).
 */
import { useState } from 'react';
import {
  FlatList,
  View,
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import type { StageCastMember } from '@/src/features/inferno/types/story';

interface InfernoCastCarouselProps {
  cast: StageCastMember[];
  skippable: boolean;
  onStart: () => void;
}

function castKey(member: StageCastMember) {
  return member.breadId;
}

export default function InfernoCastCarousel({ cast, skippable, onStart }: InfernoCastCarouselProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const isLast = index >= cast.length - 1;

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (width > 0) setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  function renderCard({ item }: ListRenderItemInfo<StageCastMember>) {
    return (
      // 한 장씩 넘기려면 카드 폭이 잰 화면 폭과 정확히 같아야 한다. 실행 중에 재는 값이라
      // className 으로 줄 수 없어서 이 한 곳만 style 을 쓴다(§16 예외).
      <View style={{ width }} className="items-center justify-center">
        <View className="w-[260px] items-center gap-[6px] rounded-[8px] border border-pink-300 bg-default-white px-[16px] py-[12px]">
          <BreadCharacter type={item.type} state="personDough" />
          <Text variant="heading-h4" className="text-center text-text-primary">
            {item.name}
          </Text>
          <Text variant="body-s" className="text-center text-pink-500">
            {item.role}
          </Text>
          {item.description ? (
            <Text variant="body-s" className="text-center text-text-muted">
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 gap-[8px] py-[8px]" onLayout={handleLayout}>
      {width > 0 ? (
        <FlatList
          data={cast}
          keyExtractor={castKey}
          renderItem={renderCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
        />
      ) : null}
      <View className="items-center gap-[4px]">
        <Text variant="body-xs" className="text-text-muted">
          {cast.length > 0 ? `${index + 1} / ${cast.length} · 옆으로 넘겨 보세요` : ''}
        </Text>
        {isLast || skippable ? (
          <Button label={isLast ? '시작하기' : '소개 건너뛰기'} onPress={onStart} />
        ) : null}
      </View>
    </View>
  );
}
