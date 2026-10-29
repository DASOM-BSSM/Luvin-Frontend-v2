import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import BottomNav from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import CreateDiaryModal from '@/src/features/diaries/components/create-diary-modal';
import DiaryCalendarSheet from '@/src/features/diaries/components/diary-calendar-sheet';
import DiaryDetailModal from '@/src/features/diaries/components/diary-detail-modal';
import GroupDiaryList from '@/src/features/diaries/components/group-diary-list';
import GroupMainHeader from '@/src/features/diaries/components/group-main-header';
import GroupQuestionSection from '@/src/features/diaries/components/group-question-section';
import SegmentedProgress from '@/src/features/diaries/components/segmented-progress';
import useDiaryDetail from '@/src/features/diaries/hooks/use-diary-detail';
import useRoom from '@/src/features/diaries/hooks/use-room';
import useRoomDiaries from '@/src/features/diaries/hooks/use-room-diaries';
import { isRoomUnavailableError } from '@/src/features/diaries/utils/errors';
import { getLastWrittenAt, getMyDiaryDates, getWeekdayIndex } from '@/src/features/diaries/utils/feed';

/** 시안의 칸 막대 수(일주일). */
const WEEK_LENGTH = 7;

/**
 * 감정일기 메인 = 그룹 안의 일기 피드. Figma "감정일기 메인 - 제민"(질문 없음 6263:5614 · 질문
 * 있음 5942:5456). 경로 `/diaries/groups/[roomId]`.
 *
 * 그룹 질문("Q. ...")은 `GroupQuestionSection` 이 `GET /api/diary-rooms/{roomId}/questions/current` 로
 * 받아 상태(없음 · 만드는 중 · 실패 · 있음)별로 그린다.
 *
 * NOTE: 칸 막대는 무엇을 나타내는지 정해지지 않아 우선 오늘 요일(월=첫 칸)을 칠한다.
 *
 * 그룹 이름은 `GET /api/diary-rooms/{roomId}` 로 받는다. 없는 방이거나 내가 멤버가 아니면(404 · 403)
 * "그룹을 찾을 수 없어요"를, 그 밖의 실패는 다시 시도 문구를 보여준다.
 *
 * 설정(⚙)은 그룹 설정하기 화면으로 가고, 달력(📅) · "눌러서 작성" · 일기 카드는 각각 일기 모아보기 ·
 * 일기 올리기 · 일기 상세(반응 · 댓글) 모달을 띄운다.
 */
export default function GroupMainScreen() {
  const { roomId: roomIdParam } = useLocalSearchParams<{ roomId: string }>();
  const roomId = Number(roomIdParam);
  const roomQuery = useRoom(roomId);
  const room = roomQuery.data;
  const isRoomUnavailable = Number.isNaN(roomId) || isRoomUnavailableError(roomQuery.error);
  // 목록(GroupDiaryList)과 같은 쿼리라 캐시를 같이 쓴다.
  const diaries = useRoomDiaries(Number.isNaN(roomId) ? undefined : roomId).data ?? [];
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const detail = useDiaryDetail(diaries);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/diaries');
  }

  function handleCalendarPress() {
    setIsCalendarOpen(true);
  }

  function handleCalendarClose() {
    setIsCalendarOpen(false);
  }

  function handleRoomRetryPress() {
    roomQuery.refetch();
  }

  function handleSettingsPress() {
    router.push({ pathname: '/diaries/groups/[roomId]/settings', params: { roomId } });
  }

  function handleWritePress() {
    setIsWriteOpen(true);
  }

  function handleWriteClose() {
    setIsWriteOpen(false);
  }


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

        {isRoomUnavailable ? (
          <Text variant="body-s" className="text-text-muted">
            그룹을 찾을 수 없어요
          </Text>
        ) : roomQuery.isError ? (
          <Pressable accessibilityRole="button" onPress={handleRoomRetryPress}>
            <Text variant="body-s" className="text-state-error">
              그룹을 불러오지 못했어요. 다시 시도
            </Text>
          </Pressable>
        ) : (
          <>
            <GroupQuestionSection roomId={roomId} />
            <GroupDiaryList
              roomId={roomId}
              onWritePress={handleWritePress}
              onDiaryPress={detail.open}
              onDiaryMorePress={detail.openWithMenu}
            />
          </>
        )}
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="diary" />
      </View>

      <CreateDiaryModal
        visible={isWriteOpen}
        roomId={roomId}
        lastWrittenAt={getLastWrittenAt(diaries)}
        onClose={handleWriteClose}
      />
      <DiaryDetailModal diary={detail.selectedDiary} initialMenuOpen={detail.isMenuOpen} onClose={detail.close} />
      <DiaryCalendarSheet
        visible={isCalendarOpen}
        writtenDates={getMyDiaryDates(diaries)}
        onClose={handleCalendarClose}
      />
    </Screen>
  );
}
