import InfernoFeedbackModals from '@/src/features/inferno/components/inferno-feedback-modals';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import InfernoRebakeConfirmModal from '@/src/features/inferno/components/inferno-rebake-confirm-modal';
import type { InfernoEp2Modal } from '@/src/features/inferno/hooks/use-inferno-ep2-flow';
import type { InfernoMatchReveal } from '@/src/features/inferno/types';

/** 매칭 결과 쪽지. Figma `ep2-매칭` (5466:4529~5466:4546), 폭은 쪽지 실측(390)값. */
const REVEAL_TITLE = 'NOTICE';
const REVEAL_WIDTH = 'min-w-[390px]';

/** 에피소드 완료 쪽지. Figma `ep2-끝` (5467:5665~5467:5672), 폭은 ep1 의 끝 쪽지와 같은 344. */
const DONE_TITLE = 'NOTICE';
const DONE_MESSAGE = '에피소드가 모두 끝났어요!';
const DONE_ACTION = '에피소드 끝내기';
const DONE_WIDTH = 'min-w-[344px]';

interface InfernoEp2ModalsProps {
  openModal?: InfernoEp2Modal;
  matchReveal: InfernoMatchReveal;
  onClose: () => void;
  onRevealAction: () => void;
  onFinishEpisode: () => void;
  onFeedbackStart: () => void;
  onFeedbackDone: () => void;
  rebakeConfirmMessage: string;
  rebakeConfirmActionLabel: string;
  onRebakeStart: () => void;
}

/**
 * ep2 위에 뜨는 쪽지 다섯 장(매칭 결과·완료, "나의 빵에게" 안내·완료, 다시 굽기 확인). 한 번에 한 장만 뜬다.
 *
 * 화면(src/app/inferno/ep2.tsx)에 같이 두면 문구 상수까지 스무 줄 넘게 붙어 화면이 길어진다.
 * 쪽지는 서로 생김새가 같고 문구만 다르므로 여기 모아 둔다.
 */
export default function InfernoEp2Modals({
  openModal,
  matchReveal,
  onClose,
  onRevealAction,
  onFinishEpisode,
  onFeedbackStart,
  onFeedbackDone,
  rebakeConfirmMessage,
  rebakeConfirmActionLabel,
  onRebakeStart,
}: InfernoEp2ModalsProps) {
  return (
    <>
      <InfernoNoteModal
        visible={openModal === 'reveal'}
        minWidthClass={REVEAL_WIDTH}
        title={REVEAL_TITLE}
        message={matchReveal.noticeMessage}
        actionLabel={matchReveal.actionLabel}
        onActionPress={onRevealAction}
        onClose={onClose}
      />
      <InfernoNoteModal
        visible={openModal === 'done'}
        minWidthClass={DONE_WIDTH}
        title={DONE_TITLE}
        message={DONE_MESSAGE}
        actionLabel={DONE_ACTION}
        onActionPress={onFinishEpisode}
        onClose={onClose}
      />
      {/* "나의 빵에게" 쪽지 두 장은 ep4 와 같이 쓴다(InfernoFeedbackModals 주석 참고). */}
      <InfernoFeedbackModals
        isIntroVisible={openModal === 'feedbackIntro'}
        isDoneVisible={openModal === 'feedbackDone'}
        onClose={onClose}
        onFeedbackStart={onFeedbackStart}
        onFeedbackDone={onFeedbackDone}
      />
      {/* 다시 굽기 확인 쪽지는 ep4 와 같이 쓴다(InfernoRebakeConfirmModal 주석 참고). */}
      <InfernoRebakeConfirmModal
        visible={openModal === 'rebakeConfirm'}
        message={rebakeConfirmMessage}
        actionLabel={rebakeConfirmActionLabel}
        onRebakeStart={onRebakeStart}
        onClose={onClose}
      />
    </>
  );
}
