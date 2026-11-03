/**
 * [DRAFT] 떠 있는 모달을 먼저 닫고, 완전히 사라진 뒤에 회차를 나간다.
 *
 * iOS 에서 모달이 떠 있는 채로 회차를 나가면(세로로 회전 + 화면 닫힘) 그 모달이 보이지 않는 막으로 남아
 * 다음 화면의 탭을 전부 가로챘다 — 3화 "에피소드 끝내기" 뒤 4화 시작 화면이 눌리지 않았다(시뮬레이터 로그로
 * 확인: 4화 시작 화면에 터치가 아예 닿지 않았다). 그래서 나가기 전에 모달부터 내린다.
 *
 * 화면은 `leaving` 동안 모든 모달을 숨기고, 모달이 닫혔다는 신호(onDismiss)를 `handleModalGone` 으로 넘긴다.
 * 신호가 안 와도(안드로이드, 또는 이미 닫혀 있던 경우) 잠시 뒤에 나간다.
 */
import { useEffect, useRef, useState } from 'react';

/** 닫힘 신호를 기다리는 최대 시간. iOS 모달 닫힘 애니메이션보다 길게 둔다. */
const MODAL_CLOSE_WAIT_MS = 600;

export default function useLeaveAfterModals() {
  const [leaving, setLeaving] = useState(false);
  const action = useRef<(() => void) | null>(null);

  function run() {
    const next = action.current;
    action.current = null;
    next?.();
  }

  // 신호가 안 올 때를 대비한 타이머라 effect 에서 한다.
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(run, MODAL_CLOSE_WAIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  /** 모달을 내린 뒤 `leave` 를 한 번 부른다. */
  function leaveAfterModals(leave: () => void) {
    action.current = leave;
    setLeaving(true);
  }

  return { leaving, leaveAfterModals, handleModalGone: run };
}
