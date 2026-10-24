import { router } from 'expo-router';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import useInfernoProgress from '@/src/features/inferno/hooks/use-inferno-progress';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
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
 */
export default function SeasonHistoryList() {
  const statusQuery = useAiSeasonStatus();
  const storyQuery = useStoryState();
  const { profile: myProfile } = useBreadProfile();
  const { completedOrders } = useInfernoProgress();
  const lastOrder = findNextInfernoEpisode(completedOrders)?.order ?? LAST_EPISODE_ORDER;
  const episodes = myProfile
    ? toSeasonEpisodes(toEpisodeOrders(lastOrder), myProfile, storyQuery.data)
    : [];

  function handleEpisodePress(order: number) {
    router.push(infernoIntroHref(order));
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
        episodes={episodes}
        onEpisodePress={handleEpisodePress}
      />
    </View>
  );
}
