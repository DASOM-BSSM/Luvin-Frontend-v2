import { Pressable, View } from 'react-native';

import FolderIcon from '@/src/assets/icons/FolderIcon';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { InfernoParticipant } from '@/src/features/inferno/types';

interface PersonalChatShortcutProps {
  label: string;
  /** 넘기지 않으면 갈 곳이 없다는 뜻이라 눌러도 아무 일도 하지 않는다. */
  onPress?: () => void;
}

/**
 * 바로가기 하나. Figma `Frame 73`/`Frame 71` (5379:3575, 5379:3579).
 *
 * 폴더(60)와 글자(26)가 간격 없이 맞붙는다 — 시안의 묶음 높이가 86 이라 사이가 0 이다.
 */
function PersonalChatShortcut({ label, onPress }: PersonalChatShortcutProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      className="flex-col items-center"
      onPress={onPress}
    >
      <FolderIcon />
      <Text variant="body-m" className="text-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}

interface InfernoPersonalChatSidebarProps {
  /** 내 분신. 반죽 둘 중 왼쪽에 선다. */
  mine?: InfernoParticipant;
  /** 1:1 상대. 반죽 둘 중 오른쪽에 선다. */
  partner?: InfernoParticipant;
  /** "나의 빵에게" 를 눌렀을 때. */
  onFeedbackPress?: () => void;
}

/**
 * 1:1 대화 화면 왼쪽. Figma `ep2-대화` (5379:3574, 5379:3583 왼쪽 묶음).
 *
 * 시안 프레임(874x402 = 기준 기기 가로 좌표)의 자리를 그대로 옮겼다. 상하 바 51 씩을 뺀
 * 본문(874x300) 안에서:
 *
 * - 바로가기 묶음은 본문 위에서 25 에서 시작한다.
 * - 바로가기 둘은 x=102.5 를 축으로 가운데 정렬된다 — 폭 205 짜리 칸의 한가운데다.
 * - 반죽 둘은 바닥을 하단 바에 붙이고 서고, 소금빵이 x=67, 도넛이 x=185 에서 시작한다
 *   (소금빵 폭 107 + 사이 11 = 185).
 *
 * 남는 세로 공간은 바로가기와 반죽 사이에 몰아 둔다. 화면이 더 낮은 기기에서는 그 사이가
 * 먼저 줄어들고 위아래 붙은 것들은 시안 자리를 지킨다.
 *
 * "다시 굽기" 는 아직 갈 곳이 없어서 눌러도 아무 동작을 하지 않는다(BottomNav 의 감정일기
 * 탭과 같은 이유 — 목적지가 정해지면 그때 연결한다).
 */
export default function InfernoPersonalChatSidebar({
  mine,
  partner,
  onFeedbackPress,
}: InfernoPersonalChatSidebarProps) {
  return (
    <View className="w-[384px] flex-col">
      <View className="h-[25px]" />

      <View className="w-[205px] flex-col items-center gap-[12px]">
        <PersonalChatShortcut label="다시 굽기" />
        <PersonalChatShortcut label="나의 빵에게" onPress={onFeedbackPress} />
      </View>

      <View className="flex-1" />

      <View className="flex-row items-end gap-[11px] pl-[67px]">
        {mine ? (
          <BreadCharacter
            type={mine.type}
            state="dough"
            className={findDoughFigure(mine.type).chatSizeClass}
            accessibilityLabel={mine.name}
          />
        ) : null}
        {partner ? (
          <BreadCharacter
            type={partner.type}
            state="dough"
            className={findDoughFigure(partner.type).chatSizeClass}
            accessibilityLabel={partner.name}
          />
        ) : null}
      </View>
    </View>
  );
}
