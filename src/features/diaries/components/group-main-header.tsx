import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import CalendarIcon from '@/src/assets/icons/CalendarIcon';
import SettingsIcon from '@/src/assets/icons/SettingsIcon';
import GroupSwitchTitle from '@/src/features/diaries/components/group-switch-title';
import type { RoomId } from '@/src/features/diaries/types';

interface GroupMainHeaderProps {
  /** 그룹 이름. 아직 모르면 빈 문자열. */
  title: string;
  roomId: RoomId;
  onBackPress: () => void;
  onCalendarPress: () => void;
  onSettingsPress: () => void;
}

/**
 * 감정일기 메인 헤더 — 뒤로가기 + 그룹 이름, 오른쪽 달력 · 설정. Figma 5950:6818.
 * 그룹 이름을 눌러 다른 그룹을 고르면 그 그룹의 감정일기 메인으로 바꾼다(replace — 뒤로가기는 원래 온 곳으로).
 */
export default function GroupMainHeader({
  title,
  roomId,
  onBackPress,
  onCalendarPress,
  onSettingsPress,
}: GroupMainHeaderProps) {
  function handleRoomSelect(nextRoomId: RoomId) {
    router.replace({ pathname: '/diaries/groups/[roomId]', params: { roomId: nextRoomId } });
  }

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
        <GroupSwitchTitle title={title} roomId={roomId} onRoomSelect={handleRoomSelect} />
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
