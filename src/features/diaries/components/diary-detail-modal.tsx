import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';

import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import DiaryActionMenu from '@/src/features/diaries/components/diary-action-menu';
import DiaryCommentSection from '@/src/features/diaries/components/diary-comment-section';
import EditDiaryForm from '@/src/features/diaries/components/edit-diary-form';
import GroupDiaryCard from '@/src/features/diaries/components/group-diary-card';
import ReactionPicker from '@/src/features/diaries/components/reaction-picker';
import useDeleteDiary from '@/src/features/diaries/hooks/use-delete-diary';
import useReactToDiary from '@/src/features/diaries/hooks/use-react-to-diary';
import type { DiaryFeedItem } from '@/src/features/diaries/types';
import { toGroupDiaryPreview } from '@/src/features/diaries/utils/feed';

interface DiaryDetailModalProps {
  /** 없으면 닫혀 있다. */
  diary: DiaryFeedItem | undefined;
  /** true 면 더보기(⋮) 메뉴를 펼친 채로 연다 — 목록 카드의 ⋮ 를 눌러 들어온 경우. */
  initialMenuOpen?: boolean;
  onClose: () => void;
}

/**
 * 일기 상세 — 반응 + 댓글. Figma "일기 반응 및 댓글"(5950:6274). 반투명 배경 위에 일기 카드,
 * 댓글 입력칸, 댓글 목록이 뜬다. 반응 버튼을 누르면 이모지 고르기가 펼쳐지고, 고르면 바로 보낸다
 * (같은 이모지를 다시 고르면 취소 — 서버 규칙).
 *
 * 내 일기면 카드의 더보기(⋮)로 삭제 · 수정 메뉴를 연다(Figma "일기 삭제 및 수정" 6102:2606). 수정은
 * 카드 자리에 쓰기 카드를 바꿔 끼우고, 삭제는 되돌릴 수 없어 `Alert.alert` 로 한 번 묻는다(§11 예외).
 */
export default function DiaryDetailModal({ diary, initialMenuOpen = false, onClose }: DiaryDetailModalProps) {
  return (
    <Modal visible={diary !== undefined} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="flex-1 bg-default-black/30" onPress={onClose}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow items-center justify-center px-[33px] py-[40px]"
            keyboardShouldPersistTaps="handled"
          >
            {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. */}
            <Pressable className="w-full max-w-[336px] flex-col items-start gap-[8px]">
              {/* 일기마다 새로 그려서 메뉴 · 수정 상태가 다른 일기로 넘어가지 않게 한다. */}
              {diary ? (
                <DiaryDetailContent
                  key={diary.diaryId}
                  diary={diary}
                  initialMenuOpen={initialMenuOpen}
                  onDeleted={onClose}
                />
              ) : null}
            </Pressable>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface DiaryDetailContentProps {
  diary: DiaryFeedItem;
  initialMenuOpen: boolean;
  onDeleted: () => void;
}

function DiaryDetailContent({ diary, initialMenuOpen, onDeleted }: DiaryDetailContentProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(initialMenuOpen && diary.isMine);
  const [isEditing, setIsEditing] = useState(false);
  const reactMutation = useReactToDiary();
  const deleteMutation = useDeleteDiary();
  const preview = toGroupDiaryPreview(diary);

  function handleReactionPress() {
    setIsPickerOpen((open) => !open);
  }

  function handleEmojiSelect(emoji: string) {
    reactMutation.mutate({ diaryId: diary.diaryId, emoji }, { onSuccess: () => setIsPickerOpen(false) });
  }

  function handleMorePress() {
    setIsMenuOpen((open) => !open);
  }

  function handleEditPress() {
    setIsMenuOpen(false);
    setIsEditing(true);
  }

  function handleEditDone() {
    setIsEditing(false);
  }

  function handleDeleteConfirm() {
    deleteMutation.mutate(diary.diaryId, { onSuccess: onDeleted });
  }

  function handleDeletePress() {
    setIsMenuOpen(false);
    Alert.alert('일기 삭제', '이 일기를 지울까요? 달린 반응과 댓글도 함께 지워져요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: handleDeleteConfirm },
    ]);
  }

  if (isEditing) {
    return <EditDiaryForm diary={diary} author={preview.author} time={preview.time} onDone={handleEditDone} />;
  }

  return (
    <>
      {isMenuOpen ? (
        <View className="w-full flex-row justify-end">
          <DiaryActionMenu
            onDeletePress={handleDeletePress}
            onEditPress={handleEditPress}
            disabled={deleteMutation.isPending}
          />
        </View>
      ) : null}
      <GroupDiaryCard
        diary={preview}
        onMorePress={diary.isMine ? handleMorePress : undefined}
        onReactionPress={handleReactionPress}
        reactionDisabled={reactMutation.isPending}
        reactionPicker={
          isPickerOpen ? <ReactionPicker onSelect={handleEmojiSelect} disabled={reactMutation.isPending} /> : null
        }
      />
      {deleteMutation.isError ? (
        <Text variant="body-xs" className="text-state-error">
          {ERROR_MESSAGES.deleteDiaryFailed}
        </Text>
      ) : null}
      <DiaryCommentSection diaryId={diary.diaryId} />
    </>
  );
}
