/** [DRAFT] Cast strip highlights the current speaker. One line per landscape page. */
import { ScrollView, View } from 'react-native';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';
export default function InfernoGroupScene({
  id,
  participants,
  message,
  onDone,
}: {
  id: string;
  participants: InfernoParticipant[];
  message: InfernoChatMessage;
  onDone: () => void;
}) {
  return (
    <View className="flex-1">
      <View className="items-center">
        <ScrollView
          horizontal
          contentContainerClassName="flex-row items-center gap-[12px] px-[28px] py-[4px]"
        >
          {participants.map((person) => (
            <View
              key={person.id}
              className={`items-center rounded-[8px] px-[12px] py-[4px] ${person.id === message.participantId ? 'bg-pink-200' : 'opacity-40'}`}
              accessibilityLabel={`${person.name}${person.id === message.participantId ? ', 말하는 중' : ''}`}
            >
              <BreadCharacter type={person.type} state="personDough" />
              <Text variant="body-xs" className="text-text-primary">
                {person.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <Text variant="body-xs" className="text-center text-text-muted">
        모두에게
      </Text>
      <InfernoChatScene
        key={message.id}
        page={{ id, messages: [message] }}
        participants={participants}
        onPageDone={onDone}
      />
    </View>
  );
}
