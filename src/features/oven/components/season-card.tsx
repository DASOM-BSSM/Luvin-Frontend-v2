import { useState } from 'react';
import { View } from 'react-native';

import EpisodeHistoryRow from '@/src/features/oven/components/episode-history-row';
import SeasonHeaderCard from '@/src/features/oven/components/season-header-card';

/** 시즌 카드 아래에 펼쳐지는 회차 한 줄. */
export interface SeasonEpisodeItem {
  /** 회차 번호. 누르면 이 회차로 들어간다. */
  order: number;
  /** 예: "Episode 01." */
  label: string;
  /** 회차 제목. */
  body: string;
  /** [DRAFT] 회차 열기 상태 표시(utils/season-history 의 accessBadge). */
  badge?: string;
}

interface SeasonCardProps {
  /** 1부터 센다. "SEASON 01" 처럼 두 자리로 보여준다. */
  seasonNumber: number;
  /** 10화까지 끝낸 시즌의 배경 제목(예: "In School"). 있으면 "SEASON 01" 대신 쓴다(사용자 결정). */
  stageTitle?: string;
  /** 펼쳤을 때 보여줄 회차들. 부르는 쪽이 정한 순서 그대로 쌓는다. */
  episodes: SeasonEpisodeItem[];
  /** 펼친 회차 줄을 눌렀을 때. 그 회차로 들어간다. */
  onEpisodePress: (order: number) => void;
}

interface SeasonEpisodeRowProps {
  episode: SeasonEpisodeItem;
  onPress: (order: number) => void;
}

/** 펼친 회차 한 줄. 회차 번호를 들고 있다가 눌리면 넘긴다. */
const SeasonEpisodeRow = ({ episode, onPress }: SeasonEpisodeRowProps) => {
  function handleRowPress() {
    onPress(episode.order);
  }

  return (
    <EpisodeHistoryRow
      label={episode.label}
      body={episode.body}
      badge={episode.badge}
      onPress={handleRowPress}
    />
  );
};

function formatSeasonTitle(seasonNumber: number): string {
  return `SEASON ${String(seasonNumber).padStart(2, '0')}`;
}

/**
 * 러빈지옥 에피소드 홈의 시즌 묶음. 누르면 그 시즌의 회차들이 아래로 펼쳐지고, 다시 누르면 접힌다.
 *
 * 생김새는 사용자가 준 시안 이미지를 따른다 — 이번주 에피소드 카드(EpisodeThumbnailCard)와 같은
 * 분홍 점선 틀·REC·여백에, 작은 부제와 큰 "SEASON 01" 을 둔다. 펼쳐지는 회차는 지난 회차 줄
 * (EpisodeHistoryRow)을 그대로 쓴다. 처음에는 접혀 있다.
 *
 * REC 는 홈 카드와 똑같이 늘 붙인다(사용자 지적 — 홈 카드 디자인을 그대로 쓰고 문구만 바꾼다).
 *
 * 펼친 회차 줄을 누르면 그 회차로 다시 들어간다. 이미 만든 대화는 서버에 저장돼 있어서
 * 새로 생성하지 않고 그대로 불러온다.
 */
export default function SeasonCard({
  seasonNumber,
  stageTitle,
  episodes,
  onEpisodePress,
}: SeasonCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const title = stageTitle ?? formatSeasonTitle(seasonNumber);

  function handleSeasonPress() {
    setIsOpen((open) => !open);
  }

  return (
    <View className="w-full flex-col gap-[12px]">
      <SeasonHeaderCard
        title={title}
        accessibilityLabel={`${title} ${isOpen ? '접기' : '펼치기'}`}
        accessibilityExpanded={isOpen}
        onPress={handleSeasonPress}
      />

      {isOpen
        ? episodes.map((episode) => (
            <SeasonEpisodeRow key={episode.order} episode={episode} onPress={onEpisodePress} />
          ))
        : null}
    </View>
  );
}
