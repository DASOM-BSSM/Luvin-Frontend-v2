/**
 * [DRAFT] 매 회차 상황 소개. 회차 번호, 제목(Ok Mallang B `display-section-title`), 이번 화 상황 2~3줄.
 * 누르면 본문이 시작된다.
 */
import { Pressable } from 'react-native';

import Text from '@/src/components/ui/text';
import { formatEpisodeNumber } from '@/src/features/inferno/utils/format';

interface InfernoEpisodeIntroProps {
  order: number;
  title: string;
  situation: string;
  onStart: () => void;
}

export default function InfernoEpisodeIntro({
  order,
  title,
  situation,
  onStart,
}: InfernoEpisodeIntroProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${situation}. 눌러서 시작하기`}
      className="flex-1 items-center justify-center gap-[12px] px-[60px]"
      onPress={onStart}
    >
      <Text variant="body-s" className="text-pink-500">
        {formatEpisodeNumber(order)}
      </Text>
      <Text variant="display-section-title" className="text-center">
        {title}
      </Text>
      <Text variant="body-m" className="text-center text-text-primary">
        {situation}
      </Text>
      <Text variant="body-xs" className="text-text-muted">
        탭해서 시작하기
      </Text>
    </Pressable>
  );
}
