import type { ReactNode } from 'react';
import { View } from 'react-native';

import GroupIcon from '@/src/assets/icons/GroupIcon';
import SectionHeader from '@/src/components/ui/section-header';
import RecentReactionNotice from '@/src/features/diaries/components/recent-reaction-notice';
import type { RoomId } from '@/src/features/diaries/types';

const SECTION_TITLE = '쫀쫀한 조합들';

/** 그룹이 하나도 없을 때(감정일기 시작 전)의 제목. Figma "메인-우린" 6172:3393 과 같다. */
const NOT_STARTED_TITLE = 'Emodi 감정일기';

interface SectionShellProps {
  children: ReactNode;
}

export interface GroupSectionShellProps extends SectionShellProps {
  shortcutLabel: string;
  /** "바로가기→"를 누르면. */
  onShortcutPress: () => void;
  /** 맨 위 반응 알림을 누르면 그 일기가 있는 그룹으로 간다. */
  onReactionPress: (roomId: RoomId) => void;
}

/**
 * "쫀쫀한 조합들" 머리 + 맨 위 반응 알림(Figma 5950:6776, `RecentReactionNotice` — 반응이 없으면 안 그린다) +
 * 그 아래 내용.
 */
export const SectionShell = ({
  children,
  shortcutLabel,
  onShortcutPress,
  onReactionPress,
}: GroupSectionShellProps) => (
  <View className="w-full flex-col items-start gap-[12px]">
    <SectionHeader
      title={SECTION_TITLE}
      icon={<GroupIcon />}
      actionLabel={shortcutLabel}
      onActionPress={onShortcutPress}
    />
    <RecentReactionNotice onPress={onReactionPress} />
    {children}
  </View>
);

/** 감정일기 시작 전 — 그룹 아이콘 · 바로가기 없이 섹션 이름만(리뷰 LUV-83). */
export const NotStartedShell = ({ children }: SectionShellProps) => (
  <View className="w-full flex-col items-start gap-[12px]">
    <SectionHeader title={NOT_STARTED_TITLE} />
    {children}
  </View>
);
