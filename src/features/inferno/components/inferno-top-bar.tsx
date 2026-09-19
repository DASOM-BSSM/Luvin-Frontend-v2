import { View } from 'react-native';

import InfernoTitle from '@/src/assets/images/InfernoTitle';
import Text from '@/src/components/ui/text';

/** 상단 바의 작은 워드마크 폭. Figma 6340:8365 의 183x35 에서 가져왔다. */
const TITLE_WIDTH = 183;

/**
 * 갈 곳이 없을 때 글자를 흐리게 만드는 정도.
 *
 * NOTE: 시안에 비활성 색이 따로 없어서 투명도로 처리했다. 전용 색이 나오면 토큰으로 바꿀 것.
 */
const DISABLED_CLASS = 'opacity-40';

interface InfernoTopBarProps {
  /** 넘기지 않으면 갈 곳이 없다는 뜻이라 버튼이 흐려지고 눌리지 않는다. */
  onPreviousPress?: () => void;
  onNextPress?: () => void;
}

/**
 * 러빈지옥 본문 상단 바. Figma `Frame 79` (6340:8363).
 *
 * 왼쪽에 워드마크, 오른쪽에 이전/다음 화면 이동.
 */
export default function InfernoTopBar({ onPreviousPress, onNextPress }: InfernoTopBarProps) {
  return (
    <View className="h-[51px] w-full flex-row items-center justify-between overflow-hidden bg-yellow-200 px-[28px]">
      <InfernoTitle width={TITLE_WIDTH} />
      <View className="flex-row items-center gap-[28px]">
        <Text
          variant="body-m"
          className={`text-text-muted ${onPreviousPress ? '' : DISABLED_CLASS}`}
          onPress={onPreviousPress}
        >
          {'< 이전화면'}
        </Text>
        <Text
          variant="body-m"
          className={`text-text-muted ${onNextPress ? '' : DISABLED_CLASS}`}
          onPress={onNextPress}
        >
          {'다음화면 >'}
        </Text>
      </View>
    </View>
  );
}
