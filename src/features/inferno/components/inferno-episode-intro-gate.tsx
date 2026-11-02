/**
 * [DRAFT] 본문 앞 소개(1화만): 무대 제목 → 등장인물(세 명씩 여러 장).
 *
 * 몇 번째 장인지는 use-episode-playback 이 들고 있다 — 화면을 탭해도, 상단 바 "다음화면 >"를 눌러도 같은
 * 다음 장으로 가야 해서(사용자 요청) 이 컴포넌트는 받은 장만 그린다. 소개는 건너뛸 수 없다(사용자 결정 —
 * 다시 보기여도 마찬가지).
 *
 * 매 회차 상황 소개 화면(회차 제목·상황)은 없앴다(사용자 결정). 회차 이름은 어느 화면이나 같은 목록
 * (constants/episodes.ts)을 쓴다.
 */
import InfernoCastIntro from '@/src/features/inferno/components/inferno-cast-intro';
import InfernoStageIntro from '@/src/features/inferno/components/inferno-stage-intro';
import type { StageIntro } from '@/src/features/inferno/types/story';
import type { IntroStep } from '@/src/features/inferno/utils/story-playlist';

interface InfernoEpisodeIntroGateProps {
  stageIntro: StageIntro | null;
  step: IntroStep | undefined;
  onNext: () => void;
}

export default function InfernoEpisodeIntroGate({
  stageIntro,
  step,
  onNext,
}: InfernoEpisodeIntroGateProps) {
  if (!stageIntro || !step) return null;
  if (step.kind === 'stage')
    return (
      <InfernoStageIntro
        title={stageIntro.title}
        subtitle={stageIntro.subtitle}
        onNext={onNext}
      />
    );
  return <InfernoCastIntro members={step.members} onNext={onNext} />;
}
