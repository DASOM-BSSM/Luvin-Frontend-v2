import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import WriteDiaryForm from '@/src/features/diaries/components/write-diary-form';
import useUpdateDiary from '@/src/features/diaries/hooks/use-update-diary';
import type { DiaryFeedItem, GroupDiaryAuthor } from '@/src/features/diaries/types';
import { toDiaryTitle } from '@/src/features/diaries/utils/feed';

interface EditDiaryFormProps {
  diary: DiaryFeedItem;
  author: GroupDiaryAuthor;
  /** 카드에 보이던 시각 그대로. 예: "15:00" */
  time: string;
  /** 저장이 끝나면 부른다 — 상세가 다시 카드 보기로 돌아간다. */
  onDone: () => void;
}

/**
 * 일기 수정 = `WriteDiaryForm` + `PUT /api/diaries/{diaryId}`. 일기 상세 모달 안에서 카드 자리를 바꿔 끼운다
 * — iOS 는 모달 위에 모달을 바로 띄우면 안 뜨는 일이 있어서 따로 모달을 열지 않는다.
 */
export default function EditDiaryForm({ diary, author, time, onDone }: EditDiaryFormProps) {
  const updateDiaryMutation = useUpdateDiary();

  function handleSubmit(content: string) {
    updateDiaryMutation.mutate(
      { diaryId: diary.diaryId, title: toDiaryTitle(content), content },
      { onSuccess: onDone },
    );
  }

  return (
    <WriteDiaryForm
      author={author}
      time={time}
      initialContent={diary.content}
      submitLabel="수정하기"
      isSubmitting={updateDiaryMutation.isPending}
      errorMessage={updateDiaryMutation.isError ? ERROR_MESSAGES.updateDiaryFailed : undefined}
      onSubmit={handleSubmit}
    />
  );
}
