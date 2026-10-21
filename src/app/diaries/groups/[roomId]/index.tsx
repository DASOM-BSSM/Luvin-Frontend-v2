import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import BottomNav from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import GroupDiaryList from '@/src/features/diaries/components/group-diary-list';
import GroupMainHeader from '@/src/features/diaries/components/group-main-header';
import QuestionEmptyCard from '@/src/features/diaries/components/question-empty-card';
import SegmentedProgress from '@/src/features/diaries/components/segmented-progress';
import useMyRooms from '@/src/features/diaries/hooks/use-my-rooms';
import { getWeekdayIndex } from '@/src/features/diaries/utils/feed';

/** 시안의 칸 막대 수(일주일). */
const WEEK_LENGTH = 7;

/**
 * 감정일기 메인 = 그룹 안의 일기 피드. Figma "감정일기 메인 - 제민"(질문 없음 6263:5614 · 질문
 * 있음 5942:5456). 경로 `/diaries/groups/[roomId]`.
 *
 * NOTE: 아직 백엔드에 없는 것 — 화면 자리만 두었다.
 * - 그룹 질문("Q. ..."): API 가 없어 지금은 항상 "질문 생성하기" 카드를 보여주고, 버튼도 동작하지 않는다.
 * - 칸 막대: 무엇을 나타내는지 정해지지 않아 우선 오늘 요일(월=첫 칸)을 칠한다.
 * - 그룹 이름: 방 하나 조회 API 가 없어 내 방 목록에서 찾는다.
 *
 * 달력(일기 모아보기) · 설정(그룹 설정하기) · 일기 쓰기 화면은 김리원 담당이라, 화면이 생기면 연결한다.
 */
export default function GroupMainScreen() {
  const { roomId: roomIdParam } = useLocalSearchParams<{ roomId: string }>();
  const roomId = Number(roomIdParam);
  const roomsQuery = useMyRooms();
  const room = roomsQuery.data?.find(({ id }) => id === roomId);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/diaries');
  }

  // 일기 모아보기 화면이 생기면 연결한다.
  function handleCalendarPress() {}

  // 그룹 설정하기 화면이 생기면 연결한다.
  function handleSettingsPress() {}

  // 그룹 질문 API 가 생기면 연결한다.
  function handleCreateQuestionPress() {}

  // 일기 올리기 화면이 생기면 연결한다.
  function handleWritePress() {}

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col items-center gap-[28px] px-[30px] pb-[24px] pt-[36px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full flex-col items-start gap-[12px]">
          <GroupMainHeader
            title={room?.name ?? ''}
            onBackPress={handleBackPress}
            onCalendarPress={handleCalendarPress}
            onSettingsPress={handleSettingsPress}
          />
          <SegmentedProgress count={WEEK_LENGTH} activeIndex={getWeekdayIndex(new Date())} />
        </View>

        {Number.isNaN(roomId) || (roomsQuery.isSuccess && !room) ? (
          <Text variant="body-s" className="text-text-muted">
            그룹을 찾을 수 없어요
          </Text>
        ) : (
          <>
            <QuestionEmptyCard onCreatePress={handleCreateQuestionPress} />
            <GroupDiaryList roomId={roomId} onWritePress={handleWritePress} />
          </>
        )}
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="diary" />
      </View>
    </Screen>
  );
}
