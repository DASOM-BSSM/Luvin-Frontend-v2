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
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { usePartnerLetterStore } from '@/src/features/inferno/store/partner-letter-store';
import { useSceneSeasonStore } from '@/src/features/inferno/store/scene-season-store';
import type {
  InfernoEpisode,
  InfernoFinalMatchProfile,
  InfernoSeasonSummary,
} from '@/src/features/inferno/types';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { buildPartnerLetterSender } from '@/src/features/inferno/utils/partner-letter';
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
  const complete = useSceneSeasonStore((state) => state.complete);
  const save = useSceneSeasonStore((state) => state.saveReport);
  const flow = useInfernoEp5Flow(readOnly ? 0 : page, readOnly);
  const [baking, setBaking] = useState(!readOnly && page === 0 && !solo);
  const queueLetter = usePartnerLetterStore((state) => state.queueLetter);
  const requestNextSeasonNotice = useInfernoStore((state) => state.requestNextSeasonNotice);
  function leave() {
    if (!readOnly) save(sessionKey, flow.pageIndex);
    exit.leave();
  }
  function finish(next: boolean) {
    if (!readOnly) {
      const sender = buildPartnerLetterSender(summary.finalMatch, String(Date.now()));
      queueLetter(
        solo
          ? {
              ...sender,
              draftMessage:
                '같은 오븐에서 서로의 마음을 들어줘서 고마워. 네 속도로 지내도 괜찮아. 이야기하고 싶을 때 다시 만나자.',
            }
          : sender,
      );
      if (next) requestNextSeasonNotice();
      save(sessionKey, 0);
      complete(sessionKey, 10);
    }
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
        <InfernoWrapUpScene
          onEndSeasonPress={() => finish(false)}
          onNextSeasonPress={() => finish(true)}
        />
      )}
    </InfernoEpisodeFrame>
  );
}
