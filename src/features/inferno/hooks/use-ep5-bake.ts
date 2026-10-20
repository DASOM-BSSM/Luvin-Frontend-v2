import { useEffect, useState } from 'react';

/**
 * ep5 RESULT 에서 "반죽 → 연기 → 구운 빵" 등장 연출(InfernoFinalMatchReveal)을 틀지.
 *
 * - AI가 리포트를 만드는 중(`isGenerating`)인 걸 한 번이라도 봤으면 연출을 예약한다. 기다리는 동안은 대기
 *   문구만 뜨고, 리포트가 도착해 RESULT 가 그려지면 그 자리에서 연출이 돈다. 다시 들어왔을 때 리포트가
 *   이미 와 있으면 기다린 적이 없으니 연출 없이 바로 RESULT 다.
 * - 지난 시즌 다시 보기와 이어보기(2페이지 이후에서 다시 들어옴)는 `canPlay` 로 막는다.
 * - 연출이 끝났다고 알릴 때(`handleComplete`) 내린다.
 */
export default function useEp5Bake(isGenerating: boolean, canPlay: boolean) {
  const shouldStart = isGenerating && canPlay;
  const [hasStarted, setHasStarted] = useState(shouldStart);
  const [hasFinished, setHasFinished] = useState(false);

  // 리포트가 와서 isGenerating 이 꺼져도 연출은 틀어야 해서 "기다렸음" 을 따로 남긴다.
  useEffect(() => {
    if (shouldStart) setHasStarted(true);
  }, [shouldStart]);

  function handleComplete() {
    setHasFinished(true);
  }

  return {
    /** 등장 연출이 남아 있는 동안 true. 이 동안 RESULT 는 연출을 틀고 다음 페이지로 못 넘어간다. */
    isShowing: !hasFinished && (hasStarted || shouldStart),
    handleComplete,
  };
}
