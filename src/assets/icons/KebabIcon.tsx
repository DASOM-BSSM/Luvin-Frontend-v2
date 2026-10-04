import Svg, { G, Path } from 'react-native-svg';

import theme from '@/src/constants/theme';

interface KebabIconProps {
  color?: string;
}

/**
 * 세로 점 세 개(더보기) 아이콘. Figma "감정일기 홈"(5950:6585) 그룹 일기 카드의 Vector(5950:6788).
 *
 * 레이어 자리는 1.33×9.33 인데 선 굵기(2)만큼 바깥으로 나가서 SVG 는 3.33×11.33 이다.
 */
export default function KebabIcon({ color = theme.colors.default.black }: KebabIconProps) {
  return (
    <Svg width={3.33333} height={11.3333} viewBox="0 0 3.33333 11.3333" fill="none">
      <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M1 9.66667C1 10.0349 1.29848 10.3333 1.66667 10.3333C2.03486 10.3333 2.33333 10.0349 2.33333 9.66667C2.33333 9.29848 2.03486 9 1.66667 9C1.29848 9 1 9.29848 1 9.66667Z" />
        <Path d="M1 5.66667C1 6.03486 1.29848 6.33333 1.66667 6.33333C2.03486 6.33333 2.33333 6.03486 2.33333 5.66667C2.33333 5.29848 2.03486 5 1.66667 5C1.29848 5 1 5.29848 1 5.66667Z" />
        <Path d="M1 1.66667C1 2.03486 1.29848 2.33333 1.66667 2.33333C2.03486 2.33333 2.33333 2.03486 2.33333 1.66667C2.33333 1.29848 2.03486 1 1.66667 1C1.29848 1 1 1.29848 1 1.66667Z" />
      </G>
    </Svg>
  );
}
