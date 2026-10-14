import { useState } from 'react';
import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import RecBadge from '@/src/components/ui/rec-badge';
import Text from '@/src/components/ui/text';
import EpisodeHistoryRow from '@/src/features/oven/components/episode-history-row';

/** 시즌 카드 아래에 펼쳐지는 회차 한 줄. */
export interface SeasonEpisodeItem {
  /** 예: "Episode 01." */
  label: string;
  /** 회차 제목. */
  body: string;
}

interface SeasonCardProps {
  /** 1부터 센다. "Season 1" 처럼 보여준다. */
  seasonNumber: number;
  /** 아직 진행 중인 시즌이면 true — 카드에 REC 표시를 붙인다(이번주 에피소드 카드와 같은 뜻). */
  isInProgress: boolean;
  /** 지금까지 진행한 회차들. Episode 01 부터 차례대로. */
  episodes: SeasonEpisodeItem[];
}

/**
 * 러빈지옥 에피소드 홈의 시즌 묶음. 누르면 그 시즌의 회차들이 아래로 펼쳐지고, 다시 누르면 접힌다.
 *
 * 시안이 따로 없어서(사용자 결정) 이번주 에피소드 카드(EpisodeThumbnailCard)의 분홍 점선 틀에
 * "Season N" 을 적고, 펼쳐지는 회차는 지난 회차 줄(EpisodeHistoryRow)을 그대로 쓴다.
 * 처음에는 접혀 있다.
 */
export default function SeasonCard({ seasonNumber, isInProgress, episodes }: SeasonCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const title = `Season ${seasonNumber}`;

  function handleSeasonPress() {
    setIsOpen((open) => !open);
  }

  return (
    <View className="w-full flex-col gap-[12px]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title} ${isOpen ? '접기' : '펼치기'}`}
        accessibilityState={{ expanded: isOpen }}
        onPress={handleSeasonPress}
        className="w-full flex-col overflow-hidden rounded-[12px] border-2 border-dashed border-pink-500 p-[11px]"
      >
        {isInProgress ? <RecBadge /> : <View className="h-[16px]" />}
        <View className="h-[12px]" />
        <View className="w-full flex-row items-center justify-between pl-[12px]">
          <Text variant="heading-h3" className="text-text-primary">
            {title}
          </Text>
          {/* 펼쳐져 있으면 위(접기), 접혀 있으면 아래(펼치기)를 본다. */}
          <View className={isOpen ? '' : 'rotate-180'}>
            <AngleUpIcon />
          </View>
        </View>
        <View className="h-[12px]" />
      </Pressable>

      {isOpen
        ? episodes.map((episode) => (
            <EpisodeHistoryRow key={episode.label} label={episode.label} body={episode.body} />
          ))
        : null}
    </View>
  );
}
