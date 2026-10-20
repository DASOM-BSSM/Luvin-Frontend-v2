import { Image } from 'expo-image';
import { View } from 'react-native';

/**
 * 아바타 시트 한 장(옆모습·뒷모습, 남녀 4종)을 시안과 같은 자리로 잘라 보여준다.
 * Figma `image 52`/`image 51` (7219:3702, 7219:3704) 이 같은 시트를 각자 다르게 잘라 쓰므로
 * 시트를 그대로 두고 자르는 비율만 시안 값으로 옮겼다.
 */
const SHEET = require('@/src/assets/images/avatar_side_sheet.png');

export type AvatarSideWho = 'girl' | 'boy';

/** 시트 안에서의 위치. 값은 시안의 이미지 채우기 비율(%) 그대로. */
const CROPS: Record<AvatarSideWho, { width: `${number}%`; height: `${number}%`; left: `${number}%`; top: `${number}%` }> = {
  // 오른쪽을 보는 여자 옆모습
  girl: { width: '430.43%', height: '127.54%', left: '-229.35%', top: '-21.74%' },
  // 왼쪽을 보는 남자 옆모습
  boy: { width: '404.08%', height: '124.53%', left: '-6.12%', top: '-18.4%' },
};

interface AvatarSideProps {
  who: AvatarSideWho;
  width: number;
  height: number;
}

export default function AvatarSide({ who, width, height }: AvatarSideProps) {
  const frameStyle = { width, height, overflow: 'hidden' as const };
  const imageStyle = { position: 'absolute' as const, ...CROPS[who] };

  return (
    <View style={frameStyle}>
      <Image source={SHEET} style={imageStyle} contentFit="fill" />
    </View>
  );
}
