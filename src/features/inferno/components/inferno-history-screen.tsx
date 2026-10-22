/** [DRAFT] Legacy server seasons stay read-only and never receive draft mock dialogue. */
import { useQueryClient } from '@tanstack/react-query';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import useViewedSeason from '@/src/features/inferno/hooks/use-viewed-season';
import { View } from 'react-native';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import Skeleton from '@/src/components/ui/skeleton';
import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import InfernoBlockPlayer from '@/src/features/inferno/components/inferno-block-player';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import InfernoSeasonReportScreen from '@/src/features/inferno/components/inferno-season-report-screen';
import { LEGACY_INFERNO_EPISODES } from '@/src/features/inferno/constants/episodes';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useInfernoBlockFlow from '@/src/features/inferno/hooks/use-inferno-block-flow';
import useInfernoConversation from '@/src/features/inferno/hooks/use-inferno-conversation';
import useInfernoSeasonSummary from '@/src/features/inferno/hooks/use-inferno-season-summary';
import type { SceneBlock } from '@/src/features/inferno/types/scene-block';
import { useState } from 'react';

function useHistoryRetry(order: number) {
  const client = useQueryClient();
  const { pastSeasonId } = useViewedSeason();
  return () => {
    if (!pastSeasonId) return;
    void client.refetchQueries({
      queryKey:
        order === 5
          ? aiSeasonKeys.pastReport(pastSeasonId)
          : aiSeasonKeys.episode(order, pastSeasonId),
    });
  };
}
function HistoryNotice({
  order,
  loading,
  message,
  retry,
}: {
  order: number;
  loading: boolean;
  message: string;
  retry: () => void;
}) {
  const exit = useEpisodeExit(order);
  return (
    <InfernoEpisodeFrame
      episode={
        LEGACY_INFERNO_EPISODES.find((episode) => episode.order === order) ?? { order, title: '' }
      }
      skipLabel={exit.skipLabel}
      onSkipPress={exit.leave}
    >
      <View className="flex-1 items-center justify-center gap-[12px] px-[50px]">
        {loading ? (
          <Skeleton className="h-[45px] w-full" />
        ) : (
          <>
            <Text variant="body-m" className="text-text-primary">
              {message}
            </Text>
            <Button label="다시 불러오기" onPress={retry} />
          </>
        )}
      </View>
    </InfernoEpisodeFrame>
  );
}
function HistoryReport() {
  const summary = useInfernoSeasonSummary(5);
  const retry = useHistoryRetry(5);
  const bread = useBreadProfile();
  if (!summary.summary || !bread.profile)
    return (
      <HistoryNotice
        order={5}
        loading={summary.isLoading || bread.isLoading}
        message={
          summary.isError || bread.isError
            ? '리포트를 불러오지 못했어요.'
            : '아직 저장된 리포트가 없어요.'
        }
        retry={() => {
          retry();
          void bread.refetch();
        }}
      />
    );
  return (
    <InfernoSeasonReportScreen
      summary={summary.summary}
      mine={bread.profile}
      sessionKey="legacy-read-only"
      solo={false}
      readOnly
      displayedEpisode={LEGACY_INFERNO_EPISODES.find((episode) => episode.order === 5)}
    />
  );
}
function HistoryConversation({ order }: { order: number }) {
  const query = useInfernoConversation(order);
  const retry = useHistoryRetry(order);
  const exit = useEpisodeExit(order);
  const [done, setDone] = useState(false);
  const conversation = query.conversation;
  const blocks: SceneBlock[] = conversation
    ? [
        ...conversation.pages.map((page): SceneBlock => ({
          id: page.id,
          type: 'group',
          participants: conversation.participants,
          messages: page.messages,
        })),
        ...(conversation.personalChatPages ?? []).map((page): SceneBlock => ({
          id: page.id,
          type: 'pair',
          participants: conversation.participants,
          messages: page.messages,
        })),
      ]
    : [];
  const flow = useInfernoBlockFlow(0, blocks, () => setDone(true));
  if (!flow.block || !conversation)
    return (
      <HistoryNotice
        order={order}
        loading={query.isLoading}
        message={query.isError ? '대화를 불러오지 못했어요.' : '아직 저장된 대화가 없어요.'}
        retry={retry}
      />
    );
  return (
    <InfernoEpisodeFrame
      episode={
        LEGACY_INFERNO_EPISODES.find((episode) => episode.order === order) ?? { order, title: '' }
      }
      surface="plain"
      skipLabel={exit.skipLabel}
      onSkipPress={exit.leave}
      onPreviousPress={flow.previous}
      onNextPress={flow.ready ? flow.next : undefined}
    >
      <InfernoBlockPlayer
        key={`${flow.block.id}:${flow.line}`}
        block={flow.block}
        line={flow.line}
        readOnly
        pending={false}
        onDone={flow.markReady}
        onNext={flow.next}
        onSelect={() => {}}
      />
      <InfernoNoteModal
        visible={done}
        minWidthClass="min-w-[344px]"
        title="NOTICE"
        message="대화가 종료되었습니다"
        actionLabel="나가기"
        onActionPress={exit.leave}
        onClose={() => setDone(false)}
      />
    </InfernoEpisodeFrame>
  );
}
export default function InfernoHistoryScreen({ order }: { order: number }) {
  return order === 5 ? <HistoryReport /> : <HistoryConversation order={order} />;
}
