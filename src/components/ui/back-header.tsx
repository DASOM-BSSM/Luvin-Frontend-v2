import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import Text from '@/src/components/ui/text';

interface BackHeaderProps {
  title: string;
  onBackPress: () => void;
}

/**
 * 뒤로가기(‹) + 제목 한 줄. 그룹 만들기 · 참여하기 · 설정하기가 같은 모양이다(예: Figma 6606:3989) —
 * `uit:angle-up` 을 -90도 돌려 ‹ 로 쓴다.
 */
export default function BackHeader({ title, onBackPress }: BackHeaderProps) {
  return (
    <View className="w-full flex-row items-center gap-[12px]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
        className="size-[24px] items-center justify-center"
        onPress={onBackPress}
      >
        <View className="-rotate-90">
          <AngleUpIcon />
        </View>
      </Pressable>
      <Text variant="heading-h4" className="text-text-primary">
        {title}
      </Text>
    </View>
  );
}
