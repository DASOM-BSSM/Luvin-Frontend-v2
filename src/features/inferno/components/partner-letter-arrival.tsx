import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

interface PartnerLetterArrivalProps {
  partnerName: string;
  onOpenPress: () => void;
}

/**
 * [DRAFT] 쪽지가 도착했다는 안내. Figma 시안이 없어 사용자가 설명한 흐름(도착 안내 → 펼치기)대로
 * 기존 쪽지 모달(InfernoNoteModal)의 글자·버튼 모양을 그대로 빌려 짰다. 시안이 나오면 다시 맞출 것.
 */
export default function PartnerLetterArrival({ partnerName, onOpenPress }: PartnerLetterArrivalProps) {
  return (
    <View className="flex-col items-center gap-[20px]">
      <Text variant="body-m" className="text-center text-default-black">
        {`${partnerName}에게서\n쪽지가 도착했어요`}
      </Text>
      <Button label="열어보기" variant="notice" onPress={onOpenPress} />
    </View>
  );
}
