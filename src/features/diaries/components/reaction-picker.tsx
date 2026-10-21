import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import { REACTION_EMOJIS } from '@/src/features/diaries/utils/feed';

interface ReactionPickerProps {
  /** 이모지를 고르면 그 문자를 돌려준다. */
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

interface EmojiButtonProps {
  emoji: string;
  disabled: boolean;
  onPress: (emoji: string) => void;
}

const EmojiButton = ({ emoji, disabled, onPress }: EmojiButtonProps) => {
  function handlePress() {
    onPress(emoji);
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${emoji} 반응`} disabled={disabled} onPress={handlePress}>
      <Text variant="body-m" className="text-center text-default-black">
        {emoji}
      </Text>
    </Pressable>
  );
};

/** 반응 이모지 고르기. Figma "일기 반응 및 댓글"(5950:6274)의 흰 알약(6085:2590). */
export default function ReactionPicker({ onSelect, disabled = false }: ReactionPickerProps) {
  return (
    <View className="flex-row items-center gap-[8px] overflow-hidden rounded-[12px] bg-default-white/80 px-[10px]">
      {REACTION_EMOJIS.map((emoji) => (
        <EmojiButton key={emoji} emoji={emoji} disabled={disabled} onPress={onSelect} />
      ))}
    </View>
  );
}
