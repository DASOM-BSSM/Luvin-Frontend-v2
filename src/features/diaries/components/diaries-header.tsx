import { useState } from 'react';
import { Pressable, View } from 'react-native';

import PlusIcon from '@/src/assets/icons/PlusIcon';
import Text from '@/src/components/ui/text';
import GroupActionMenu from '@/src/features/diaries/components/group-action-menu';
import WriteDiaryModal from './diaries-create';

interface DiariesHeaderProps {
  onCreateGroupPress: () => void;
  onJoinGroupPress?: () => void;
  userToken?: string;
  userName?: string;
  lastWrittenAt?: string | null;
}

/**
 * 감정일기 홈 헤더. "Luvin EmoDi" 로고 글자 + 우상단 + 버튼(6135:2828).
 *
 * + 를 누르면 그룹 메뉴(6135:2812)가 헤더 아래 본문 위에 겹쳐 뜬다. 겹쳐 뜨는 건 흐름 레이아웃으로
 * 표현할 수 없어서 메뉴만 absolute 로 띄운다(§16 의 예외) — 헤더 줄 상단에서 20px 아래, 오른쪽 끝 정렬.
 * 뒤따르는 본문보다 위에 그려지도록 헤더에 z-10 을 준다.
 */
export default function DiariesHeader({
  onCreateGroupPress,
  onJoinGroupPress,
  userToken,
  userName = '쫀득한 소금빵',
  lastWrittenAt,
}: DiariesHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handlePlusPress() {
    setIsMenuOpen((open) => !open);
  }

  function handleCreatePress() {
    setIsMenuOpen(false);
    onCreateGroupPress();
  }

  function handleJoinPress() {
    setIsMenuOpen(false);
    onJoinGroupPress?.();
  }

  // 일기 작성 메뉴/버튼을 눌렀을 때 모달 오픈
  function handleOpenModal() {
    setIsMenuOpen(false);
    setIsModalOpen(true);
  }

  return (
    <>
      <View className="z-10 w-full flex-row items-start justify-between">
        <Text variant="display-logo">Luvin EmoDi</Text>
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
            <GroupActionMenu
              onCreatePress={handleCreatePress}
              onJoinPress={handleJoinPress}
            />
          </View>
        ) : null}
      </View>

      {/* 일기 작성 모달 연동 */}
      <WriteDiaryModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToken={userToken}
        userName={userName}
        lastWrittenAt={lastWrittenAt}
        onSuccess={() => {
          // 일기 작성 성공 시 처리할 로직
        }}
      />
    </>
  );
}