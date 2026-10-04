import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import GroupIcon from '@/src/assets/icons/GroupIcon';
import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import GroupDiaryCard from '@/src/features/diaries/components/group-diary-card';
import useCommunityDiaries from '@/src/features/diaries/hooks/use-community-diaries';
import type { DiaryFeedItem, GroupDiaryPreview } from '@/src/features/diaries/types';
import { formatDiaryTime } from '@/src/features/diaries/utils/feed';
import DiaryStartCard from '@/src/features/home/components/diary-start-card';

const SECTION_TITLE = '쫀쫀한 조합들';

function toGroupDiaryPreview(item: DiaryFeedItem): GroupDiaryPreview {
  return { time: formatDiaryTime(item.createdAt), message: item.content };
}

interface SectionShellProps {
  children: ReactNode;
}

const SectionShell = ({ children }: SectionShellProps) => (
  <View className="w-full flex-col items-start gap-[12px]">
    <SectionHeader title={SECTION_TITLE} icon={<GroupIcon />} actionLabel="바로가기→" />
    {children}
  </View>
);

/**
 * "쫀쫀한 조합들" 섹션(Figma 5950:6770). 커뮤니티 피드(`GET /api/diaries/community` — 내가 속한
 * 모든 방의 일기, 최신순)에서 가장 최근 일기를 그룹 일기 카드로 보여준다. 일기가 하나도 없으면
 * (방이 없거나 아직 아무도 안 썼으면) 홈 화면의 "감정일기 시작하기" 카드를 쓴다.
 *
 * Figma 의 "○○님이 ○○님의 일기에 반응을 했습니다" 알림 카드는 이번 범위 밖이라 뺐다.
 * 로딩 · 에러 상태는 시안이 없어 다른 화면(bread/oven)과 같은 글자 안내로 둔다.
 */
export default function GroupFeedSection() {
  const feedQuery = useCommunityDiaries();
  const latestDiary = feedQuery.data?.[0];

  function handleRetryPress() {
    feedQuery.refetch();
  }

  if (feedQuery.isLoading) {
    return (
      <SectionShell>
        <Text variant="body-s" className="text-text-muted">
          불러오는 중...
        </Text>
      </SectionShell>
    );
  }

  if (feedQuery.isError) {
    return (
      <SectionShell>
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-s" className="text-state-error">
            그룹 일기를 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      </SectionShell>
    );
  }

  if (!latestDiary) {
    return (
      <SectionShell>
        <DiaryStartCard />
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <GroupDiaryCard diary={toGroupDiaryPreview(latestDiary)} />
    </SectionShell>
  );
}
