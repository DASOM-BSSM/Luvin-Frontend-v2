import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

interface QuestionEmptyCardProps {
  onCreatePress: () => void;
}

/** 그룹에 아직 질문이 없을 때. Figma "감정일기 메인 - 제민"(6263:5614)의 6271:6645. */
export default function QuestionEmptyCard({ onCreatePress }: QuestionEmptyCardProps) {
  return (
    <View className="w-full flex-col items-center justify-center gap-[8px] rounded-[8px] border border-default-gray px-[30px] py-[20px]">
      <Text variant="body-s" className="text-text-primary">
        질문을 생성하여 친구들과 의견을 공유해요
      </Text>
      <Button label="질문 생성하기" variant="filled" onPress={onCreatePress} />
    </View>
  );
}
