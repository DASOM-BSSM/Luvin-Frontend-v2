import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';

interface InfernoEp5NoticeProps {
  message: string;
  /** 넘기면 문구 아래 "다시 시도"를 띄운다(리포트 생성 실패). */
  onRetry?: () => void;
}

/**
 * ep5 쪽지 가운데 안내 한 줄. AI가 아직 리포트를 안 만들었거나 실패했거나, 내 반죽(서버 설문 결과)이 아직
 * 없을 때 빈 화면 대신 띄운다(§11, ep1~4 와 같은 이유). 문구는 ep5 화면이 정한다.
 */
export default function InfernoEp5Notice({ message, onRetry }: InfernoEp5NoticeProps) {
  return (
    <View className="flex-1 items-center justify-center gap-[12px] px-[30px]">
      <Text variant="body-m" className="text-center text-default-black">
        {message}
      </Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" accessibilityLabel="다시 시도" onPress={onRetry}>
          <Text variant="body-s" className="text-state-error">
            다시 시도
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
