/** [DRAFT] 회차 마지막 블록 뒤 "대화가 종료되었습니다" 쪽지. 완료 요청 중·실패 상태를 버튼과 문구에 싣는다. */
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';

interface InfernoEpisodeDoneModalProps {
  visible: boolean;
  isLastEpisode: boolean;
  isSaving: boolean;
  hasFailed: boolean;
  onFinishPress: () => void;
  onClose: () => void;
}

export default function InfernoEpisodeDoneModal({
  visible,
  isLastEpisode,
  isSaving,
  hasFailed,
  onFinishPress,
  onClose,
}: InfernoEpisodeDoneModalProps) {
  const actionLabel = isSaving
    ? '저장하는 중…'
    : isLastEpisode
      ? '최종 리포트 보기'
      : '에피소드 끝내기';
  return (
    <InfernoNoteModal
      visible={visible}
      minWidthClass="min-w-[344px]"
      title="NOTICE"
      message={hasFailed ? ERROR_MESSAGES.completeFailed : '대화가 종료되었습니다'}
      actionLabel={actionLabel}
      onActionPress={onFinishPress}
      onClose={onClose}
    />
  );
}
