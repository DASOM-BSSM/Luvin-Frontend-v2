/** [DRAFT] Shared landscape body, existing entry screen and exit shell are retained. */
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import Skeleton from '@/src/components/ui/skeleton';
import { getEpisodeContent, submitEpisodeChoice } from '@/src/features/inferno/api/episode-content';
import { episodeContentKeys } from '@/src/features/inferno/api/query-keys';
import InfernoHistoryScreen from '@/src/features/inferno/components/inferno-history-screen';
import InfernoBlockPlayer from '@/src/features/inferno/components/inferno-block-player';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import InfernoSeasonReportScreen from '@/src/features/inferno/components/inferno-season-report-screen';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useInfernoBlockFlow from '@/src/features/inferno/hooks/use-inferno-block-flow';
import useInfernoProgress from '@/src/features/inferno/hooks/use-inferno-progress';
import useViewedSeason from '@/src/features/inferno/hooks/use-viewed-season';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import {
  emptySceneSeason,
  useSceneSeasonStore,
} from '@/src/features/inferno/store/scene-season-store';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import { SCENE_CAST } from '@/src/features/inferno/api/mocks/scene-cast';
import { buildSceneSummary } from '@/src/features/inferno/utils/scene-summary';

export default function InfernoEpisodeScreen({ order }: { order: number }) {
  const status = useAiSeasonStatus();
  const { completedOrders } = useInfernoProgress();
  const owner = useInfernoStore((state) => state.ownerUserId);
  const { pastSeasonId, isPastSeason } = useViewedSeason();
  const sessionKey = `${owner ?? 'guest'}:${pastSeasonId ?? status.data?.seasonId ?? 'draft'}`;
  if (isPastSeason) return <InfernoHistoryScreen order={order} />;
  // Wait for the season before mounting the stateful player.
  if (status.isLoading && !pastSeasonId)
    return (
      <InfernoEpisodeFrame episode={findInfernoEpisode(order) ?? { order, title: '' }}>
        <View className="flex-1 justify-center">
          <Text variant="body-m">시즌을 불러오고 있어요.</Text>
        </View>
      </InfernoEpisodeFrame>
    );
  return (
    <EpisodeBody
      key={`${sessionKey}:${order}`}
      order={order}
      sessionKey={sessionKey}
      readOnly={isPastSeason || completedOrders.includes(order)}
    />
  );
}
function EpisodeBody({
  order,
  sessionKey,
  readOnly,
}: {
  order: number;
  sessionKey: string;
  readOnly: boolean;
}) {
  const exit = useEpisodeExit(order);
  const mine = useBreadStore((state) => state.profile) ?? SCENE_CAST[0];
  const session = useSceneSeasonStore((state) => state.sessions[sessionKey]);
  const complete = useSceneSeasonStore((state) => state.complete);
  const record = useSceneSeasonStore((state) => state.record);
  const save = useSceneSeasonStore((state) => state.save);
  const season = session?.season ?? emptySceneSeason();
  const [done, setDone] = useState(false);
  const [report, setReport] = useState(!readOnly && session?.positions[order] === -1);
  const episode = findInfernoEpisode(order) ?? { order, title: '' };
  const content = useQuery({
    queryKey: episodeContentKeys.content(sessionKey, order, season.choices, mine),
    queryFn: () => getEpisodeContent(order, season, mine),
  });
  const blocks = content.data?.blocks ?? [];
  const initial =
    readOnly || session?.positions[order] === -1 ? 0 : (session?.positions[order] ?? 0);
  const flow = useInfernoBlockFlow(initial, blocks, () => setDone(true));
  const block = flow.block;
  const recorded =
    block?.type === 'choice'
      ? season.choices.find((choice) => choice.pointId === block.choice.pointId)
      : undefined;
  function leave() {
    if (!readOnly) save(sessionKey, order, flow.position);
    exit.leave();
  }
  const selection = useMutation({
    mutationFn: (breadId: string | null) => {
      if (block?.type !== 'choice') throw new Error('Choice block required');
      return submitEpisodeChoice(season, block.choice.pointId, order, breadId);
    },
    onSuccess: (result) => {
      record(sessionKey, result);
      flow.selected();
    },
  });
  function select(breadId: string | null) {
    if (readOnly || recorded || selection.isPending || block?.type !== 'choice') return;
    selection.mutate(breadId);
  }

  function finish() {
    setDone(false);
    if (order === 10) {
      if (!readOnly) save(sessionKey, order, -1);
      setReport(true);
    } else {
      if (!readOnly) save(sessionKey, order, 0);
      if (!readOnly) complete(sessionKey, order);
      exit.completeAndLeave();
    }
  }
  if (report)
    return (
      <InfernoSeasonReportScreen
        summary={buildSceneSummary(season)}
        mine={mine}
        sessionKey={sessionKey}
        solo={season.route !== 'romance'}
        readOnly={readOnly}
      />
    );
  const choiceReady = block?.type === 'choice' && (Boolean(recorded) || readOnly);
  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface={block?.type === 'choice' || block?.type === 'interview' ? 'note' : 'plain'}
      skipLabel={exit.skipLabel}
      onSkipPress={leave}
      onPreviousPress={flow.previous}
      onNextPress={flow.ready || choiceReady ? flow.next : undefined}
    >
      {content.isPending ? (
        <View className="flex-1 justify-center gap-[12px] px-[50px]">
          <Skeleton className="h-[45px] w-full" />
          <Skeleton className="h-[45px] w-full" />
        </View>
      ) : content.isError ? (
        <View className="flex-1 items-center justify-center gap-[12px]">
          <Text variant="body-m">이야기를 불러오지 못했어요.</Text>
          <Button
            label="다시 시도"
            onPress={() => {
              void content.refetch();
            }}
          />
        </View>
      ) : !block ? (
        <View className="flex-1 items-center justify-center gap-[12px]">
          <Text variant="body-m">아직 준비된 장면이 없어요.</Text>
          <Button
            label="다시 불러오기"
            onPress={() => {
              void content.refetch();
            }}
          />
        </View>
      ) : (
        <InfernoBlockPlayer
          key={`${block.id}:${flow.line}`}
          block={block}
          line={flow.line}
          recorded={recorded}
          readOnly={readOnly}
          pending={selection.isPending}
          pendingId={selection.isPending ? selection.variables : undefined}
          onDone={flow.markReady}
          onNext={flow.next}
          onSelect={select}
        />
      )}
      {selection.isError ? (
        <Text variant="body-s" className="text-center text-state-error">
          선택을 저장하지 못했어요. 카드를 눌러 다시 시도해주세요.
        </Text>
      ) : null}
      <InfernoNoteModal
        visible={done}
        minWidthClass="min-w-[344px]"
        title="NOTICE"
        message="대화가 종료되었습니다"
        actionLabel={order === 10 ? '최종 리포트 보기' : '에피소드 끝내기'}
        onActionPress={finish}
        onClose={() => setDone(false)}
      />
    </InfernoEpisodeFrame>
  );
}
