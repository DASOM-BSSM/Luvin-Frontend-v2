import { View } from 'react-native';

import Text from '@/src/components/ui/text';

interface HelpBubbleProps {
  text: string;
  /** Figma bubble width, used as a minimum so the bubble can still widen when text is scaled up. */
  minWidthClass?: string;
}

/**
 * 게임 설명 프레임 위 다솜이 말풍선. 너비는 글자에 맞추고, 부모 열의 너비를 넘지 않는다 —
 * 시스템 글자 크기가 커져도(갤럭시 기본 1.15배 등) 프레임 밖으로 잘리지 않고 줄바꿈된다.
 */
export default function HelpBubble({ text, minWidthClass = '' }: HelpBubbleProps) {
  return (
    <View className={`max-w-full shrink rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] bg-yellow-200 px-[20px] py-[10px] ${minWidthClass}`}>
      <Text variant="body-s" className="text-text-primary">
        {text}
      </Text>
    </View>
  );
}
