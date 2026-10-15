import { useEffect, useState } from 'react';

/**
 * 회차 대화를 AI가 만드는 동안 띄우는 빵 줄넘기 로더(BreadJumpRopeLoader)의 표시 여부.
 *
 * 대화가 도착하면 화면은 곧바로 대화로 바뀌려 하는데, 그러면 로더가 퇴장 애니메이션 없이
 * 뚝 끊긴다. 그래서 생성이 끝나도(isGenerating=false) 로더가 퇴장을 마칠 때까지는
 * `isShowing`을 켜 둬서 화면이 로더를 계속 그리게 하고, 퇴장이 끝나면 대화로 넘어간다.
 *
 * 처음 들어왔을 때 이미 대화가 있으면(캐시 등) 로더 없이 바로 대화를 보여준다.
 */
export default function useGenerationLoader(isGenerating: boolean) {
  const [hasExited, setHasExited] = useState(!isGenerating);

  // "다시 시도" 등으로 다시 생성에 들어가면 로더를 다시 띄운다.
  useEffect(() => {
    if (isGenerating) setHasExited(false);
  }, [isGenerating]);

  function handleExitComplete() {
    setHasExited(true);
  }

  return {
    /** 로더(입장~퇴장)를 그려야 하는 동안 true. 화면은 이때 대화 대신 로더를 그린다. */
    isShowing: isGenerating || !hasExited,
    handleExitComplete,
  };
}
