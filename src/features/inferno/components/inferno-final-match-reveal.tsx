import InfernoFinalMatchScene from '@/src/features/inferno/components/inferno-final-match-scene';
import useBakeClock from '@/src/features/inferno/hooks/use-bake-clock';
import type { InfernoFinalMatchProfile } from '@/src/features/inferno/types';

interface InfernoFinalMatchRevealProps {
  mine: InfernoFinalMatchProfile;
  partner: InfernoFinalMatchProfile;
  summaryLine: string;
  /** 등장 연출을 틀지. false 면 처음부터 구운 빵 RESULT 다(지난 시즌·이어보기·리포트가 이미 와 있던 경우). */
  isPlaying: boolean;
  /** 연출이 끝났을 때. 화면은 그대로 RESULT 로 남는다. */
  onComplete: () => void;
}

/**
 * ep5 RESULT. 리포트가 막 도착했으면 같은 자리에서 "반죽 → 연기 → 구운 빵" 등장 연출을 튼다(use-ep5-bake).
 * 연출을 틀든 안 틀든 같은 시계·같은 화면을 쓴다 — 안 틀 때는 시계를 끝 시각에 둔다. 그래서 연출이 끝난
 * 화면과 처음부터 RESULT 인 화면이 같고, 끝나는 순간 컴포넌트가 바뀌며 그림이 다시 그려지는 일도 없다.
 */
export default function InfernoFinalMatchReveal({
  mine,
  partner,
  summaryLine,
  isPlaying,
  onComplete,
}: InfernoFinalMatchRevealProps) {
  const time = useBakeClock(isPlaying, onComplete);

  return <InfernoFinalMatchScene mine={mine} partner={partner} summaryLine={summaryLine} reveal={time} />;
}
