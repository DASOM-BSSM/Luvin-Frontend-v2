import type { ReactNode } from 'react';
import { View } from 'react-native';

import InfernoBottomBar from '@/src/features/inferno/components/inferno-bottom-bar';
import InfernoDotBackground from '@/src/features/inferno/components/inferno-dot-background';
import InfernoNoteCard from '@/src/features/inferno/components/inferno-note-card';
import InfernoTopBar from '@/src/features/inferno/components/inferno-top-bar';
import type { InfernoEpisode } from '@/src/features/inferno/types';
import { formatIntroLabel } from '@/src/features/inferno/utils/format';

interface InfernoEpisodeFrameProps {
  episode: InfernoEpisode;
  /** 넘기지 않으면 해당 버튼이 연해지고 눌리지 않는다. */
  onPreviousPress?: () => void;
  onNextPress?: () => void;
  onSkipPress?: () => void;
  children: ReactNode;
}

/**
 * 러빈지옥 본문 화면의 공통 껍데기. Figma `ep0` (6340:8355, 6340:8388).
 *
 * 장면이 바뀌어도 배경·상하 바·쪽지는 그대로라서 한 곳에 모았다.
 * 위아래 바가 51 씩 차지하고 그 사이를 흰 쪽지가 채운다. 쪽지 좌우 여백으로 배경이 비친다.
 */
export default function InfernoEpisodeFrame({
  episode,
  onPreviousPress,
  onNextPress,
  onSkipPress,
  children,
}: InfernoEpisodeFrameProps) {
  return (
    <View className="flex-1 bg-default-white">
      <InfernoDotBackground />
      <InfernoTopBar onPreviousPress={onPreviousPress} onNextPress={onNextPress} />
      <View className="flex-1 px-[46px]">
        <InfernoNoteCard>{children}</InfernoNoteCard>
      </View>
      <InfernoBottomBar
        label={formatIntroLabel(episode.order, episode.title)}
        onSkipPress={onSkipPress}
      />
    </View>
  );
}
