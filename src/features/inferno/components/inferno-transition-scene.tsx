/** [DRAFT] Existing note surface and typography. */
import { Pressable } from 'react-native';
import Text from '@/src/components/ui/text';
export default function InfernoTransitionScene({
  text,
  onNext,
}: {
  text: string;
  onNext: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text}, 계속하기`}
      onPress={onNext}
      className="flex-1 items-center justify-center"
    >
      <Text variant="heading-h3" className="text-center text-text-primary">
        {text}
      </Text>
      <Text variant="body-s" className="text-text-muted">
        탭해서 계속하기
      </Text>
    </Pressable>
  );
}
