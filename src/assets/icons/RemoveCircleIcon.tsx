import Svg, { Path, Rect } from 'react-native-svg';

import theme from '@/src/constants/theme';

/** 동그란 x(내보내기) 아이콘. Figma "그룹 설정하기 - 리원"(6606:3984)의 `dashicons:no-alt`(6606:4159). */
export default function RemoveCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Rect width={20} height={20} rx={10} fill={theme.colors.removeBadge.bg} />
      <Path
        d="M14 7.63939L11.1394 10.5L14 13.3606L12.8606 14.5L10 11.6475L7.14747 14.5L6 13.3525L8.85253 10.5L6 7.64747L7.14747 6.5L10 9.35253L12.8606 6.5L14 7.63939Z"
        fill={theme.colors.removeBadge.icon}
      />
    </Svg>
  );
}
