import Svg, { Path } from 'react-native-svg';

import theme from '@/src/constants/theme';

interface HomeNavIconProps {
  /**
   * SVG fill 색.
   *
   * className 이 아니라 값으로 받는 이유: NativeWind 의 `nativeStyleToProp` 은 네이티브 전용이라
   * 웹에서는 fill 이 비어서 아이콘이 투명하게 그려진다. 양 플랫폼 동일 동작을 위해 값으로 넘긴다.
   */
  color?: string;
  size?: number;
}

export default function HomeNavIcon({ color = theme.brown[300], size = 24 }: HomeNavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
        fill={color}
      />
    </Svg>
  );
}
