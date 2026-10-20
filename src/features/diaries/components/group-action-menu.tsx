import { useState } from 'react';
import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';

interface GroupActionMenuItemProps {
  label: string;
  onPress: () => void;
}

/** 메뉴 한 줄. 누르는 동안 Figma 의 회색 줄(6135:2813)처럼 default/gray 바탕이 깔린다. */
function GroupActionMenuItem({ label, onPress }: GroupActionMenuItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  function handlePressIn() {
    setIsPressed(true);
  }

  function handlePressOut() {
    setIsPressed(false);
  }

  return (
    <Pressable
      accessibilityRole="menuitem"
      className={`w-full overflow-hidden rounded-[8px] px-[12px] py-[6px] ${isPressed ? 'bg-default-gray' : ''}`}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Text variant="body-xs" className="text-default-black">
        {label}
      </Text>
    </Pressable>
  );
}

interface GroupActionMenuProps {
  onCreatePress: () => void;
}

/**
 * 헤더 + 버튼을 누르면 뜨는 그룹 메뉴. Figma 6135:2812 (폭 113).
 *
 * Figma 에는 "그룹 참여하기"도 있지만, 공유방은 방장이 초대하는 방식으로 확정되어 스스로
 * 참여하는 API 를 만들지 않기로 해서(백엔드 확인) 뺐다.
 */
export default function GroupActionMenu({ onCreatePress }: GroupActionMenuProps) {
  return (
    <View accessibilityRole="menu" className="w-[113px] flex-col items-start rounded-[8px] bg-default-white p-[4px]">
      <GroupActionMenuItem label="그룹 만들기" onPress={onCreatePress} />
    </View>
  );
}
