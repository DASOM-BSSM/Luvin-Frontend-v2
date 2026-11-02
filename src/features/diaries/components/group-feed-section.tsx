import { Pressable } from 'react-native';

import Text from '@/src/components/ui/text';
import { NotStartedShell, SectionShell } from '@/src/features/diaries/components/group-feed-shells';
import HomeQuestionBlock from '@/src/features/diaries/components/home-question-block';
import ReactableDiaryCard from '@/src/features/diaries/components/reactable-diary-card';
import useHomeGroupFeed from '@/src/features/diaries/hooks/use-home-group-feed';
import type { RoomId } from '@/src/features/diaries/types';
import DiaryStartCard from '@/src/features/home/components/diary-start-card';

/**
 * "쫀쫀한 조합들" 섹션(Figma 5950:6770). 커뮤니티 피드(`GET /api/diaries/community` — 내가 속한
 * 모든 방의 일기, 최신순)에서 가장 최근 일기를 그룹 일기 카드로 보여준다.
 *
 * 그룹이 하나도 없으면(감정일기 시작 전) 그룹 이름 같은 "쫀쫀한 조합들" 대신 "Emodi 감정일기" 제목과
 * "감정일기 시작하기" 카드를 보여준다(리뷰 LUV-83). 그룹은 있는데 일기가 없으면 안내 문구를 쓴다.
 *
 * 카드의 반응 버튼(☺+)으로 바로 이모지 반응을 남길 수 있다(LUV-90 피드백).
 *
 * 그 그룹에 오늘 질문이 만들어져 있으면 일기 카드 위에 질문 생성 알림을 띄우고, 아래에는 질문과 같은
 * 정각 칸(같은 날 같은 시)에 쓴 일기만 둔다 — 이전 시간 · 이전 날짜 일기는 같이 보이지 않는다(사용자 결정).
 * 알림과 일기 사이에 내 "눌러서 작성" 카드가 온다(`HomeQuestionBlock`).
 *
 * Figma 의 "○○님이 ○○님의 일기에 반응을 했습니다" 알림 카드는 머리 바로 아래에 둔다(`SectionShell` →
 * `RecentReactionNotice`). 누르면 그 일기의 그룹으로 간다.
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
  const feed = useHomeGroupFeed();
  const { shortcutRoomId, announcedQuestion, latestDiary, hasNoRoom, isLoading, isError, refetch } = feed;

  function handleRetryPress() {
    refetch();
  }

  function handleShortcutPress() {
    if (shortcutRoomId === undefined) return;
    onGroupPress(shortcutRoomId);
  }
  const shellProps = {
    shortcutLabel,
    onShortcutPress: handleShortcutPress,
    onReactionPress: onGroupPress,
  };


  // 그룹이 있는지 모르는 동안에는 그룹 이름처럼 보이는 제목이 잠깐이라도 뜨지 않게 섹션 이름을 쓴다.
  if (isLoading) {
    return (
      <NotStartedShell>
        <Text variant="body-s" className="text-text-muted">
          불러오는 중...
        </Text>
      </NotStartedShell>
    );
  }

  if (isError) {
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

  if (announcedQuestion) {
    return (
      <SectionShell {...shellProps}>
        <HomeQuestionBlock
          question={announcedQuestion}
          latestDiary={latestDiary}
          lastWrittenAt={feed.lastWrittenAt}
          onNoticePress={handleShortcutPress}
        />
      </SectionShell>
    );
  }

  if (!latestDiary) {
    return (
      <SectionShell {...shellProps}>
        <Text variant="body-s" className="text-text-muted">
          아직 그룹에 올라온 일기가 없어요
        </Text>
      </SectionShell>
    );
  }

  return (
    <SectionShell {...shellProps}>
      {/* 다른 일기가 맨 위로 오면 펼쳐 둔 이모지 고르기가 넘어가지 않게 새로 그린다. */}
      <ReactableDiaryCard key={latestDiary.diaryId} diary={latestDiary} />
    </SectionShell>
  );
}
