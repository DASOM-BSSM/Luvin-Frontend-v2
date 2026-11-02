import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import GroupDiaryList from '@/src/features/diaries/components/group-diary-list';
import GroupQuestionSection from '@/src/features/diaries/components/group-question-section';
import PastQuestionPrompt from '@/src/features/diaries/components/past-question-prompt';
import type { GroupSlots } from '@/src/features/diaries/hooks/use-group-slots';
import type { DiaryFeedItem, RoomId } from '@/src/features/diaries/types';
import { formatQuestionDate } from '@/src/features/diaries/utils/question';

interface GroupSlotBodyProps {
  roomId: RoomId;
  /** 화면이 `useGroupSlots` 로 받은 칸 상태 — 진행 막대와 같은 칸을 본다. */
  slots: GroupSlots;
  onWritePress: () => void;
  onDiaryPress: (diary: DiaryFeedItem) => void;
  onDiaryMorePress: (diary: DiaryFeedItem) => void;
}

/**
 * 감정일기 메인의 질문 + 일기 목록을 시간대(정각 칸) 하나씩 보여준다(사용자 결정). 양옆 빈 곳(화면 여백
 * 30)을 누르면 왼쪽은 이전 칸, 오른쪽은 다음 칸으로 넘어간다. 넘길 칸이 없으면 그쪽은 눌리지 않는다.
 * 시안이 없어 넘김 애니메이션 · 칸 표시는 두지 않았다.
 *
 * 칸마다 질문 자리:
 * - 오늘 질문의 칸 · 지금 칸: `GroupQuestionSection`. 지금 질문이 그 칸 것이면 질문(답 모달)을, 아니면
 *   "질문 생성하기"를 둔다 — 질문은 정각 칸마다 1개라 9시 칸 질문이 있어도 10시 칸에서 새로 만든다.
 * - 지난 칸: 그 칸의 질문 문장(`PastQuestionPrompt`) — 누르면 질문 상세를 받아 답 모달을 연다.
 * - 달력에서 고른 날에 질문이 없으면: [DRAFT] "○월 ○일에는 질문이 없어요"(시안 없음). 받는 중 · 실패도 글자로 알린다.
 */
export default function GroupSlotBody({
  roomId,
  slots,
  onWritePress,
  onDiaryPress,
  onDiaryMorePress,
}: GroupSlotBodyProps) {
  const { slot, questionSlot, nowSlot, pastQuestion, olderSlot, newerSlot, selectSlot } = slots;
  const { isEmptyDay, isDayLoading, isDayError, retryDay } = slots;
  const isQuestionSlot = slot === questionSlot || slot === nowSlot;

  function handleOlderPress() {
    if (olderSlot !== undefined) selectSlot(olderSlot);
  }

  function handleNewerPress() {
    if (newerSlot !== undefined) selectSlot(newerSlot);
  }

  function handleDayRetryPress() {
    retryDay();
  }

  function renderEmptyDay() {
    if (isDayLoading) {
      return (
        <Text variant="body-s" className="text-text-muted">
          불러오는 중...
        </Text>
      );
    }
    if (isDayError) {
      return (
        <Pressable accessibilityRole="button" onPress={handleDayRetryPress}>
          <Text variant="body-s" className="text-state-error">
            그날 질문을 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      );
    }
    return (
      <Text variant="body-s" className="text-text-muted">
        {formatQuestionDate(slot.slice(0, 10))}에는 질문이 없어요
      </Text>
    );
  }

  return (
    <View className="w-full flex-1 flex-row">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이전 시간대"
        accessibilityState={{ disabled: olderSlot === undefined }}
        disabled={olderSlot === undefined}
        // 그림이 없는 빈 뷰라 네이티브에서 납작하게 합쳐져 눌리지 않을 수 있어 막는다.
        collapsable={false}
        className="w-[30px] self-stretch"
        onPress={handleOlderPress}
      />
      <View className="flex-1 flex-col items-center gap-[28px]">
        {isEmptyDay ? renderEmptyDay() : null}
        {isQuestionSlot ? <GroupQuestionSection roomId={roomId} slot={slot} /> : null}
        {!isQuestionSlot && pastQuestion ? (
          <PastQuestionPrompt key={pastQuestion.questionId} roomId={roomId} item={pastQuestion} />
        ) : null}
        <GroupDiaryList
          roomId={roomId}
          slot={slot}
          canWrite={slot === nowSlot}
          onWritePress={onWritePress}
          onDiaryPress={onDiaryPress}
          onDiaryMorePress={onDiaryMorePress}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 시간대"
        accessibilityState={{ disabled: newerSlot === undefined }}
        disabled={newerSlot === undefined}
        collapsable={false}
        className="w-[30px] self-stretch"
        onPress={handleNewerPress}
      />
    </View>
  );
}
