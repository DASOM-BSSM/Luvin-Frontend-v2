import { useState } from 'react';

import GroupDiaryCard from '@/src/features/diaries/components/group-diary-card';
import ReactionPicker from '@/src/features/diaries/components/reaction-picker';
import useReactToDiary from '@/src/features/diaries/hooks/use-react-to-diary';
import type { DiaryFeedItem } from '@/src/features/diaries/types';
import { toGroupDiaryPreview } from '@/src/features/diaries/utils/feed';

interface ReactableDiaryCardProps {
  diary: DiaryFeedItem;
  onMorePress?: () => void;
}

/**
 * 반응 버튼(☺+)이 살아 있는 그룹 일기 카드 — 감정일기 홈 · 감정일기 메인 목록이 같이 쓴다. 누르면
 * 카드 안에서 이모지 고르기가 펼쳐지고, 고르면 바로 보낸다(같은 이모지를 다시 고르면 취소 — 서버 규칙).
 * 반응 결과는 `useReactToDiary` 가 커뮤니티 · 방 피드 캐시에 같이 넣는다.
 */
export default function ReactableDiaryCard({ diary, onMorePress }: ReactableDiaryCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const reactMutation = useReactToDiary();

  function handleReactionPress() {
    setIsPickerOpen((open) => !open);
  }

  function handleEmojiSelect(emoji: string) {
    reactMutation.mutate({ diaryId: diary.diaryId, emoji }, { onSuccess: () => setIsPickerOpen(false) });
  }

  return (
    <GroupDiaryCard
      diary={toGroupDiaryPreview(diary)}
      onMorePress={onMorePress}
      onReactionPress={handleReactionPress}
      reactionDisabled={reactMutation.isPending}
      reactionPicker={
        isPickerOpen ? <ReactionPicker onSelect={handleEmojiSelect} disabled={reactMutation.isPending} /> : null
      }
    />
  );
}
