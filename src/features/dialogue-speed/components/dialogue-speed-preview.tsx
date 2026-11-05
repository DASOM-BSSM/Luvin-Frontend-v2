import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import SpeedTypewriterText from '@/src/features/dialogue-speed/components/speed-typewriter-text';
import InfernoChatBubble from '@/src/features/inferno/components/inferno-chat-bubble';

const SAMPLE_TEXT = '안녕! 오늘 하루는 어땠어? 나는 네가 정말 보고 싶었어.';

interface DialogueSpeedPreviewProps {
  /** 값이 바뀔 때마다 예시를 처음부터 다시 친다. 속도를 조절하는 동안은 쓰던 글이 그대로 이어서 빨라지고 느려진다. */
  replayKey: number;
  onReplayPress: () => void;
}

/**
 * 속도 예시. 실제 러빈지옥 대화와 같은 말풍선·같은 타자 컴포넌트로 쳐서 체감을 그대로 보여 준다.
 *
 * 글이 길어져도 아래 버튼이 밀리지 않도록 말풍선 칸의 높이를 미리 잡아 둔다.
 */
export default function DialogueSpeedPreview({
  replayKey,
  onReplayPress,
}: DialogueSpeedPreviewProps) {
  return (
    <View className="w-full flex-col items-start gap-[8px]">
      <Text variant="body-xs" className="text-text-muted">
        이렇게 나와요
      </Text>
      <View className="min-h-[84px] w-full flex-row items-start">
        <InfernoChatBubble side="left" isMine={false}>
          <SpeedTypewriterText
            key={replayKey}
            text={SAMPLE_TEXT}
            variant="body-m"
            className="text-text-primary"
          />
        </InfernoChatBubble>
      </View>
      <Button label="다시 보기" variant="outline" onPress={onReplayPress} />
    </View>
  );
}
