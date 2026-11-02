/**
 * [DRAFT] 회차 종료 모달을 띄울 시점.
 *
 * iOS 는 모달 두 개를 겹쳐 띄우지 못한다. 투표 장면에서 회차가 끝나면(투표 직후, "○○ 투표함"의 "다음으로")
 * 투표 모달이 다 닫힌 뒤에 종료 모달을 띄운다 — 겹쳐 띄우면 종료 모달이 안 떠서 화면이 멈췄다(시뮬레이터에서
 * 확인). 안드로이드는 이 제약이 없어서 바로 띄운다.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * 투표 모달이 닫혔다는 신호(onDismiss)를 이만큼 기다려도 안 오면 그냥 띄운다. 투표가 끝나는 순간 투표 화면이
 * 통째로 바뀌면서 모달이 사라지면 iOS 가 신호를 보내지 않는 경우가 있다. 닫힘 애니메이션보다 길게 둔다.
 */
const CHOICE_MODAL_CLOSE_WAIT_MS = 600;

export default function useDoneModalGate(done: boolean, onChoiceScene: boolean, onClose: () => void) {
  const waits = Platform.OS === 'ios' && onChoiceScene;
  const [choiceModalClosed, setChoiceModalClosed] = useState(false);

  // 종료 모달을 띄울 시점을 잡는 타이머라 effect 에서 한다(위 상수 주석).
  useEffect(() => {
    if (!done || !waits || choiceModalClosed) return;
    const timer = setTimeout(() => setChoiceModalClosed(true), CHOICE_MODAL_CLOSE_WAIT_MS);
    return () => clearTimeout(timer);
  }, [done, waits, choiceModalClosed]);

  function handleChoiceModalDismiss() {
    if (done) setChoiceModalClosed(true);
  }

  function handleClose() {
    setChoiceModalClosed(false);
    onClose();
  }

  return {
    visible: done && (!waits || choiceModalClosed),
    handleChoiceModalDismiss,
    handleClose,
  };
}
