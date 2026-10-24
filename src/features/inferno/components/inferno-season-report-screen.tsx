/** [DRAFT] Existing report scenes and bake animation preserved after episode ten. */
import { useState } from 'react';
import { View } from 'react-native';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import InfernoAnalysisScene from '@/src/features/inferno/components/inferno-analysis-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoFinalMatchReveal from '@/src/features/inferno/components/inferno-final-match-reveal';
import InfernoHighlightScene from '@/src/features/inferno/components/inferno-highlight-scene';
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
  const [baking, setBaking] = useState(!readOnly && page === 0 && !solo);
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
        solo ? (
          <View className="flex-1 items-center justify-center gap-[12px]">
            <Text variant="heading-h3" className="text-pink-500">
              RESULT
            </Text>
            <BreadCharacter type={mine.type} state="baked" className="h-[100px] w-[150px]" />
            <Text variant="body-m" className="text-text-primary">
              {summary.finalMatch.summaryLine}
            </Text>
          </View>
        ) : (
          <InfernoFinalMatchReveal
            mine={mine}
            partner={summary.finalMatch.profile}
            summaryLine={summary.finalMatch.summaryLine}
            isPlaying={baking}
            onComplete={() => setBaking(false)}
          />
        )
      ) : flow.pageIndex === 1 ? (
        <InfernoAnalysisScene report={summary.report} />
      ) : flow.pageIndex === 2 ? (
        <InfernoHighlightScene highlights={summary.highlights} />
      ) : (
        <InfernoWrapUpScene onEndSeasonPress={finish} />
      )}
    </InfernoEpisodeFrame>
  );
}
