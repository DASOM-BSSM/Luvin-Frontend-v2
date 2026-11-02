/**
 * [DRAFT] 회차가 끝나면 뜨는 "에피소드가 종료되었습니다" 쪽지(마지막 장면 뒤, 또는 투표 직후).
 * 완료 요청 중·실패 상태를 버튼과 문구에 싣는다.
 */
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';

interface InfernoEpisodeDoneModalProps {
  visible: boolean;
  isLastEpisode: boolean;
  isSaving: boolean;
  hasFailed: boolean;
  onFinishPress: () => void;
  onClose: () => void;
  /** 완전히 닫힌 뒤(iOS). 나가기 전에 모달이 사라지기를 기다릴 때 쓴다. */
  onDismiss?: () => void;
}

export default function InfernoEpisodeDoneModal({
  visible,
  isLastEpisode,
  isSaving,
  hasFailed,
  onFinishPress,
  onClose,
  onDismiss,
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
      message={hasFailed ? ERROR_MESSAGES.completeFailed : '에피소드가 종료되었습니다'}
      actionLabel={actionLabel}
      onActionPress={onFinishPress}
      onClose={onClose}
      onDismiss={onDismiss}
    />
  );
}
