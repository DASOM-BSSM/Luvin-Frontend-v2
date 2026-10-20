import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

/** Figma 5482:1935. */
const SUBMIT_ACTION = '피드백 하기';
/** 보내는 동안의 버튼 문구. ep1 투표지의 "투표하는 중..." 과 같은 결이다. */
const SUBMITTING_ACTION = '피드백 하는 중...';

interface InfernoFeedbackSubmitButtonProps {
  onPress: () => void;
  /** 보내는 중인지. 버튼을 잠근다. */
  isSubmitting?: boolean;
  /** 보내기가 실패했을 때 버튼 아래 보여줄 문구. */
  errorMessage?: string;
}

/** "나의 빵에게" 쓰기 단계의 "피드백 하기" 버튼. 실패 문구는 ep1 투표지와 같은 자리에 둔다. */
export default function InfernoFeedbackSubmitButton({
  onPress,
  isSubmitting,
  errorMessage,
}: InfernoFeedbackSubmitButtonProps) {
  return (
    <View className="w-full flex-col items-center gap-[8px]">
      <Button
        label={isSubmitting ? SUBMITTING_ACTION : SUBMIT_ACTION}
        variant="notice"
        disabled={isSubmitting}
        onPress={onPress}
      />
      {errorMessage ? (
        <Text variant="body-xs" className="text-center text-state-error">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
