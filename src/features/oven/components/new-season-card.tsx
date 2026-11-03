import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import RecBadge from '@/src/components/ui/rec-badge';
import Text from '@/src/components/ui/text';

interface NewSeasonCardProps {
  /** 끝난 시즌의 제목(배경 제목 "In School" 등). 모르면 문구에서 뺀다. */
  finishedSeasonTitle?: string;
  /** 새 시즌을 여는 중이면 버튼을 막는다(§11 — 진행 표시는 누른 버튼에). */
  isPending: boolean;
  onCreatePress: () => void;
}

/**
 * [DRAFT] 10화까지 끝낸 뒤의 시즌 카드. 이번주 에피소드 카드(EpisodeEmptyCard)와 같은 분홍 점선 틀·REC·
 * 버튼 배치에 "새로운 시즌 만들기"를 둔다(사용자 결정). 전용 Figma 시안이 아직 없어 기존 카드 구성을 따랐다.
 *
 * 새 시즌을 열 수 있는지(반죽·나이·성별)는 부모가 판단하므로 여기서는 눌렸다는 사실만 알린다.
 */
export default function NewSeasonCard({
  finishedSeasonTitle,
  isPending,
  onCreatePress,
}: NewSeasonCardProps) {
  return (
    <View className="h-[144px] w-full overflow-hidden rounded-[12px] border-2 border-dashed border-pink-500 p-[11px]">
      <RecBadge />
      <View className="h-[10px]" />
      <View className="w-full flex-col items-center justify-center gap-[8px]">
        <Text variant="body-s" className="text-text-primary">
          {finishedSeasonTitle ? `${finishedSeasonTitle} 시즌이 끝났어요` : '이번 시즌이 끝났어요'}
        </Text>
        <Button
          label={isPending ? '새 시즌 굽는 중...' : '새로운 시즌 만들기'}
          disabled={isPending}
          onPress={onCreatePress}
        />
      </View>
    </View>
  );
}
