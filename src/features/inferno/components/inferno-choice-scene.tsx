/** [DRAFT] Equal-size choices; solo is always the final card. */
import { Pressable, ScrollView, View } from 'react-native';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import type { InfernoParticipant } from '@/src/features/inferno/types';
import type { ChoiceBlock, ChoiceRecord } from '@/src/features/inferno/types/scene-block';
export default function InfernoChoiceScene({
  choice,
  participants,
  recorded,
  readOnly,
  pending,
  pendingId,
  onSelect,
}: {
  choice: ChoiceBlock;
  participants: InfernoParticipant[];
  recorded?: ChoiceRecord;
  readOnly: boolean;
  pending: boolean;
  pendingId?: string | null;
  onSelect: (id: string | null) => void;
}) {
  const options = [
    ...choice.candidates,
    { breadId: null, memory: '누구를 고르지 않아도 괜찮아요' },
  ];
  return (
    <View className="flex-1 items-center justify-center gap-[12px] px-[28px]">
      <Text
        variant={choice.pointId === 3 ? 'heading-h3' : 'heading-h4'}
        className="text-center text-pink-500"
      >
        {choice.question}
      </Text>
      {choice.pointId === 3 ? (
        <Text variant="body-s" className="text-text-muted">
          내 마음의 속도로, 솔직하게 전해요
        </Text>
      ) : null}
      <ScrollView horizontal contentContainerClassName="items-center gap-[12px]">
        {options.map((option) => {
          const person = participants.find((item) => item.id === option.breadId);
          const selected = recorded && recorded.breadId === option.breadId;
          return (
            <Pressable
              key={option.breadId ?? 'solo'}
              accessibilityRole="button"
              accessibilityState={{
                selected: Boolean(selected),
                disabled: readOnly || pending || Boolean(recorded),
              }}
              disabled={readOnly || pending || Boolean(recorded)}
              onPress={() => onSelect(option.breadId)}
              className={`h-[170px] w-[150px] items-center justify-center gap-[8px] rounded-[8px] border border-pink-300 px-[12px] ${selected ? 'bg-pink-200' : 'bg-default-white'}`}
            >
              {person ? (
                <BreadCharacter type={person.type} state="personDough" />
              ) : (
                <View className="h-[45px] items-center justify-center">
                  <Text variant="heading-h4" className="text-pink-500">
                    나의 시간
                  </Text>
                </View>
              )}
              <Text variant="body-s" className="text-center text-text-primary">
                {pending && option.breadId === pendingId
                  ? '마음을 전하는 중…'
                  : (person?.name ?? '혼자 있기')}
              </Text>
              <Text variant="body-xs" className="text-center text-text-muted">
                {option.memory}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {readOnly && !recorded ? (
        <Text variant="body-s" className="text-text-muted">
          이 시즌의 선택 기록이 없어요. 다음 화면에서 계속 볼 수 있어요.
        </Text>
      ) : null}
    </View>
  );
}
