import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView } from 'react-native';

import DiaryCommentSection from '@/src/features/diaries/components/diary-comment-section';
import GroupDiaryCard from '@/src/features/diaries/components/group-diary-card';
import ReactionPicker from '@/src/features/diaries/components/reaction-picker';
import useReactToDiary from '@/src/features/diaries/hooks/use-react-to-diary';
import type { DiaryFeedItem } from '@/src/features/diaries/types';
import { toGroupDiaryPreview } from '@/src/features/diaries/utils/feed';

interface DiaryDetailModalProps {
  /** 없으면 닫혀 있다. */
  diary: DiaryFeedItem | undefined;
  onClose: () => void;
}

/**
 * 일기 상세 — 반응 + 댓글. Figma "일기 반응 및 댓글"(5950:6274). 반투명 배경 위에 일기 카드,
 * 댓글 입력칸, 댓글 목록이 뜬다. 반응 버튼을 누르면 이모지 고르기가 펼쳐지고, 고르면 바로 보낸다
 * (같은 이모지를 다시 고르면 취소 — 서버 규칙).
 */
export default function DiaryDetailModal({ diary, onClose }: DiaryDetailModalProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const reactMutation = useReactToDiary();

  function handleClose() {
    setIsPickerOpen(false);
    onClose();
  }

  function handleReactionPress() {
    setIsPickerOpen((open) => !open);
  }

  function handleEmojiSelect(emoji: string) {
    if (!diary) return;
    reactMutation.mutate({ diaryId: diary.diaryId, emoji }, { onSuccess: () => setIsPickerOpen(false) });
  }

  return (
    <Modal visible={diary !== undefined} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="flex-1 bg-default-black/30" onPress={handleClose}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow items-center justify-center px-[33px] py-[40px]"
            keyboardShouldPersistTaps="handled"
          >
            {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. */}
            <Pressable className="w-full max-w-[336px] flex-col items-start gap-[8px]">
              {diary ? (
                <>
                  <GroupDiaryCard
                    diary={toGroupDiaryPreview(diary)}
                    onReactionPress={handleReactionPress}
                    reactionDisabled={reactMutation.isPending}
                    reactionPicker={
                      isPickerOpen ? (
                        <ReactionPicker onSelect={handleEmojiSelect} disabled={reactMutation.isPending} />
                      ) : null
                    }
                  />
                  <DiaryCommentSection diaryId={diary.diaryId} />
                </>
              ) : null}
            </Pressable>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
