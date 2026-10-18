import { View } from 'react-native';

import RecBadge from '@/src/components/ui/rec-badge';
import Skeleton from '@/src/components/ui/skeleton';

/**
 * 이번주 에피소드 카드가 어떤 모양일지 아직 모를 때(서버 진행도를 받는 중)의 자리.
 *
 * 기기에 진행 기록이 없을 때(새 기기, 재설치) 서버 응답 전에 "시작하기" 카드가 잠깐 보였다가
 * 회차 카드로 바뀌던 깜빡임을 막는다(LUV-56). 틀·높이는 EpisodeThumbnailCard 와 같아서 데이터가
 * 와도 자리가 밀리지 않는다.
 */
export default function EpisodeCardSkeleton() {
  return (
    <View
      accessibilityLabel="이번주 에피소드 불러오는 중"
      className="h-[144px] w-full overflow-hidden rounded-[12px] border-2 border-dashed border-pink-500 p-[11px]"
    >
      <RecBadge />
      <View className="h-[40px]" />
      <View className="flex-col items-start gap-[6px] pl-[12px]">
        <Skeleton className="h-[16px] w-[80px]" />
        <Skeleton className="h-[28px] w-[200px]" />
      </View>
    </View>
  );
}
