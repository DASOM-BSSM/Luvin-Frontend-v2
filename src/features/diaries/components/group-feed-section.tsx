import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import GroupIcon from '@/src/assets/icons/GroupIcon';
import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import ReactableDiaryCard from '@/src/features/diaries/components/reactable-diary-card';
import useCommunityDiaries from '@/src/features/diaries/hooks/use-community-diaries';
import useMyRooms from '@/src/features/diaries/hooks/use-my-rooms';
import type { RoomId } from '@/src/features/diaries/types';
import DiaryStartCard from '@/src/features/home/components/diary-start-card';

const SECTION_TITLE = '쫀쫀한 조합들';

/** 그룹이 하나도 없을 때(감정일기 시작 전)의 제목. Figma "메인-우린" 6172:3393 과 같다. */
const NOT_STARTED_TITLE = 'Emodi 감정일기';

interface SectionShellProps {
  children: ReactNode;
}

interface GroupSectionShellProps extends SectionShellProps {
  shortcutLabel: string;
  /** "바로가기→"를 누르면. */
  onShortcutPress: () => void;
}

const SectionShell = ({ children, shortcutLabel, onShortcutPress }: GroupSectionShellProps) => (
  <View className="w-full flex-col items-start gap-[12px]">
    <SectionHeader
      title={SECTION_TITLE}
      icon={<GroupIcon />}
      actionLabel={shortcutLabel}
      onActionPress={onShortcutPress}
    />
    {children}
  </View>
);

/** 감정일기 시작 전 — 그룹 아이콘 · 바로가기 없이 섹션 이름만(리뷰 LUV-83). */
const NotStartedShell = ({ children }: SectionShellProps) => (
  <View className="w-full flex-col items-start gap-[12px]">
    <SectionHeader title={NOT_STARTED_TITLE} />
    {children}
  </View>
);

/**
 * "쫀쫀한 조합들" 섹션(Figma 5950:6770). 커뮤니티 피드(`GET /api/diaries/community` — 내가 속한
 * 모든 방의 일기, 최신순)에서 가장 최근 일기를 그룹 일기 카드로 보여준다.
 *
 * 그룹이 하나도 없으면(감정일기 시작 전) 그룹 이름 같은 "쫀쫀한 조합들" 대신 "Emodi 감정일기" 제목과
 * "감정일기 시작하기" 카드를 보여준다(리뷰 LUV-83). 그룹은 있는데 일기가 없으면 안내 문구를 쓴다.
 *
 * 카드의 반응 버튼(☺+)으로 바로 이모지 반응을 남길 수 있다(LUV-90 피드백).
 *
 * Figma 의 "○○님이 ○○님의 일기에 반응을 했습니다" 알림 카드는 이번 범위 밖이라 뺐다.
 * 로딩 · 에러 상태는 시안이 없어 다른 화면(bread/oven)과 같은 글자 안내로 둔다.
 */
interface GroupFeedSectionProps {
  /** 그룹이 없을 때 "감정일기 시작하기"를 누르면. */
  onStartPress: () => void;
  /** "바로가기→"를 누르면 그 그룹의 감정일기 메인으로 간다. */
  onGroupPress: (roomId: RoomId) => void;
  /** 바로가기 문구. 앱 홈은 "감정일기 바로가기→" 를 쓴다. */
  shortcutLabel?: string;
}

export default function GroupFeedSection({
  onStartPress,
  onGroupPress,
  shortcutLabel = '바로가기→',
}: GroupFeedSectionProps) {
  const roomsQuery = useMyRooms();
  const feedQuery = useCommunityDiaries();
  const latestDiary = feedQuery.data?.[0];
  const hasNoRoom = roomsQuery.isSuccess && roomsQuery.data.length === 0;
  // 바로가기는 지금 보여주는 일기의 그룹으로, 일기가 없으면 내 첫 번째 그룹으로 간다.
  const shortcutRoomId = latestDiary?.roomId ?? roomsQuery.data?.[0]?.id;

  function handleRetryPress() {
    roomsQuery.refetch();
    feedQuery.refetch();
  }

  function handleShortcutPress() {
    if (shortcutRoomId === undefined) return;
    onGroupPress(shortcutRoomId);
  }

  // 그룹이 있는지 모르는 동안에는 그룹 이름처럼 보이는 제목이 잠깐이라도 뜨지 않게 섹션 이름을 쓴다.
  if (roomsQuery.isLoading || feedQuery.isLoading) {
    return (
      <NotStartedShell>
        <Text variant="body-s" className="text-text-muted">
          불러오는 중...
        </Text>
      </NotStartedShell>
    );
  }

  if (roomsQuery.isError || feedQuery.isError) {
    return (
      <NotStartedShell>
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-s" className="text-state-error">
            감정일기를 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      </NotStartedShell>
    );
  }

  if (hasNoRoom) {
    return (
      <NotStartedShell>
        <DiaryStartCard onStartPress={onStartPress} />
      </NotStartedShell>
    );
  }

  if (!latestDiary) {
    return (
      <SectionShell shortcutLabel={shortcutLabel} onShortcutPress={handleShortcutPress}>
        <Text variant="body-s" className="text-text-muted">
          아직 그룹에 올라온 일기가 없어요
        </Text>
      </SectionShell>
    );
  }

  return (
    <SectionShell shortcutLabel={shortcutLabel} onShortcutPress={handleShortcutPress}>
      {/* 다른 일기가 맨 위로 오면 펼쳐 둔 이모지 고르기가 넘어가지 않게 새로 그린다. */}
      <ReactableDiaryCard key={latestDiary.diaryId} diary={latestDiary} />
    </SectionShell>
  );
}
