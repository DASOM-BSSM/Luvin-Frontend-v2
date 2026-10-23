/**
 * [DRAFT] 1화 무대 제목 화면. 제목은 Ok Mallang B(`display-title`), 아래에 배경별 부제목.
 * 시안이 없어 기존 토큰으로만 그린다. 화면 아무 곳이나 누르면 등장인물 소개로 넘어간다.
 */
import { Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

interface InfernoStageIntroProps {
  title: string;
  subtitle: string;
  /** 다시 볼 때만 건너뛰기를 보여준다. */
  skippable: boolean;
  onNext: () => void;
  onSkip: () => void;
}

export default function InfernoStageIntro({
  title,
  subtitle,
  skippable,
  onNext,
  onSkip,
}: InfernoStageIntroProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}. 눌러서 등장인물 보기`}
      className="flex-1 items-center justify-center gap-[12px] px-[50px]"
      onPress={onNext}
    >
      <Text variant="display-title" className="text-center">
        {title}
      </Text>
      <Text variant="body-m" className="text-center text-text-primary">
        {subtitle}
      </Text>
      <Text variant="body-xs" className="text-text-muted">
        탭해서 계속하기
      </Text>
      {skippable ? (
        <View className="items-center">
          <Button label="소개 건너뛰기" variant="outline" onPress={onSkip} />
        </View>
      ) : null}
    </Pressable>
  );
}
