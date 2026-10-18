import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';

/** "나의 빵에게" 안내 쪽지. Figma `나의 빵에게` (5467:6077~5467:6085), 폭 344. */
const FEEDBACK_TITLE = 'TO.ME';
const FEEDBACK_INTRO_MESSAGE = '나의 반죽에게 의견을 주세요!';
const FEEDBACK_INTRO_ACTION = '피드백하기';
const FEEDBACK_WIDTH = 'min-w-[344px]';

/**
 * 피드백 완료 쪽지. 시안에 없는 화면이라 문구는 사용자와 정한 것이고, 생김새는 같은
 * 쪽지 모달을 그대로 쓴다.
 */
const FEEDBACK_DONE_MESSAGE = '피드백이 전달되었어요!';
const FEEDBACK_DONE_ACTION = '대화로 돌아가기';

interface InfernoFeedbackModalsProps {
  isIntroVisible: boolean;
  isDoneVisible: boolean;
  onClose: () => void;
  onFeedbackStart: () => void;
  onFeedbackDone: () => void;
}

/**
 * "나의 빵에게" 쪽지 두 장(안내·완료). ep2 와 ep4 가 똑같이 쓴다 — 원래 InfernoEp2Modals 안에
 * 있던 것을 ep4 에도 붙이면서 옮겼다.
 */
export default function InfernoFeedbackModals({
  isIntroVisible,
  isDoneVisible,
  onClose,
  onFeedbackStart,
  onFeedbackDone,
}: InfernoFeedbackModalsProps) {
  return (
    <>
      <InfernoNoteModal
        visible={isIntroVisible}
        minWidthClass={FEEDBACK_WIDTH}
        title={FEEDBACK_TITLE}
        message={FEEDBACK_INTRO_MESSAGE}
        actionLabel={FEEDBACK_INTRO_ACTION}
        onActionPress={onFeedbackStart}
        onClose={onClose}
      />
      <InfernoNoteModal
        visible={isDoneVisible}
        minWidthClass={FEEDBACK_WIDTH}
        title={FEEDBACK_TITLE}
        message={FEEDBACK_DONE_MESSAGE}
        actionLabel={FEEDBACK_DONE_ACTION}
        // 완료를 알린 쪽지라 어떻게 닫든 대화로 돌아간다.
        onActionPress={onFeedbackDone}
        onClose={onFeedbackDone}
      />
    </>
  );
}
