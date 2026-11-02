import { Pressable, View } from 'react-native';

import RecBadge from '@/src/components/ui/rec-badge';
import Text from '@/src/components/ui/text';

/** 시즌 제목 위의 부제. 사용자가 준 시안 이미지의 문구 그대로. */
const SEASON_SUBTITLE = '내 분신이 관계 앞에서 하는 선택, 러빈지옥';

interface SeasonHeaderCardProps {
  /** 큰 제목. 진행 중이면 "SEASON 01", 10화까지 끝냈으면 배경 제목("In School"). */
  title: string;
  /** 스크린리더용 이름. 넘기지 않으면 제목. */
  accessibilityLabel?: string;
  accessibilityExpanded?: boolean;
  onPress: () => void;
}

/**
 * 러빈지옥 시즌 카드의 머리(사용자 시안 이미지). 이번주 에피소드 카드와 같은 분홍 점선 틀·REC·여백에
 * 작은 부제와 큰 제목을 둔다. 오븐(SeasonCard, 누르면 회차 펼치기)과 홈(10화를 다 끝낸 뒤 "나의 에피소드",
 * 누르면 오븐으로)이 같이 쓴다.
 */
export default function SeasonHeaderCard({
  title,
  accessibilityLabel,
  accessibilityExpanded,
  onPress,
}: SeasonHeaderCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={accessibilityExpanded === undefined ? undefined : { expanded: accessibilityExpanded }}
      onPress={onPress}
      className="h-[144px] w-full overflow-hidden rounded-[12px] border-2 border-dashed border-pink-500 p-[11px]"
    >
      <RecBadge />
      <View className="h-[40px]" />
      <View className="flex-col items-start gap-[2px] pl-[12px]">
        <Text variant="body-s" className="text-text-primary">
          {SEASON_SUBTITLE}
        </Text>
        <Text variant="heading-h3" className="text-text-primary">
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
