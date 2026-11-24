import type { ReactNode } from 'react';
import { View } from 'react-native';

import GroupIcon from '@/src/assets/icons/GroupIcon';
import SectionHeader from '@/src/components/ui/section-header';
import GroupFeedNotice from '@/src/features/diaries/components/group-feed-notice';
import GroupSwitchTitle from '@/src/features/diaries/components/group-switch-title';
import type { RoomId, RoomQuestion } from '@/src/features/diaries/types';

/** 그룹 이름을 아직 모를 때 대신 쓰는 제목. 평소에는 바로가기 그룹의 이름을 쓴다(LUV-110). */
const FALLBACK_SECTION_TITLE = '쫀쫀한 조합들';

/** 그룹이 하나도 없을 때(감정일기 시작 전)의 제목. Figma "메인-우린" 6172:3393 과 같다. */
const NOT_STARTED_TITLE = 'Emodi 감정일기';

interface SectionShellProps {
  children: ReactNode;
}

export interface GroupSectionShellProps extends SectionShellProps {
  /** 섹션 제목 — 바로가기 그룹의 이름. 없으면 "쫀쫀한 조합들". */
  roomName?: string;
  /** 섹션이 보여주는 그룹(바로가기 그룹). */
  roomId?: RoomId;
  /** 제목을 눌러 다른 그룹을 고르면(내 그룹이 둘 이상일 때만 눌린다). */
  onRoomSelect: (roomId: RoomId) => void;
  shortcutLabel: string;
  /** "바로가기→"를 누르면. */
  onShortcutPress: () => void;
  /** 맨 위 반응 알림을 누르면 그 일기가 있는 그룹으로 간다. */
  onReactionPress: (roomId: RoomId) => void;
  /** 반응 알림이 없을 때 대신 알릴 오늘 질문. 없으면 undefined. */
  announcedQuestion?: RoomQuestion;
  /** 질문 생성 알림을 누르면(질문이 있는 그룹으로 간다). */
  onQuestionNoticePress: () => void;
  /** 지금 칸에 질문이 없을 때 알림 자리에 "질문 생성하기" 카드를 둘 그룹. */
  questionCreatorRoomId?: RoomId;
}

/**
 * "쫀쫀한 조합들" 머리 + 맨 위 알림 한 장(`GroupFeedNotice` — 반응 알림, 없으면 질문 생성 알림) + 그 아래 내용.
 */
export const SectionShell = ({
  children,
  roomName,
  roomId,
  onRoomSelect,
  shortcutLabel,
  onShortcutPress,
  onReactionPress,
  announcedQuestion,
  onQuestionNoticePress,
  questionCreatorRoomId,
}: GroupSectionShellProps) => (
  <View className="w-full flex-col items-start gap-[12px]">
    <SectionHeader
      title={roomName || FALLBACK_SECTION_TITLE}
      titleSlot={
        <GroupSwitchTitle
          title={roomName || FALLBACK_SECTION_TITLE}
          roomId={roomId}
          onRoomSelect={onRoomSelect}
        />
      }
      icon={<GroupIcon />}
      actionLabel={shortcutLabel}
      onActionPress={onShortcutPress}
    />
    <GroupFeedNotice
      question={announcedQuestion}
      creatorRoomId={questionCreatorRoomId}
      onReactionPress={onReactionPress}
      onQuestionPress={onQuestionNoticePress}
    />
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
