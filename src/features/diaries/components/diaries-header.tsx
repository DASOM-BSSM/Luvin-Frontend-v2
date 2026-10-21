import { useState } from 'react';
import { Pressable, View } from 'react-native';

import PlusIcon from '@/src/assets/icons/PlusIcon';
import Text from '@/src/components/ui/text';
import GroupActionMenu from '@/src/features/diaries/components/group-action-menu';
import WriteDiaryModal from './diaries-create';

interface DiariesHeaderProps {
  onCreateGroupPress: () => void;
  userToken?: string;
  userName?: string;
  lastWrittenAt?: string | null;
}

export default function DiariesHeader({
  onCreateGroupPress,
  userToken,
  userName = '쫀득한 소금빵',
  lastWrittenAt,
}: DiariesHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태 추가

  function handlePlusPress() {
    setIsMenuOpen((open) => !open);
  }

  function handleCreatePress() {
    setIsMenuOpen(false);
    onCreateGroupPress();
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
              onWriteDiaryPress={handleOpenModal} // 일기 쓰기 메뉴 연동
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