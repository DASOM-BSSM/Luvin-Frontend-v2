import { useState } from 'react';

import InfernoFinalMatchScene from '@/src/features/inferno/components/inferno-final-match-scene';
import useBakeClock from '@/src/features/inferno/hooks/use-bake-clock';
import type { InfernoFinalMatchProfile } from '@/src/features/inferno/types';

/** ep5 1페이지 제목(Figma ep5-결과 5748:4322). */
const REPORT_TITLE = 'REPORT';

interface InfernoFinalMatchRevealProps {
  mine: InfernoFinalMatchProfile;
  /** 최종 상대. 리포트가 오기 전(굽기 연출로 기다리는 동안)에는 없다. */
  partner?: InfernoFinalMatchProfile;
  summaryLine?: string;
  /** 이름 옆 상대 성향 라벨(InfernoFinalMatchResult.tendencyLabel). 서버가 아직 안 줘서 지금은 비어 있다. */
  tendencyLabel?: string;
  /** 리포트를 기다리는 동안 이름 자리에 띄울 문구. */
  waitMessage?: string;
  /** 굽기 연출을 틀지. false 면 처음부터 구운 빵 1페이지다(지난 시즌·이어보기·리포트가 이미 와 있던 경우). */
  isPlaying: boolean;
  /** 연출이 끝났을 때. 화면은 그대로 1페이지로 남는다. */
  onComplete: () => void;
}

/**
 * ep5 1페이지(Figma ep5-결과 5748:4314). 리포트를 기다리는 동안 같은 자리에서 굽기 연출을 튼다(use-ep5-bake).
 * 연출을 틀든 안 틀든 같은 시계·같은 화면을 쓴다 — 안 틀 때는 시계를 끝 시각에 둔다. 그래서 연출이 끝난
 * 화면과 처음부터 1페이지인 화면이 같고, 끝나는 순간 컴포넌트가 바뀌며 그림이 다시 그려지는 일도 없다.
 *
 * 상대(`partner`)는 리포트가 와야 생긴다. 와도 바로 줄에 세우지 않고, 연기가 다 덮은 채 빵으로 바뀌는
 * 순간(`onSwap`)에 세운다 — 상대가 줄에 끼면 내 빵 자리가 옆으로 옮겨지는데, 그게 연기 뒤에서 일어나야
 * 튀어 보이지 않는다.
 */
export default function InfernoFinalMatchReveal({
  mine,
  partner,
  summaryLine,
  tendencyLabel,
  waitMessage,
  isPlaying,
  onComplete,
}: InfernoFinalMatchRevealProps) {
  const [hasSwapped, setHasSwapped] = useState(!isPlaying);

  function handleSwap() {
    setHasSwapped(true);
  }

  const time = useBakeClock({ isPlaying, isReleased: partner !== undefined, onSwap: handleSwap, onComplete });

  return (
    <InfernoFinalMatchScene
      title={REPORT_TITLE}
      mine={mine}
      partner={hasSwapped ? partner : undefined}
      summaryLine={summaryLine}
      tendencyLabel={tendencyLabel}
      waitMessage={hasSwapped ? undefined : waitMessage}
      reveal={time}
    />
  );
}
