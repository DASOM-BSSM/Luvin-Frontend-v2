import { useState } from 'react';

import CreateDiaryModal from '@/src/features/diaries/components/create-diary-modal';
import MyDiaryPromptCard from '@/src/features/diaries/components/my-diary-prompt-card';
import ReactableDiaryCard from '@/src/features/diaries/components/reactable-diary-card';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import type { DiaryFeedItem, RoomQuestion } from '@/src/features/diaries/types';
import { getCooldownSeconds } from '@/src/features/diaries/utils/feed';
import { formatHourSlotLabel } from '@/src/features/diaries/utils/question';

interface HomeQuestionBlockProps {
  question: RoomQuestion;
  /** 질문과 같은 칸에 그 그룹에서 쓴 일기 전부(최신순, 내 것 · 남의 것 모두). */
  diaries: DiaryFeedItem[];
  /** 그 그룹에 내가 마지막으로 쓴 시각(ms). */
  lastWrittenAt: number | undefined;
}

/**
 * 홈 "쫀쫀한 조합들"에서 오늘 질문이 있을 때 — 내 자리("눌러서 작성"), 그 아래 같은 칸에 올라온 일기 전부
 * (예전에는 가장 최근 한 장만이라 내가 쓰면 내 것만 보였다 — 사용자 지적).
 * 질문 생성 알림은 섹션 맨 위 알림 자리(`GroupFeedNotice`)로 옮겼다 — 반응 알림이 없을 때만 뜬다(사용자 결정).
 * 알림 자리가 이 블록보다 위라 "알림은 늘 내 답 위"는 그대로다. "눌러서 작성"은 감정일기 메인과 같은 규칙으로
 * 정각 칸마다 한 번만 뜨고(이 칸에 썼으면 다음 정각까지 숨는다), 누르면 그 그룹으로 일기 올리기를 연다.
 */
export default function HomeQuestionBlock({
  question,
  diaries,
  lastWrittenAt,
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
      {canWrite ? (
        <MyDiaryPromptCard author={me} time={formatHourSlotLabel(question.slotStartAt)} onWritePress={handleWritePress} />
      ) : null}
      {diaries.map((diary) => (
        <ReactableDiaryCard key={diary.diaryId} diary={diary} />
      ))}
      <CreateDiaryModal
        visible={isWriteOpen}
        roomId={question.roomId}
        lastWrittenAt={lastWrittenAt}
        onClose={handleWriteClose}
      />
    </>
  );
}
