/**
 * [DRAFT] 본문 앞 소개 순서: (1화만) 무대 제목 → 등장인물 → (매 회차) 상황 소개.
 * 서버가 주지 않은 단계는 건너뛴다. 무대 소개는 처음 볼 때는 끝까지 보고, 다시 볼 때는
 * 건너뛸 수 있다.
 */
import { useState } from 'react';

import InfernoCastCarousel from '@/src/features/inferno/components/inferno-cast-carousel';
import InfernoEpisodeIntro from '@/src/features/inferno/components/inferno-episode-intro';
import InfernoStageIntro from '@/src/features/inferno/components/inferno-stage-intro';
import type { EpisodeIntro, StageIntro } from '@/src/features/inferno/types/story';

type IntroStep = 'stage' | 'cast' | 'situation';

interface InfernoEpisodeIntroGateProps {
  order: number;
  stageIntro: StageIntro | null;
  intro: EpisodeIntro | null;
  /** 이미 본 회차(다시 보기)면 무대 소개를 건너뛸 수 있다. */
  skippable: boolean;
  onDone: () => void;
}

export default function InfernoEpisodeIntroGate({
  order,
  stageIntro,
  intro,
  skippable,
  onDone,
}: InfernoEpisodeIntroGateProps) {
  const [step, setStep] = useState<IntroStep>('stage');

  function goToSituation() {
    if (intro) setStep('situation');
    else onDone();
  }

  function handleStageNext() {
    if (stageIntro && stageIntro.cast.length > 0) setStep('cast');
    else goToSituation();
  }

  if (step === 'stage' && stageIntro)
    return (
      <InfernoStageIntro
        title={stageIntro.title}
        subtitle={stageIntro.subtitle}
        skippable={skippable}
        onNext={handleStageNext}
        onSkip={goToSituation}
      />
    );
  if (step === 'cast' && stageIntro)
    return (
      <InfernoCastCarousel cast={stageIntro.cast} skippable={skippable} onStart={goToSituation} />
    );
  if (intro)
    return (
      <InfernoEpisodeIntro
        order={order}
        title={intro.title}
        situation={intro.situation}
        onStart={onDone}
      />
    );
  return null;
}
