/**
 * [DRAFT] 10화 뒤 최종 리포트. 최종 매칭(굽기 연출) → 행동 분석 → 시즌 마무리 세 페이지다.
 * 하이라이트 페이지는 뺐다(사용자 결정). 굽기 연출은 연애·혼자 흐름 모두 튼다 — 혼자 흐름은 내 빵만 구워진다.
 */
import { useState } from 'react';
import InfernoAnalysisScene from '@/src/features/inferno/components/inferno-analysis-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoFinalMatchReveal from '@/src/features/inferno/components/inferno-final-match-reveal';
import InfernoWrapUpScene from '@/src/features/inferno/components/inferno-wrap-up-scene';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useInfernoEp5Flow from '@/src/features/inferno/hooks/use-inferno-ep5-flow';
import { useSceneSeasonStore } from '@/src/features/inferno/store/scene-season-store';
import type {
  InfernoEpisode,
  InfernoFinalMatchProfile,
  InfernoSeasonSummary,
} from '@/src/features/inferno/types';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
export default function InfernoSeasonReportScreen({
  summary,
  mine,
  sessionKey,
  solo,
  readOnly,
  displayedEpisode,
}: {
  summary: InfernoSeasonSummary;
  mine: InfernoFinalMatchProfile;
  sessionKey: string;
  solo: boolean;
  readOnly: boolean;
  displayedEpisode?: InfernoEpisode;
}) {
  const exit = useEpisodeExit(10);
  const page = useSceneSeasonStore((state) => state.sessions[sessionKey]?.reportPage ?? 0);
  const save = useSceneSeasonStore((state) => state.saveReport);
  const flow = useInfernoEp5Flow(readOnly ? 0 : page, readOnly);
  const [baking, setBaking] = useState(!readOnly && page === 0);
  function handleBakeComplete() {
    setBaking(false);
  }

  function leave() {
    if (!readOnly) save(sessionKey, flow.pageIndex);
    exit.leave();
  }
  // 10화 쪽지(시즌 종료 쪽지)는 서버가 10화 완료 때 만든다 — 여기서 따로 만들지 않는다.
  function finish() {
    if (!readOnly) save(sessionKey, 0);
    exit.completeAndLeave();
  }
  return (
    <InfernoEpisodeFrame
      episode={displayedEpisode ?? findInfernoEpisode(10) ?? { order: 10, title: '' }}
      surface="note"
      skipLabel={exit.skipLabel}
      onSkipPress={leave}
      onPreviousPress={baking ? undefined : flow.goPrevious}
      onNextPress={baking ? undefined : flow.goNext}
    >
      {flow.pageIndex === 0 ? (
        <InfernoFinalMatchReveal
          mine={mine}
          partner={solo ? undefined : summary.finalMatch.profile}
          summaryLine={summary.finalMatch.summaryLine}
          isPlaying={baking}
          onComplete={handleBakeComplete}
          solo={solo}
        />
      ) : flow.pageIndex === 1 ? (
        <InfernoAnalysisScene report={summary.report} />
      ) : (
        <InfernoWrapUpScene onEndSeasonPress={finish} />
      )}
    </InfernoEpisodeFrame>
  );
}
