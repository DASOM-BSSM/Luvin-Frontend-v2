import { useEffect, useState } from 'react';

/**
 * ep5 "반죽 → 연기 → 구운 빵" 굽기 연출(InfernoFinalMatchReveal)을 틀지.
 *
 * - AI가 리포트를 만드는 중(`isGenerating`)인 걸 한 번이라도 봤으면 연출을 튼다. 기다리는 동안 내 반죽이
 *   연기 속에서 구워지고(리포트 대기 화면), 리포트가 오면 같은 자리에서 상대와 함께 구운 빵으로 나와 1페이지가
 *   된다(constants/bake.ts 흐름). 다시 들어왔을 때 리포트가 이미 와 있으면 기다린 적이 없으니 연출 없이
 *   바로 1페이지다.
 * - 지난 시즌 다시 보기와 이어보기(2페이지 이후에서 다시 들어옴)는 `canPlay` 로 막는다.
 * - 연출이 끝났다고 알릴 때(`handleComplete`) 내린다.
 */
export default function useEp5Bake(isGenerating: boolean, canPlay: boolean) {
  const shouldStart = isGenerating && canPlay;
  const [hasStarted, setHasStarted] = useState(shouldStart);
  const [hasFinished, setHasFinished] = useState(false);

  // 리포트가 와서 isGenerating 이 꺼져도 연출은 마저 틀어야 해서 "기다렸음" 을 따로 남긴다.
  useEffect(() => {
    if (shouldStart) setHasStarted(true);
  }, [shouldStart]);

  function handleComplete() {
    setHasFinished(true);
  }

  return {
    /** 굽기 연출이 남아 있는 동안 true(리포트를 기다리는 동안 포함). 이 동안 다음 페이지로 못 넘어간다. */
    isShowing: !hasFinished && (hasStarted || shouldStart),
    handleComplete,
  };
}
