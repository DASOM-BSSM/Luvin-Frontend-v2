import Svg, { Path } from 'react-native-svg';

import theme from '@/src/constants/theme';

interface PlusIconProps {
  color?: string;
}

/**
 * 더하기(+) 아이콘. Figma "감정일기 홈"(5950:6585) 헤더 우상단 Vector(6243:4521).
 *
 * 레이어 자리는 14×14 인데 선 굵기(2)만큼 바깥으로 1px 씩 나가서 SVG 는 16×16 이다.
 */
export default function PlusIcon({ color = theme.colors.default.black }: PlusIconProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M8 15V8M8 8V1M8 8H15M8 8H1" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
