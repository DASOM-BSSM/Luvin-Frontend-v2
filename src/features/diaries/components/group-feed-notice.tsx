import GroupQuestionSection from '@/src/features/diaries/components/group-question-section';
import QuestionCreatedNotice from '@/src/features/diaries/components/question-created-notice';
import RecentReactionNotice from '@/src/features/diaries/components/recent-reaction-notice';
import useRecentReaction from '@/src/features/diaries/hooks/use-recent-reaction';
import type { RoomId, RoomQuestion } from '@/src/features/diaries/types';
import { isInCurrentSlot } from '@/src/features/diaries/utils/hour-slot';
import { getKstHourSlotKey, isMyQuestion } from '@/src/features/diaries/utils/question';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

interface GroupFeedNoticeProps {
  /** 반응이 없을 때 대신 알릴 오늘 질문. 없으면 undefined. */
  question: RoomQuestion | undefined;
  /**
   * 지금 칸에 다 만들어진 질문이 없을 때 "질문 생성하기" 카드를 둘 그룹. 질문이 있거나 그룹을 모르면 undefined.
   */
  creatorRoomId: RoomId | undefined;
  /** 반응 알림을 누르면 그 일기가 있는 그룹으로 간다. */
  onReactionPress: (roomId: RoomId) => void;
  /** 질문 생성 알림을 누르면(질문이 있는 그룹으로 간다). */
  onQuestionPress: () => void;
}

/**
 * "쫀쫀한 조합들" 맨 위 알림 한 장 — 알림은 한 번에 하나만 뜬다(사용자 결정). 앞에서부터 먼저 맞는 것 하나:
 * 1. 반응 알림(지금 정각 칸에 남긴 반응만 — 지난 시간대 반응은 띄우지 않는다, 사용자 결정)
 * 2. 질문 생성 알림(남이 만든 지금 칸 질문)
 * 3. "질문 생성하기" 카드(지금 칸에 다 만들어진 질문이 없을 때, `GroupQuestionSection` — 만드는 중 · 실패도
 *    이 카드가 그린다)
 * 모두 아니면 아무것도 그리지 않는다.
 *
 * 질문 생성 알림은 남이 만든 질문일 때만 띄운다 — 내가 만든 질문이면 알림 없이 아래 내 일기 자리만 둔다
 * (사용자 결정). 내 id 를 모르는 동안에는 내 질문인지 몰라 비워 둔다.
 *
 * 반응을 불러오는 동안에는 비워 둔다 — 생성 알림이 먼저 떴다가 반응 알림으로 바뀌어 보이지 않게. 반응을
 * 못 불러오면(실패) 반응이 없는 것과 같이 생성 알림을 보여준다.
 */
export default function GroupFeedNotice({
  question,
  creatorRoomId,
  onReactionPress,
  onQuestionPress,
}: GroupFeedNoticeProps) {
  const reactionQuery = useRecentReaction();
  const latestReaction = reactionQuery.data;
  const reaction =
    latestReaction && isInCurrentSlot(latestReaction.reactedAt, new Date()) ? latestReaction : undefined;
  const profileQuery = useMyProfile();
  const myId = profileQuery.data?.memberId;

  if (reaction) return <RecentReactionNotice reaction={reaction} onPress={onReactionPress} />;
  if (reactionQuery.isLoading) return null;
  if (creatorRoomId !== undefined) {
    return <GroupQuestionSection roomId={creatorRoomId} slot={getKstHourSlotKey(new Date())} />;
  }
  if (!question || profileQuery.isLoading || isMyQuestion(question, myId)) return null;
  return <QuestionCreatedNotice question={question} onPress={onQuestionPress} />;
}
