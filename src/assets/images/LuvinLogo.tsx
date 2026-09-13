import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

// expo-image 는 NativeWind 기본 매핑 대상이 아니라서 className -> style 을 직접 연결한다.
const InteropImage = cssInterop(Image, { className: 'style' });

interface LuvinLogoProps {
  className?: string;
}

/**
 * Luvin 워드마크.
 *
 * Figma: `메인-우린` 의 `image 29` (표시 크기 77x32).
 */
export default function LuvinLogo({ className = 'h-[32px] w-[77px]' }: LuvinLogoProps) {
  return (
    <InteropImage
      className={className}
      source={require('@/src/assets/images/logo.png')}
      contentFit="contain"
      accessibilityLabel="Luvin"
    />
  );
}
