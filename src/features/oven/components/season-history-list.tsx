import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import InfernoSeasonReset from '@/src/features/inferno/components/inferno-season-reset';
import InfernoUnlockNotice, {
  type UnlockTarget,
} from '@/src/features/inferno/components/inferno-unlock-notice';
import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import useInfernoProgress from '@/src/features/inferno/hooks/use-inferno-progress';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import { SEASON_STAGE_TITLES } from '@/src/features/inferno/constants/season';
import { isPreviousCompleting } from '@/src/features/inferno/utils/completion';
import { episodeAccess } from '@/src/features/inferno/utils/episode-unlock';
import { findNextInfernoEpisode } from '@/src/features/inferno/utils/progress';
import SeasonCard from '@/src/features/oven/components/season-card';
import {
  LAST_EPISODE_ORDER,
  toEpisodeOrders,
  toSeasonEpisodes,
} from '@/src/features/oven/utils/season-history';

/**
 * [DRAFT] 오븐 화면의 시즌 카드. 시즌은 사용자마다 하나라 카드도 하나다(사용자 결정 — 지난 시즌 다시
 * 보기는 뺐다). 펼치면 지금까지 연 회차가 최신 회차부터 나오고, 누르면 그 회차 시작 화면으로 간다.
 * 이미 본 회차는 회차 본문이 `completed` 라 다시 보기 모드로 열린다. 회차마다 무료·열림·잠김을 붙인다.
 * 잠긴 회차를 누르면 들어가기 전에 토큰 안내(InfernoUnlockNotice)를 띄운다(사용자 결정).
 */
export default function SeasonHistoryList() {
  const statusQuery = useAiSeasonStatus();
  const storyQuery = useStoryState();
  const { profile: myProfile } = useBreadProfile();
  const { completedOrders } = useInfernoProgress();
  const [unlockTarget, setUnlockTarget] = useState<UnlockTarget | null>(null);
  const lastOrder = findNextInfernoEpisode(completedOrders)?.order ?? LAST_EPISODE_ORDER;
  const episodes = myProfile
    ? toSeasonEpisodes(toEpisodeOrders(lastOrder), storyQuery.data)
    : [];

  // 10화까지 끝낸 시즌은 "SEASON 01" 대신 배경 제목으로 보여준다(사용자 결정).
  const setting = storyQuery.data?.setting;
  const seasonStageTitle =
    storyQuery.data?.completedOrders.includes(LAST_EPISODE_ORDER) && setting
      ? SEASON_STAGE_TITLES[setting]
      : undefined;

  function handleEpisodePress(order: number) {
    const href = infernoIntroHref(order);
    // 앞 회차를 서버가 아직 정리 중이면 회차 화면이 정리를 기다린 뒤 열기를 묻는다(홈과 같다).
    if (
      storyQuery.data &&
      episodeAccess(order, storyQuery.data) === 'locked' &&
      !isPreviousCompleting(order, storyQuery.data)
    ) {
      setUnlockTarget({ order, href });
      return;
    }
    router.push(href);
  }

  function handleUnlockClose() {
    setUnlockTarget(null);
  }

  if (statusQuery.isLoading || statusQuery.isError || !statusQuery.data || episodes.length === 0) {
    return (
      <Text variant="body-s" className="text-text-muted">
        {statusQuery.isLoading
          ? '불러오는 중...'
          : statusQuery.isError
            ? '에피소드 정보를 불러오지 못했어요'
            : '아직 진행 중인 에피소드가 없어요'}
      </Text>
    );
  }

  return (
    <View className="w-full flex-col gap-[12px]">
      <SeasonCard
        seasonNumber={statusQuery.data.seasonNumber ?? 1}
        stageTitle={seasonStageTitle}
        episodes={episodes}
        onEpisodePress={handleEpisodePress}
        footer={<InfernoSeasonReset />}
      />
      <InfernoUnlockNotice
        target={unlockTarget}
        tokenCost={storyQuery.data?.episodeTokenCost ?? null}
        onClose={handleUnlockClose}
      />
    </View>
  );
}
