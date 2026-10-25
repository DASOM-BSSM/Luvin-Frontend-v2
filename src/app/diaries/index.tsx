import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import BottomNav from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';
import BalanceGameSection from '@/src/features/diaries/components/balance-game-section';
import DiariesHeader from '@/src/features/diaries/components/diaries-header';
import GroupFeedSection from '@/src/features/diaries/components/group-feed-section';
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';

/**
 * 감정일기 홈. Figma "감정일기 홈 - 제민"(5950:6585).
 *
 * 밸런스 게임은 `/api/daily_questions`, 쫀쫀한 조합들은 `/api/diaries/community` 에 연결되어 있다.
 * 바로가기, 일기 카드의 더보기 버튼은 아직 갈 화면이 없어서 눌러도 아무 동작을 하지 않는다.
 * 하단 탭의 감정일기 아이콘을 누르면 이 화면으로 온다.
 */
export default function DiariesHomeScreen() {
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);

  function handleCreateGroupPress() {
    router.push('/diaries/groups/create');
  }

  function handleJoinGroupPress() {
    router.push('/diaries/groups/join');
  }

  /**
   * 그룹 없이 "감정일기 시작하기"를 누르면 그룹을 먼저 만들라는 모달을 띄운다. Figma `모달`(7873:4580) —
   * NOTICE · 문구 · 버튼 하나라서 같은 모양인 `InfernoNoticeModal` 에 문구만 바꿔 넣는다.
   */
  function handleDiaryStartPress() {
    setIsStartModalVisible(true);
  }

  function handleStartModalClose() {
    setIsStartModalVisible(false);
  }

  function handleStartModalAction() {
    setIsStartModalVisible(false);
    router.push('/diaries/groups/create');
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[40px] px-[30px] pb-[24px] pt-[36px]"
        showsVerticalScrollIndicator={false}
      >
        <DiariesHeader
          onCreateGroupPress={handleCreateGroupPress}
          onJoinGroupPress={handleJoinGroupPress}
        />

        <View className="w-full flex-col items-center gap-[40px]">
          <BalanceGameSection />
          <GroupFeedSection onStartPress={handleDiaryStartPress} />
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="diary" />
      </View>

      <InfernoNoticeModal
        visible={isStartModalVisible}
        message="그룹을 먼저 만들어주세요!"
        actionLabel="그룹 만들기"
        onClose={handleStartModalClose}
        onActionPress={handleStartModalAction}
      />
    </Screen>
  );
}
