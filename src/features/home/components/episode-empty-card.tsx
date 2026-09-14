import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

/** 진행 중인 에피소드가 없을 때의 썸네일 카드. */
export default function EpisodeEmptyCard() {
  return (
    <View className="h-[144px] w-full overflow-hidden rounded-[12px] border-2 border-dashed border-pink-500 p-[11px]">
      <View className="flex-row items-center gap-[4px] self-start">
        <View className="size-[8px] rounded-full bg-pink-500" />
        <Text variant="body-xs" className="text-pink-500">
          REC
        </Text>
      </View>
      <View className="h-[10px]" />
      <View className="w-full flex-col items-center justify-center gap-[8px]">
        <Text variant="body-s" className="text-text-primary">
          진행 중인 에피소드가 없어요
        </Text>
        <Button label="러빈지옥 시작하기" />
      </View>
    </View>
  );
}
