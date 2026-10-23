/** [DRAFT] Interview: the question sits on top; the answering bread and its subtitle sit below. */
import { View } from 'react-native';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import TypewriterText from '@/src/components/ui/typewriter-text';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';
export default function InfernoInterviewScene({
  question,
  message,
  participant,
  onDone,
}: {
  question: string;
  message: InfernoChatMessage;
  participant: InfernoParticipant;
  onDone: () => void;
}) {
  return (
    <View className="flex-1 flex-col items-center justify-between px-[50px] py-[16px]">
      <Text variant="heading-h4" className="text-center text-pink-500">
        {question}
      </Text>
      <View className="w-full flex-col items-center gap-[8px]">
        <BreadCharacter
          type={participant.type}
          state="personDough"
          className="h-[100px] w-[150px]"
          accessibilityLabel={participant.name}
        />
        <View className="w-full flex-col items-center gap-[2px]">
          <Text variant="body-xs" className="text-text-muted">
            {participant.name}
          </Text>
          <TypewriterText
            text={message.text}
            className="text-center text-text-primary"
            onDone={onDone}
          />
        </View>
      </View>
    </View>
  );
}
