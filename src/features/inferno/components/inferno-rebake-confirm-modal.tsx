import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';

/** 다시 굽기 확인 쪽지. Figma `다시굽기` 확인 모달 (5467:5829~5467:5837), 폭 344. */
const REBAKE_CONFIRM_TITLE = 'REBAKE';
const REBAKE_CONFIRM_WIDTH = 'min-w-[344px]';

interface InfernoRebakeConfirmModalProps {
  visible: boolean;
  message: string;
  actionLabel: string;
  onRebakeStart: () => void;
  onClose: () => void;
}

/**
 * "다시 굽기" 확인 쪽지. ep2 와 ep4 가 똑같이 쓴다 — 원래 InfernoEp4Modals 안에 있던 것을 ep2 에도
 * 붙이면서 옮겼다(ep2 시안은 따로 없어서 ep4 시안 그대로, constants/rebake 주석 참고).
 */
export default function InfernoRebakeConfirmModal({
  visible,
  message,
  actionLabel,
  onRebakeStart,
  onClose,
}: InfernoRebakeConfirmModalProps) {
  return (
    <InfernoNoteModal
      visible={visible}
      minWidthClass={REBAKE_CONFIRM_WIDTH}
      title={REBAKE_CONFIRM_TITLE}
      message={message}
      actionLabel={actionLabel}
      onActionPress={onRebakeStart}
      onClose={onClose}
    />
  );
}
