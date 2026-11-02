import useCommunityDiaries from '@/src/features/diaries/hooks/use-community-diaries';
import useCurrentQuestion from '@/src/features/diaries/hooks/use-current-question';
import useMyRooms from '@/src/features/diaries/hooks/use-my-rooms';
import { getLastWrittenAt } from '@/src/features/diaries/utils/feed';
import { filterSameHourSlot, isAnnounceableQuestion } from '@/src/features/diaries/utils/question';

/**
 * 홈 "쫀쫀한 조합들"에 보여줄 것 — 내 그룹 · 커뮤니티 피드 · 그 그룹의 지금 질문을 묶는다.
 *
 * 바로가기는 가장 최근 일기의 그룹으로, 일기가 없으면 내 첫 번째 그룹으로 간다. 질문 알림도 이 그룹 것이다.
 * 오늘 질문이 있으면 그 질문과 같은 정각 칸에 쓴 일기만 남긴다(utils/question.ts `filterSameHourSlot`).
 */
export default function useHomeGroupFeed() {
  const roomsQuery = useMyRooms();
  const feedQuery = useCommunityDiaries();
  const shortcutRoomId = feedQuery.data?.[0]?.roomId ?? roomsQuery.data?.[0]?.id;
  // 그룹이 정해지기 전에는 NaN 이라 부르지 않는다(useCurrentQuestion 의 enabled).
  const questionQuery = useCurrentQuestion(shortcutRoomId ?? Number.NaN);

  const question = questionQuery.data;
  const announcedQuestion =
    question && isAnnounceableQuestion(question, new Date()) ? question : undefined;
  const feed = feedQuery.data ?? [];
  const visibleFeed = announcedQuestion ? filterSameHourSlot(feed, announcedQuestion) : feed;

  function refetch() {
    roomsQuery.refetch();
    feedQuery.refetch();
    if (questionQuery.isError) questionQuery.refetch();
  }

  return {
    shortcutRoomId,
    announcedQuestion,
    latestDiary: visibleFeed[0],
    /** 그 그룹에 내가 마지막으로 쓴 시각(ms) — 홈 "눌러서 작성" 카드의 1시간 제한 계산에 쓴다. */
    lastWrittenAt: getLastWrittenAt(feed.filter((item) => item.roomId === shortcutRoomId)),
    hasNoRoom: roomsQuery.isSuccess && roomsQuery.data.length === 0,
    isLoading: roomsQuery.isLoading || feedQuery.isLoading || questionQuery.isLoading,
    isError: roomsQuery.isError || feedQuery.isError || questionQuery.isError,
    refetch,
  };
}
