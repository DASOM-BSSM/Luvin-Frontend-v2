/**
 * [DRAFT] 본문 앞을 가리는 화면 하나: 회차 열기 → 생성 대기(빵 줄넘기) → 소개(1화 무대·등장인물).
 * 어떤 화면을 띄울지는 use-episode-playback 의 `gate` 가 정한다.
 */
import InfernoEpisodeIntroGate from '@/src/features/inferno/components/inferno-episode-intro-gate';
import InfernoEpisodeStatus from '@/src/features/inferno/components/inferno-episode-status';
import InfernoEpisodeUnlockView from '@/src/features/inferno/components/inferno-episode-unlock-view';
import type { EpisodeContent, EpisodeGate } from '@/src/features/inferno/types/story';
import type { IntroStep } from '@/src/features/inferno/utils/story-playlist';

interface InfernoEpisodeGateViewProps {
  gate: EpisodeGate;
  order: number;
  content: EpisodeContent | undefined;
  tokenCost: number | null;
  isGenerating: boolean;
  onUnlocked: () => void;
  onLoaderExitComplete: () => void;
  /** 지금 보여줄 1화 소개 장(use-episode-playback 이 정한다). */
  introStep: IntroStep | undefined;
  /** 소개 다음 장(마지막 장이면 본문으로). */
  onIntroNext: () => void;
}

export default function InfernoEpisodeGateView({
  gate,
  order,
  content,
  tokenCost,
  isGenerating,
  onUnlocked,
  onLoaderExitComplete,
  introStep,
  onIntroNext,
}: InfernoEpisodeGateViewProps) {
  if (gate === 'unlock')
    return <InfernoEpisodeUnlockView order={order} tokenCost={tokenCost} onUnlocked={onUnlocked} />;
  if (gate === 'loader')
    return (
      <InfernoEpisodeStatus
        isError={false}
        isLoading={isGenerating}
        isLoaderShowing
        onLoaderExitComplete={onLoaderExitComplete}
      />
    );
  return (
    <InfernoEpisodeIntroGate
      stageIntro={content?.stageIntro ?? null}
      step={introStep}
      onNext={onIntroNext}
    />
  );
}
