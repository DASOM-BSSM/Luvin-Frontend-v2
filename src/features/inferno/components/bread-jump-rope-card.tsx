import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import BreadJumpRopeStage from '@/src/features/inferno/components/bread-jump-rope-stage';
import useJumpRopeClock from '@/src/features/inferno/hooks/use-jump-rope-clock';
import { getExitOpacity } from '@/src/features/inferno/utils/jump-rope-timing';

interface BreadJumpRopeCardProps {
  active: boolean;
  onExitComplete: () => void;
}

/** 부모를 가득 채우는 줄넘기 장면. 퇴장 때 통째로 흐려진다. */
const fillStyle = { flex: 1 };

export default function BreadJumpRopeCard({ active, onExitComplete }: BreadJumpRopeCardProps) {
  const { elapsed, exitAt } = useJumpRopeClock(active, onExitComplete);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: getExitOpacity(elapsed.value, exitAt.value),
  }));

  // 페이드되는 Animated.View 에는 className 을 달지 않는다(움직이는 뷰 규칙과 같은 이유).
  return (
    <Animated.View style={[fillStyle, cardStyle]}>
      <BreadJumpRopeStage elapsed={elapsed} exitAt={exitAt} />
    </Animated.View>
  );
}
