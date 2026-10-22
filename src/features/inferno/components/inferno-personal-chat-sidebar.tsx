/** [DRAFT] Feedback shortcut and character layout. */
import { Pressable, View } from 'react-native';

import FolderIcon from '@/src/assets/icons/FolderIcon';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import theme from '@/src/constants/theme';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { InfernoParticipant } from '@/src/features/inferno/types';

interface PersonalChatShortcutProps {
  label: string;
  iconColor: string;

  onPress?: () => void;
}

function PersonalChatShortcut({
  label,
  iconColor,

  onPress,
}: PersonalChatShortcutProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      className="flex-col items-center"
      onPress={onPress}
    >
      <FolderIcon color={iconColor} />
      <Text variant="body-m" className="text-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}

interface InfernoPersonalChatSidebarProps {
  mine?: InfernoParticipant;
  partner?: InfernoParticipant;
  onFeedbackPress?: () => void;
  isFeedbackUsed?: boolean;
}

export default function InfernoPersonalChatSidebar({
  mine,
  partner,
  onFeedbackPress,
  isFeedbackUsed = false,
}: InfernoPersonalChatSidebarProps) {
  return (
    <View className="w-[300px] flex-col">
      <View className="h-[25px]" />

      <View className="w-[205px] flex-col items-center gap-[12px]">
        <PersonalChatShortcut
          label="나의 빵에게"
          iconColor={isFeedbackUsed ? theme.pink[300] : theme.pink[400]}
          onPress={onFeedbackPress}
        />
      </View>

      <View className="flex-1" />

      <View className="flex-row items-end gap-[11px] pl-[67px]">
        {mine ? (
          <BreadCharacter
            type={mine.type}
            state="personDough"
            className={findDoughFigure(mine.type).chatSizeClass}
            accessibilityLabel={mine.name}
          />
        ) : null}
        {partner ? (
          <BreadCharacter
            type={partner.type}
            state="personDough"
            className={findDoughFigure(partner.type).chatSizeClass}
            accessibilityLabel={partner.name}
          />
        ) : null}
      </View>
    </View>
  );
}
