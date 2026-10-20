import { Pressable, View } from 'react-native';

import FolderIcon from '@/src/assets/icons/FolderIcon';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import theme from '@/src/constants/theme';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { InfernoParticipant } from '@/src/features/inferno/types';

interface PersonalChatShortcutProps {
  label: string;
  /** 폴더 색. 시안이 바로가기마다 다르게 칠해 놨다(아래 주석 참고). */
  iconColor: string;
  /** 폴더 불투명도. 선택된 "다시 굽기" 만 흐려진다(시안 5467:5888). */
  iconOpacity?: number;
  /** 라벨 글자 색. 선택된 "다시 굽기" 만 흐려진다(시안 5467:5876). */
  labelClassName?: string;
  /** 넘기지 않으면 갈 곳이 없다는 뜻이라 눌러도 아무 일도 하지 않는다. */
  onPress?: () => void;
}

/**
 * 바로가기 하나. Figma `Frame 73`/`Frame 71` (5379:3575, 5379:3579, 5449:1740, 5449:1745).
 *
 * 폴더(60)와 글자(26)가 간격 없이 맞붙는다 — 시안의 묶음 높이가 86 이라 사이가 0 이다.
 */
function PersonalChatShortcut({
  label,
  iconColor,
  iconOpacity,
  labelClassName = 'text-text-primary',
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
      <FolderIcon color={iconColor} opacity={iconOpacity} />
      <Text variant="body-m" className={labelClassName}>
        {label}
      </Text>
    </Pressable>
  );
}

/** 선택된 "다시 굽기" 폴더의 채움 불투명도. Figma 5467:5888 SVG 의 fill-opacity. */
const SELECTED_FOLDER_OPACITY = 0.5;

interface InfernoPersonalChatSidebarProps {
  /** 내 분신. 반죽 둘 중 왼쪽에 선다. */
  mine?: InfernoParticipant;
  /** 1:1 상대. 반죽 둘 중 오른쪽에 선다. */
  partner?: InfernoParticipant;
  /** "나의 빵에게" 를 눌렀을 때. */
  onFeedbackPress?: () => void;
  /**
   * "나의 빵에게" 피드백을 이미 썼는지. 맞으면 폴더가 pink/300 으로 바뀐다 — 보낸 적이 있다는
   * 표시다(시안 `ep2-대화 끝` 5467:5564, `ep4-끝` 5467:5675). 회차 한 번 제한은 앱에서 풀어서
   * (사용자 결정) 보낸 뒤에도 눌린다.
   */
  isFeedbackUsed?: boolean;
  /**
   * "다시 굽기" 를 눌렀을 때. 넘기지 않으면(지금은 다시 보기일 때만) 눌러도 아무 일도 하지 않고,
   * 폴더가 회색으로 바뀐다. 선택된 상태(isRebakeSelected)면 그 모양이 우선한다.
   */
  onRebakePress?: () => void;
  /**
   * 지금 다시 굽기로 고른 상대와 대화 중인지. 맞으면 "다시 굽기" 가 선택된 모양으로 흐려진다
   * (시안 `다시굽기` 5467:5876).
   */
  isRebakeSelected?: boolean;
}

/**
 * 1:1 대화 화면 왼쪽. Figma `ep2-대화` (5379:3574, 5379:3583 왼쪽 묶음),
 * `ep4-대화` (5449:1735, 5449:1740 왼쪽 묶음).
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
 * 폴더 색은 둘 다 pink/400 이 기본이다. 시안마다 색이 다른 건 상태 표시라서(사용자 확인)
 * 그 상태일 때만 바꾼다:
 *
 * - "나의 빵에게" 가 pink/300 이면 그 기회를 이미 썼다는 뜻이다(isFeedbackUsed).
 *   `ep2-대화` 5379:3570, `ep4-대화` 5449:1735 는 pink/400, `ep2-대화 끝` 5467:5564,
 *   `ep4-끝` 5467:5675 는 pink/300. 예전엔 둘이 어긋난 시안으로 보고 pink/300 으로 고정했었다.
 *
 * - "다시 굽기" 가 흐려지면(같은 pink/400 에 채움 불투명도 0.5, 글자 rgba(29,29,29,0.5))
 *   지금 이 기능을 선택했다는 뜻이다(isRebakeSelected, 시안 5467:5876 의 5467:5888).
 *   "다 써서 못 누른다" 와는 다른 모양이다 — 시안 SVG 는 `#FFBCCA` + fill-opacity 0.5 다.
 *
 * - 못 누르는 "다시 굽기"(onRebakePress 를 안 넘김 — 지금은 다시 보기일 때뿐. 시즌 한 번 제한은 앱에서
 *   풀었다, 사용자 결정)는 폴더가 회색(default/gray), 글자가 반투명이다.
 *   한때 이 회색을 없애고 보통 모양으로 뒀더니 눌릴 것처럼 보여서 "클릭이 안 된다" 는 제보가
 *   나왔다 — 그래서 되돌렸다(사용자 결정). 선택된 상태가 이 모양보다 우선한다.
 *
 * "나의 빵에게" 는 회차 한 번 제한을 앱에서 풀어서(사용자 결정) 부르는 쪽이 늘 onFeedbackPress 를 넘긴다.
 *
 * 반죽 둘은 personDough(팔다리 있는 반죽)를 쓴다(BreadCharacter 주석 참고).
 *
 * 폭은 시안(384)보다 좁은 300 이다(사용자 요청: 1:1 대화창을 가로로 더 길게). 안에 든 것 중
 * 가장 넓은 반죽 줄도 67 + 107 + 11 + 반죽 폭(최대 107) = 292 라 300 안에 들어간다. 이 폭을
 * 바꾸면 constants/chat-layout 의 PERSONAL_CHAT_LAYOUT.reservedWidth 도 같이 바꿀 것.
 */
export default function InfernoPersonalChatSidebar({
  mine,
  partner,
  onFeedbackPress,
  isFeedbackUsed = false,
  onRebakePress,
  isRebakeSelected = false,
}: InfernoPersonalChatSidebarProps) {
  const isRebakeDisabled = !isRebakeSelected && !onRebakePress;

  return (
    <View className="w-[300px] flex-col">
      <View className="h-[25px]" />

      <View className="w-[205px] flex-col items-center gap-[12px]">
        <PersonalChatShortcut
          label="다시 굽기"
          iconColor={isRebakeDisabled ? theme.default.gray : theme.pink[400]}
          iconOpacity={isRebakeSelected ? SELECTED_FOLDER_OPACITY : 1}
          labelClassName={
            isRebakeSelected || isRebakeDisabled ? 'text-default-black/50' : 'text-text-primary'
          }
          onPress={onRebakePress}
        />
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
