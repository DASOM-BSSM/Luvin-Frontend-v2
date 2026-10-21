import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import CalendarIcon from '@/src/assets/icons/CalendarIcon';
import SettingsIcon from '@/src/assets/icons/SettingsIcon';
import Text from '@/src/components/ui/text';

interface GroupMainHeaderProps {
  /** 그룹 이름. 아직 모르면 빈 문자열. */
  title: string;
  onBackPress: () => void;
  onCalendarPress: () => void;
  onSettingsPress: () => void;
}

/** 감정일기 메인 헤더 — 뒤로가기 + 그룹 이름, 오른쪽 달력 · 설정. Figma 5950:6818. */
export default function GroupMainHeader({
  title,
  onBackPress,
  onCalendarPress,
  onSettingsPress,
}: GroupMainHeaderProps) {
  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-[4px]">
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
        <Text variant="heading-h4" numberOfLines={1} className="flex-shrink text-text-primary">
          {title}
        </Text>
      </View>
      <View className="flex-row items-center gap-[14px]">
        <Pressable accessibilityRole="button" accessibilityLabel="일기 모아보기" hitSlop={8} onPress={onCalendarPress}>
          <CalendarIcon />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="그룹 설정" hitSlop={8} onPress={onSettingsPress}>
          <SettingsIcon />
        </Pressable>
      </View>
    </View>
  );
}
