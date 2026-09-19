import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';

const InteropImage = cssInterop(Image, { className: 'style' });

/**
 * 러빈지옥 화면 배경의 분홍 물방울 무늬. Figma `ep0` 의 image 33~36 (6340:8356~8359).
 *
 * 원본은 1152x2048 세로 그림인데 가로 화면을 덮어야 해서 시안도 같은 그림을 가로로 이어 붙인다.
 * 폭 253 은 시안이 쓰는 배율(253/1152)을 그대로 따른 값이다. 이 배율을 바꾸면 점 크기가 달라진다.
 *
 * NOTE: absolute 를 쓴다(§16 예외). 배경은 내용 뒤에 깔려야 하는데 flex 로는 겹칠 수 없다.
 * 예외를 이 컴포넌트 안에 가둬 둔다.
 */

/** 타일 한 장의 폭. 시안 배율(253/1152)에서 나온 값. */
const TILE_WIDTH = 253;

/** 가장 넓은 가로 화면(약 1000dp)도 덮도록 넉넉히 깐다. */
const TILE_COUNT = 5;

export default function InfernoDotBackground() {
  return (
    <View className="absolute inset-0 flex-row overflow-hidden">
      {Array.from({ length: TILE_COUNT }, (_, index) => (
        <InteropImage
          key={index}
          className="h-full w-[253px]"
          source={require('@/src/assets/images/inferno-dot-pattern.png')}
          contentFit="cover"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ))}
    </View>
  );
}

export { TILE_WIDTH };
