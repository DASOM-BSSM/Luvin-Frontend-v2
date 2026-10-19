import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';
import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import useAiSeasonList from '@/src/features/inferno/hooks/use-ai-season-list';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import useInfernoProgress from '@/src/features/inferno/hooks/use-inferno-progress';
import { findNextInfernoEpisode } from '@/src/features/inferno/utils/progress';
import SeasonCard from '@/src/features/oven/components/season-card';
import { buildSeasonHistories, LAST_EPISODE_ORDER, toSeasonEpisodes } from '@/src/features/oven/utils/season-history';

/** 지난 시즌 회차를 눌렀을 때의 안내. 시안이 없어 임시 문구다. */
const PAST_SEASON_NOTICE = {
  message: '지난 시즌의 회차는 아직 다시 볼 수 없어요',
  actionLabel: '확인',
};

/**
 * 오븐 화면의 시즌 카드들. 시즌마다 카드를 따로 두고, 최신 시즌이 맨 위·지난 시즌이 그 아래다
 * (사용자 결정). 시즌 목록은 `GET /api/ai/seasons`, 지금 시즌은 `GET /api/ai/seasons/me` 가 준다.
 *
 * 지난 시즌의 회차는 목록만 보여주고, 누르면 아직 다시 볼 수 없다고 안내한다(사용자 결정). 회차 대화
 * API 가 시즌을 고르지 못하고 늘 지금 시즌 것을 줘서, 그대로 들어가면 지난 시즌 자리에 지금 시즌
 * 대화가 보인다. 백엔드가 시즌을 고르는 API 를 주면 그때 다시 보기를 연결한다.
 *
 * 시즌 목록을 못 받았더라도 지금 시즌을 알면 그 시즌 하나는 보여준다 — 목록 API 가 실패해도 예전처럼
 * 지금 시즌은 볼 수 있게 한다.
 */
export default function SeasonHistoryList() {
  const listQuery = useAiSeasonList();
  const statusQuery = useAiSeasonStatus();
  // ep1 인사말에 실제 반죽을 넣으려고 필요하다(season-history.ts 의 resolveEpisodeTitle) — 서버 설문
  // 결과가 원천이라 아직 없으면(설문 전) 그 회차 제목은 그냥 못 만든다(가짜 대체값 금지).
  const { profile: myProfile } = useBreadProfile();
  const [isPastSeasonNoticeVisible, setIsPastSeasonNoticeVisible] = useState(false);

  const status = statusQuery.data;
  // 지금 시즌은 홈의 "이번주 에피소드" 까지 펼친다(season-history.ts 의 buildSeasonHistories 주석).
  const { completedOrders } = useInfernoProgress();
  const currentLastOrder = findNextInfernoEpisode(completedOrders)?.order ?? LAST_EPISODE_ORDER;
  const seasons = listQuery.data?.length
    ? listQuery.data
    : status
      ? [{ seasonId: status.seasonId, seasonNumber: status.seasonNumber, status: status.status, currentEpisode: status.currentEpisode }]
      : [];
  const histories = myProfile
    ? buildSeasonHistories(seasons, status?.seasonId, currentLastOrder).map((history) => ({
        ...history,
        episodes: toSeasonEpisodes(history.episodeOrders, myProfile),
      }))
    : [];
  const hasEpisodes = histories.some((history) => history.episodes.length > 0);

  // 지금 시즌의 지난 회차 다시 보기. 홈에서 들어갈 때처럼 회차 시작 화면부터 본다. 대화는 서버에 이미
  // 저장돼 있어서 새로 만들지 않고 불러온다(use-ai-episode-messages — 이미 있으면 생성 요청 안 함).
  function handleCurrentSeasonEpisodePress(order: number) {
    router.push(infernoIntroHref(order));
  }

  function handlePastSeasonEpisodePress() {
    setIsPastSeasonNoticeVisible(true);
  }

  function handlePastSeasonNoticeClose() {
    setIsPastSeasonNoticeVisible(false);
  }

  const isLoading = listQuery.isLoading || statusQuery.isLoading;
  const isError = listQuery.isError && statusQuery.isError;

  if (isLoading || isError || !hasEpisodes) {
    return (
      <Text variant="body-s" className="text-text-muted">
        {isLoading
          ? '불러오는 중...'
          : isError
            ? '에피소드 정보를 불러오지 못했어요'
            : '아직 진행 중인 에피소드가 없어요'}
      </Text>
    );
  }

  return (
    <View className="w-full flex-col gap-[12px]">
      {histories.map((history) => (
        <SeasonCard
          key={history.seasonId}
          seasonNumber={history.seasonNumber}
          episodes={history.episodes}
          onEpisodePress={history.isCurrent ? handleCurrentSeasonEpisodePress : handlePastSeasonEpisodePress}
        />
      ))}
      <InfernoNoticeModal
        visible={isPastSeasonNoticeVisible}
        message={PAST_SEASON_NOTICE.message}
        actionLabel={PAST_SEASON_NOTICE.actionLabel}
        onClose={handlePastSeasonNoticeClose}
        onActionPress={handlePastSeasonNoticeClose}
      />
    </View>
  );
}
