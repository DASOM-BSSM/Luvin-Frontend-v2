/** [DRAFT] One bread faces the camera; subtitle uses existing typewriter. */
import { View } from 'react-native';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import TypewriterText from '@/src/components/ui/typewriter-text';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';
export default function InfernoInterviewScene({
  message,
  participant,
  onDone,
}: {
  message: InfernoChatMessage;
  participant: InfernoParticipant;
  onDone: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-[12px] px-[50px]">
      <Text variant="body-s" className="text-pink-500">
        INTERVIEW ROOM
      </Text>
      <BreadCharacter type={participant.type} state="personDough" className="h-[100px] w-[150px]" />
      <Text variant="body-s" className="text-text-muted">
        {participant.name}
      </Text>
      <TypewriterText text={message.text} onDone={onDone} />
    </View>
  );
}
