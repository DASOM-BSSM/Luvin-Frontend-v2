/**
 * [DRAFT] 1화 소개 장 넘기기(무대 제목 → 등장인물 세 명씩). 화면 탭과 상단 바 이전/다음이 같은 장을
 * 넘겨야 해서(사용자 요청) 장 위치를 화면이 아니라 여기서 들고 있다.
 */
import { useState } from 'react';

import type { StageIntro } from '@/src/features/inferno/types/story';
import { introStepsOf } from '@/src/features/inferno/utils/story-playlist';

export default function useIntroSteps(stageIntro: StageIntro | null | undefined, onDone: () => void) {
  const [index, setIndex] = useState(0);
  const steps = introStepsOf(stageIntro);

  // 다음 장. 마지막 장이면 본문으로 넘어간다.
  function next() {
    if (index + 1 < steps.length) setIndex(index + 1);
    else onDone();
  }

  function previous() {
    setIndex(Math.max(0, index - 1));
  }

  return {
    step: steps[Math.min(index, Math.max(0, steps.length - 1))],
    next,
    /** 첫 장이면 돌아갈 곳이 없다. */
    previous: index > 0 ? previous : undefined,
  };
}
