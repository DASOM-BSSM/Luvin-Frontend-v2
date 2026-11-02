/**
 * [DRAFT] 장면 전환 쪽지. Figma `REBAKE` modal (7856:3959).
 *
 * "REBAKE" 제목 아래 전환 문구(예: "쉬는시간, 복도에서 프레첼과")와 "1:1 대화하기" 버튼을 쪽지 모달로
 * 띄운다. 문구는 시안에 적힌 그대로다(사용자 결정) — 다음이 혼자 있는 장면이어도 버튼은 같다.
 *
 * 쪽지 자체가 이 장면이라 바깥을 누르거나 뒤로가기를 해도 닫지 않는다 — 닫히면 빈 화면만 남는다.
 * 모달이 상하 바까지 덮으므로 넘어가는 길은 버튼 하나다.
 */
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import { breakAtPunctuation } from '@/src/features/inferno/utils/format';

/** Figma 7856:3965. 시안은 "REBAKE" 지만 "BAKING" 으로 바꿨다(사용자 결정). */
const TITLE = 'BAKING';
/** Figma 7856:3967. */
const ACTION_LABEL = '1:1 대화하기';

interface InfernoTransitionSceneProps {
  text: string;
  onNext: () => void;
}

export default function InfernoTransitionScene({
  text,
  onNext,
}: InfernoTransitionSceneProps) {
  function handleClose() {
    // 일부러 비워 둔다(위 주석 참고).
  }

  return (
    <InfernoNoteModal
      visible
      minWidthClass="min-w-[344px]"
      title={TITLE}
      message={breakAtPunctuation(text)}
      actionLabel={ACTION_LABEL}
      onActionPress={onNext}
      onClose={handleClose}
    />
  );
}
