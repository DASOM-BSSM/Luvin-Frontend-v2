import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';

/** 도착 안내 문구(사용자 지정). 보낸 사람은 펼친 쪽지에서 밝힌다. */
const ARRIVAL_MESSAGE = '비밀 쪽지가 도착했어요!';

interface PartnerLetterArrivalProps {
  onOpenPress: () => void;
}

/**
 * [DRAFT] 쪽지가 도착했다는 안내. Figma 시안이 없어 사용자가 설명한 흐름(도착 안내 → 펼치기)대로
 * 기존 쪽지 모달(InfernoNoteModal)의 글자·버튼 모양을 그대로 빌려 짰다. 시안이 나오면 다시 맞출 것.
 *
 * 펼친 쪽지(PartnerLetterPaper)와 같은 "SECRET LOVE" 제목을 위에 둔다(사용자 지정).
 *
 * NOTE: 제목은 Tailwind 클래스가 아니라 style 로 폰트를 넣는다. `font-ok-mallang-b` 는
 * 실기기에서 폰트가 깨진다(src/constants/typography.ts 주석 참고).
 */
export default function PartnerLetterArrival({ onOpenPress }: PartnerLetterArrivalProps) {
  return (
    <View className="flex-col items-center gap-[20px]">
      <View className="w-full flex-col items-center gap-[4px]">
        <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
          SECRET LOVE
        </Text>
        <Text variant="body-m" className="text-center text-default-black">
          {ARRIVAL_MESSAGE}
        </Text>
      </View>
      <Button label="열어보기" variant="notice" onPress={onOpenPress} />
    </View>
  );
}
