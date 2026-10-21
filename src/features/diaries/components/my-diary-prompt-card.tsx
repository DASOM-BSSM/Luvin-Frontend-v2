import { View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import type { GroupDiaryAuthor } from '@/src/features/diaries/types';

interface MyDiaryPromptCardProps {
  author: GroupDiaryAuthor;
  /** 표시용 시각. 예: "15:00" */
  time: string;
  onWritePress: () => void;
}

/**
 * 오늘 아직 일기를 안 쓴 내 자리. Figma "감정일기 메인 - 제민"(5942:5456)의 흰 카드(6248:4881) —
 * 그룹 일기 카드와 같은 162 높이에 "눌러서 작성" 버튼이 들어간다.
 */
export default function MyDiaryPromptCard({ author, time, onWritePress }: MyDiaryPromptCardProps) {
  return (
    <View className="h-[162px] w-full flex-col items-center justify-between overflow-hidden rounded-[8px] bg-default-white p-[12px]">
      <View className="w-full flex-row items-center gap-[4px]">
        {author.type ? (
          <BreadCharacter
            type={author.type}
            state={author.state}
            className="h-[17px] w-[25px]"
            accessibilityLabel={author.name}
          />
        ) : null}
        <Text variant="body-xs" className="text-center text-default-black">
          {author.name}
        </Text>
      </View>
      <View className="flex-col items-center gap-[4px]">
        <Text variant="heading-h2" className="text-center text-text-primary">
          {time}
        </Text>
        <Button label="눌러서 작성" variant="outline" onPress={onWritePress} />
      </View>
      {/* 시안의 아래 18px 빈 줄(6248:4889) — 그룹 일기 카드의 반응 버튼 줄과 높이를 맞춘다. */}
      <View className="h-[18px] w-full" />
    </View>
  );
}
