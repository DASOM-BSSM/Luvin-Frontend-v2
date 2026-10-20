import { useEffect, useState } from 'react';

/**
 * 기다리는 상태가 `thresholdMs` 를 넘겼는지. ep5 리포트 대기 문구를 "생각보다 오래 걸리고 있어요" 로
 * 바꿀 때 쓴다(constants/bake.ts 의 BAKE_WAIT_SLOW_AFTER_MS). 기다림이 끝나면 다시 false 로 돌아간다.
 */
export default function useWaitingTooLong(isWaiting: boolean, thresholdMs: number) {
  const [hasWaitedLong, setHasWaitedLong] = useState(false);

  useEffect(() => {
    if (!isWaiting) {
      setHasWaitedLong(false);
      return;
    }

    function handleThresholdPassed() {
      setHasWaitedLong(true);
    }

    const timer = setTimeout(handleThresholdPassed, thresholdMs);
    return () => clearTimeout(timer);
  }, [isWaiting, thresholdMs]);

  return isWaiting && hasWaitedLong;
}
