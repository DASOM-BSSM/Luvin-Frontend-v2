import { useState } from 'react';

import type { DiaryFeedItem, DiaryId } from '@/src/features/diaries/types';

/**
 * 감정일기 메인에서 어느 일기의 상세를 열었는지. 상세는 id 로 들고 있다가 매번 피드에서 찾는다 —
 * 반응을 보내거나 고치면 피드 캐시가 바뀌어 상세도 같이 바뀌고, 지우면 피드에서 사라져 상세가 닫힌다.
 */
export default function useDiaryDetail(diaries: DiaryFeedItem[]) {
  const [selectedDiaryId, setSelectedDiaryId] = useState<DiaryId>();
  // 목록 카드의 ⋮ 로 들어오면 상세를 메뉴가 펼쳐진 채로 연다.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function open(diary: DiaryFeedItem) {
    setIsMenuOpen(false);
    setSelectedDiaryId(diary.diaryId);
  }

  function openWithMenu(diary: DiaryFeedItem) {
    setIsMenuOpen(true);
    setSelectedDiaryId(diary.diaryId);
  }

  function close() {
    setSelectedDiaryId(undefined);
  }

  return {
    selectedDiary: diaries.find(({ diaryId }) => diaryId === selectedDiaryId),
    isMenuOpen,
    open,
    openWithMenu,
    close,
  };
}
