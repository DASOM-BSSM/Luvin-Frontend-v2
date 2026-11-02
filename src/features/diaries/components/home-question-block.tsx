import { useState } from 'react';

import CreateDiaryModal from '@/src/features/diaries/components/create-diary-modal';
import MyDiaryPromptCard from '@/src/features/diaries/components/my-diary-prompt-card';
import QuestionCreatedNotice from '@/src/features/diaries/components/question-created-notice';
import ReactableDiaryCard from '@/src/features/diaries/components/reactable-diary-card';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import type { DiaryFeedItem, RoomQuestion } from '@/src/features/diaries/types';
import { formatHourSlot, getCooldownSeconds } from '@/src/features/diaries/utils/feed';

interface HomeQuestionBlockProps {
  question: RoomQuestion;
  /** 질문과 같은 칸에 그 그룹에서 쓴 가장 최근 일기. 없으면 undefined. */
  latestDiary: DiaryFeedItem | undefined;
  /** 그 그룹에 내가 마지막으로 쓴 시각(ms). */
  lastWrittenAt: number | undefined;
  /** 알림 카드를 누르면(질문이 있는 그룹으로 간다). */
  onNoticePress: () => void;
}

/**
 * 홈 "쫀쫀한 조합들"에서 오늘 질문이 있을 때 — 위에 질문 생성 알림, 그 아래 내 자리("눌러서 작성"), 그 아래
 * 같은 칸에 올라온 일기(사용자 결정: 알림은 늘 내 답 위). "눌러서 작성"은 감정일기 메인과 같은 규칙으로
 * 정각 칸마다 한 번만 뜨고(이 칸에 썼으면 다음 정각까지 숨는다), 누르면 그 그룹으로 일기 올리기를 연다.
 */
export default function HomeQuestionBlock({
  question,
  latestDiary,
  lastWrittenAt,
  onNoticePress,
}: HomeQuestionBlockProps) {
  const me = useMyDiaryAuthor();
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const canWrite = getCooldownSeconds(lastWrittenAt, Date.now()) === 0;

  function handleWritePress() {
    setIsWriteOpen(true);
  }

  function handleWriteClose() {
    setIsWriteOpen(false);
  }

  return (
    <>
      <QuestionCreatedNotice question={question} onPress={onNoticePress} />
      {canWrite ? (
        <MyDiaryPromptCard author={me} time={formatHourSlot(new Date())} onWritePress={handleWritePress} />
      ) : null}
      {latestDiary ? <ReactableDiaryCard key={latestDiary.diaryId} diary={latestDiary} /> : null}
      <CreateDiaryModal
        visible={isWriteOpen}
        roomId={question.roomId}
        lastWrittenAt={lastWrittenAt}
        onClose={handleWriteClose}
      />
    </>
  );
}
