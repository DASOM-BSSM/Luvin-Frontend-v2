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
 * 모든 방의 일기, 최신순)에서 바로가기 그룹의 지금 정각 칸에 쓴 일기를 전부 그룹 일기 카드로 보여준다 — 지난
 * 시간대 일기는 보이지 않는다(사용자 결정).
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
 * `GroupFeedNotice`). 누르면 그 일기의 그룹으로 간다. 반응이 없으면 그 자리에 질문 생성 알림이 온다 —
 * 알림은 한 장만 뜬다(사용자 결정).
 * 지금 칸에 질문이 아직 없으면 감정일기 메인과 같은 "질문 생성하기" 카드(6271:6645)를 둔다(사용자 결정). 이 카드도
 * 알림 자리 하나를 같이 쓴다 — 알림은 한 번에 하나만 뜬다(`GroupFeedNotice`). 다 만들어지면 질문 블록으로 바뀐다.
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
  const { shortcutRoomId, announcedQuestion, slotDiaries, hasNoRoom, isLoading, isError, refetch } = feed;

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
    announcedQuestion,
    onQuestionNoticePress: handleShortcutPress,
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
          diaries={slotDiaries}
          lastWrittenAt={feed.lastWrittenAt}
        />
      </SectionShell>
    );
  }

  // 여기부터는 지금 칸에 다 만들어진 질문이 없다 — 알림 자리에 "질문 생성하기" 카드를 둔다.
  const noQuestionShellProps = { ...shellProps, questionCreatorRoomId: shortcutRoomId };

  if (slotDiaries.length === 0) {
    return (
      <SectionShell {...noQuestionShellProps}>
        <Text variant="body-s" className="text-text-muted">
          아직 그룹에 올라온 일기가 없어요
        </Text>
      </SectionShell>
    );
  }

  return (
    <SectionShell {...noQuestionShellProps}>
      {/* 다른 일기가 맨 위로 오면 펼쳐 둔 이모지 고르기가 넘어가지 않게 새로 그린다. */}
      {slotDiaries.map((diary) => (
        <ReactableDiaryCard key={diary.diaryId} diary={diary} />
      ))}
    </SectionShell>
  );
}
