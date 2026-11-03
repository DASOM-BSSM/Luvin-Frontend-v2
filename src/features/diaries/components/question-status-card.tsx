import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

interface QuestionStatusCardProps {
  message: string;
  /** 있으면 문구 아래에 버튼을 둔다(예: 실패했을 때 "다시 만들기"). */
  actionLabel?: string;
  onActionPress?: () => void;
}

/**
 * 그룹 질문을 만드는 중 · 만들지 못했을 때의 카드.
 *
 * [DRAFT] Figma 에 이 두 상태 시안이 없어, 질문 없음 카드(`QuestionEmptyCard`, 6271:6645)와 같은
 * 테두리 · 여백 · 글자 크기로 그렸다.
 */
export default function QuestionStatusCard({
  message,
  actionLabel,
  onActionPress,
}: QuestionStatusCardProps) {
  return (
    <View className="w-full flex-col items-center justify-center gap-[8px] rounded-[8px] border border-default-gray px-[30px] py-[20px]">
      <Text variant="body-s" className="text-text-primary">
        {message}
      </Text>
      {actionLabel ? (
        <Button label={actionLabel} variant="filled" onPress={onActionPress} />
      ) : null}
    </View>
  );
}
