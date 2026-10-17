import Svg, { Path } from 'react-native-svg';

import theme from '@/src/constants/theme';

interface EmotionAddIconProps {
  color?: string;
}

/** 반응 남기기(웃는 얼굴 + 더하기) 아이콘. Figma "감정일기 홈"(5950:6585)의 `emotion-icon`(5950:6793). */
export default function EmotionAddIcon({ color = theme.colors.default.black }: EmotionAddIconProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9.22848 11.2285C8.27387 12.1831 6.72613 12.1831 5.77152 11.2285M5.66667 8.27778H5.67278M9.33333 8.27778H9.33944M13 9.5C13 12.5376 10.5376 15 7.5 15C4.46243 15 2 12.5376 2 9.5C2 6.46243 4.46243 4 7.5 4C10.5376 4 13 6.46243 13 9.5Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M13 4.5H16M14.5 3L14.5 6" stroke={color} strokeLinecap="round" />
    </Svg>
  );
}
