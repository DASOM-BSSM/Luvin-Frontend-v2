import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';

import { getInfernoSeasonSummary } from '@/src/features/inferno/api/season-summary';
import InfernoAnalysisScene from '@/src/features/inferno/components/inferno-analysis-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoFinalMatchReveal from '@/src/features/inferno/components/inferno-final-match-reveal';
import InfernoHighlightScene from '@/src/features/inferno/components/inferno-highlight-scene';
import InfernoWrapUpScene from '@/src/features/inferno/components/inferno-wrap-up-scene';
import { BAKE_WAIT_MESSAGE } from '@/src/features/inferno/constants/bake';
import useEp5Bake from '@/src/features/inferno/hooks/use-ep5-bake';
import useInfernoEp5Flow from '@/src/features/inferno/hooks/use-inferno-ep5-flow';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import type { BreadProfile } from '@/src/features/home/types';

const PREVIEW_PROFILE: BreadProfile = {
  type: 'salt',
  state: 'personDough',
  name: '쫀쫀한 소금빵 반죽',
  description: '저는 오직 제 사람에게만 따뜻해요',
};

/** 개발 전용. 실제 시즌·토큰·완료 기록을 변경하지 않는다. */
export default function Ep5PreviewScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Ep5Preview />;
}

function Ep5Preview() {
  const [isGenerating, setIsGenerating] = useState(true);
  const flow = useInfernoEp5Flow(0);
  const bake = useEp5Bake(isGenerating, true);
  const summary = getInfernoSeasonSummary(5);
  const episode = findInfernoEpisode(5);

  useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!summary || !episode) return null;
  function leavePreview() {
    router.replace('/');
  }

  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface="note"
      skipLabel="미리보기 나가기"
      onSkipPress={leavePreview}
      onPreviousPress={bake.isShowing ? undefined : flow.goPrevious}
      onNextPress={bake.isShowing ? undefined : flow.goNext}
    >
      {bake.isShowing || flow.pageIndex === 0 ? (
        <InfernoFinalMatchReveal
          mine={PREVIEW_PROFILE}
          partner={isGenerating ? undefined : summary.finalMatch.profile}
          summaryLine={summary.finalMatch.summaryLine}
          waitMessage={BAKE_WAIT_MESSAGE}
          isPlaying={bake.isShowing}
          onComplete={bake.handleComplete}
        />
      ) : flow.pageIndex === 1 ? (
        <InfernoAnalysisScene report={summary.report} />
      ) : flow.pageIndex === 2 ? (
        <InfernoHighlightScene highlights={summary.highlights} />
      ) : (
        <InfernoWrapUpScene
          onEndSeasonPress={leavePreview}
          onNextSeasonPress={leavePreview}
        />
      )}
    </InfernoEpisodeFrame>
  );
}
