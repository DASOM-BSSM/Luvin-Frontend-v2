import { useState } from 'react';
import { Pressable, View } from 'react-native';

import PlusIcon from '@/src/assets/icons/PlusIcon';
import Text from '@/src/components/ui/text';
import GroupActionMenu from '@/src/features/diaries/components/group-action-menu';

interface DiariesHeaderProps {
  onCreateGroupPress: () => void;
}

/**
 * 감정일기 홈 헤더. "Luvin EmoDi" 로고 글자 + 우상단 + 버튼(6135:2828).
 *
 * + 를 누르면 그룹 메뉴(6135:2812)가 헤더 아래 본문 위에 겹쳐 뜬다. 겹쳐 뜨는 건 흐름 레이아웃으로
 * 표현할 수 없어서 메뉴만 absolute 로 띄운다(§16 의 예외) — 헤더 줄 상단에서 20px 아래, 오른쪽 끝 정렬.
 * 뒤따르는 본문보다 위에 그려지도록 헤더에 z-10 을 준다.
 */
export default function DiariesHeader({ onCreateGroupPress }: DiariesHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handlePlusPress() {
    setIsMenuOpen((open) => !open);
  }

  function handleCreatePress() {
    setIsMenuOpen(false);
    onCreateGroupPress();
  }

  return (
    <View className="z-10 w-full flex-row items-start justify-between">
      <Text variant="display-logo">Luvin EmoDi</Text>
      {/* 레이어 자리는 14×14 이고 SVG(16×16)가 선 굵기만큼 1px 씩 바깥으로 나간다. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="그룹 메뉴"
        accessibilityState={{ expanded: isMenuOpen }}
        hitSlop={12}
        className="size-[14px] items-center justify-center overflow-visible"
        onPress={handlePlusPress}
      >
        <PlusIcon />
      </Pressable>

      {isMenuOpen ? (
        <View className="absolute right-0 top-[20px]">
          <GroupActionMenu onCreatePress={handleCreatePress} />
        </View>
      ) : null}
    </View>
  );
}
