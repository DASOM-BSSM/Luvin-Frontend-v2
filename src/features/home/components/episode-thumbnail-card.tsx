import { View } from 'react-native';

import RecBadge from '@/src/components/ui/rec-badge';
import Text from '@/src/components/ui/text';
import type { WeeklyEpisode } from '@/src/features/home/types';
import { formatEpisodeLabel } from '@/src/features/home/utils/format-episode';

interface EpisodeThumbnailCardProps {
  episode: WeeklyEpisode;
}

/** 이번주 에피소드 썸네일. */
export default function EpisodeThumbnailCard({ episode }: EpisodeThumbnailCardProps) {
  return (
    <View className="h-[144px] w-full overflow-hidden rounded-[12px] border-2 border-dashed border-pink-500 p-[11px]">
      <RecBadge />
      <View className="h-[40px]" />
      <View className="flex-col items-start gap-[2px] pl-[12px]">
        <Text variant="body-s" className="text-text-primary">
          {formatEpisodeLabel(episode.order)}
        </Text>
        <Text variant="heading-h3" className="text-text-primary">
          {episode.title}
        </Text>
      </View>
    </View>
  );
}
