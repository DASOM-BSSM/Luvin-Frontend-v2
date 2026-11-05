/** [DRAFT] 화자 없는 내레이션(`kind: 'narration'`). 말풍선 없이 가운데 자막으로 쓴다. */
import { View } from 'react-native';

import SpeedTypewriterText from '@/src/features/dialogue-speed/components/speed-typewriter-text';

export default function InfernoNarrationLine({ text, onDone }: { text: string; onDone: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-[50px]">
      <SpeedTypewriterText
        text={text}
        variant="body-m"
        className="text-center text-text-muted"
        onDone={onDone}
      />
    </View>
  );
}
