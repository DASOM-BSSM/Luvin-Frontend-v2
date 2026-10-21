import WriteDiaryModal from '@/src/features/diaries/components/write-diary-modal';
import useCreateDiary from '@/src/features/diaries/hooks/use-create-diary';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import type { RoomId } from '@/src/features/diaries/types';
import { formatHourSlot, toDiaryTitle } from '@/src/features/diaries/utils/feed';

interface CreateDiaryModalProps {
  visible: boolean;
  roomId: RoomId;
  /** 내가 이 그룹에 마지막으로 쓴 시각(ms) — 1시간 제한 계산에 쓴다. */
  lastWrittenAt?: number;
  onClose: () => void;
}

/** 일기 올리기 = `WriteDiaryModal` + `POST /api/diaries`. 성공하면 닫고 피드는 훅이 다시 불러온다. */
export default function CreateDiaryModal({ visible, roomId, lastWrittenAt, onClose }: CreateDiaryModalProps) {
  const author = useMyDiaryAuthor();
  const createDiaryMutation = useCreateDiary();

  function handleClose() {
    createDiaryMutation.reset();
    onClose();
  }

  function handleSubmit(content: string) {
    createDiaryMutation.mutate({ roomId, title: toDiaryTitle(content), content }, { onSuccess: handleClose });
  }

  return (
    <WriteDiaryModal
      visible={visible}
      author={author}
      time={formatHourSlot(new Date())}
      submitLabel="일기 올리기"
      isSubmitting={createDiaryMutation.isPending}
      errorMessage={createDiaryMutation.isError ? '일기를 올리지 못했어요. 다시 시도해 주세요' : undefined}
      lastWrittenAt={lastWrittenAt}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
}
