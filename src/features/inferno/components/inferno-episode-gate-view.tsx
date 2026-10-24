/**
 * [DRAFT] 본문 앞을 가리는 화면 하나: 회차 열기 → 생성 대기(빵 줄넘기) → 소개(무대·상황).
 * 어떤 화면을 띄울지는 use-episode-playback 의 `gate` 가 정한다.
 */
import InfernoEpisodeIntroGate from '@/src/features/inferno/components/inferno-episode-intro-gate';
import InfernoEpisodeStatus from '@/src/features/inferno/components/inferno-episode-status';
import InfernoEpisodeUnlockView from '@/src/features/inferno/components/inferno-episode-unlock-view';
import type { EpisodeContent, EpisodeGate } from '@/src/features/inferno/types/story';

interface InfernoEpisodeGateViewProps {
  gate: EpisodeGate;
  order: number;
  content: EpisodeContent | undefined;
  tokenCost: number | null;
  isGenerating: boolean;
  skippable: boolean;
  onUnlocked: () => void;
  onLoaderExitComplete: () => void;
  onIntroDone: () => void;
}

export default function InfernoEpisodeGateView({
  gate,
  order,
  content,
  tokenCost,
  isGenerating,
  skippable,
  onUnlocked,
  onLoaderExitComplete,
  onIntroDone,
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
      order={order}
      stageIntro={content?.stageIntro ?? null}
      intro={content?.intro ?? null}
      skippable={skippable}
      onDone={onIntroDone}
    />
  );
}
