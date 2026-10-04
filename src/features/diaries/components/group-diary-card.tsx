import { Pressable, View } from 'react-native';

import EmotionAddIcon from '@/src/assets/icons/EmotionAddIcon';
import KebabIcon from '@/src/assets/icons/KebabIcon';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import type { GroupDiaryPreview } from '@/src/features/diaries/types';

interface GroupDiaryCardProps {
  diary: GroupDiaryPreview;
  onMorePress?: () => void;
  onReactionPress?: () => void;
  /** 반응 요청을 보내는 중이면 연타를 막는다(같은 이모지는 토글이라 연타하면 상태가 뒤집힌다). */
  reactionDisabled?: boolean;
}

/** 그룹 일기 카드. Figma "감정일기 홈"의 분홍 카드(5950:6783) — 높이 162 고정. */
export default function GroupDiaryCard({
  diary,
  onMorePress,
  onReactionPress,
  reactionDisabled = false,
}: GroupDiaryCardProps) {
  return (
    <View className="h-[162px] w-full flex-col items-center justify-between overflow-hidden rounded-[8px] bg-pink-100 p-[12px]">
      <View className="w-full flex-row items-center justify-between">
        {/* 작성자 정보가 아직 피드 응답에 없다(types 의 GroupDiaryPreview.author 참고). 오면 그린다. */}
        {diary.author ? (
          <View className="flex-row items-center gap-[4px]">
            <BreadCharacter
              type={diary.author.type}
              state={diary.author.state}
              className="h-[17px] w-[25px]"
              accessibilityLabel={diary.author.name}
            />
            <Text variant="body-xs" className="text-center text-default-black">
              {diary.author.name}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="더보기"
          hitSlop={12}
          onPress={onMorePress}
        >
          <KebabIcon />
        </Pressable>
      </View>

      <View className="flex-col items-center">
        <Text variant="heading-h2" className="text-center text-text-primary">
          {diary.time}
        </Text>
        <Text variant="body-xs" className="text-center text-default-black">
          {diary.message}
        </Text>
      </View>

      {/*
        반응 남기기 버튼. 누르면 이모지를 고르는 창이 떠야 하는데(디자인 이모지 + 키보드 이모지) 그
        시안이 아직 없어서, 지금은 Figma 그대로 아이콘만 두고 화면에서 동작을 연결하지 않았다.
        데이터 쪽은 `useReactToDiary` 로 준비되어 있다.
      */}
      <View className="w-full flex-row items-center justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="반응 남기기"
          accessibilityState={{ disabled: reactionDisabled }}
          disabled={reactionDisabled}
          hitSlop={12}
          onPress={onReactionPress}
        >
          <EmotionAddIcon />
        </Pressable>
      </View>
    </View>
  );
}
