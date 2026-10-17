import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import BottomNav from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';
import BalanceGameSection from '@/src/features/diaries/components/balance-game-section';
import DiariesHeader from '@/src/features/diaries/components/diaries-header';
import GroupFeedSection from '@/src/features/diaries/components/group-feed-section';

/**
 * 감정일기 홈. Figma "감정일기 홈 - 제민"(5950:6585).
 *
 * 밸런스 게임은 `/api/daily_questions`, 쫀쫀한 조합들은 `/api/diary-rooms` 에 연결되어 있다.
 * 바로가기, 일기 카드의 더보기 버튼은 아직 갈 화면이 없어서 눌러도 아무 동작을 하지 않는다. 하단 탭의 감정일기 아이콘과 이 화면을 잇는 작업도 아직이다.
 */
export default function DiariesHomeScreen() {
  function handleCreateGroupPress() {
    router.push('/diaries/groups/create');
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[40px] px-[30px] pb-[24px] pt-[36px]"
        showsVerticalScrollIndicator={false}
      >
        <DiariesHeader onCreateGroupPress={handleCreateGroupPress} />

        <View className="w-full flex-col items-center gap-[40px]">
          <BalanceGameSection />
          <GroupFeedSection />
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="diary" />
      </View>
    </Screen>
  );
}
