/**
 * [DRAFT] 1화 무대 제목 화면. Figma `ep1-시작` (7855:3234) 의 `Frame` 7855:3892.
 *
 * 왼쪽에 제목(Ok Mallang B 40px, 테두리 없음)·부제목·안내, 오른쪽에 빵 묶음이 40 간격으로 선다.
 * 빵 묶음은 없앤 ep0 첫 장면에서 쓰던 통통 튀는 BreadCluster 를 그대로 옮겨 왔다(사용자 요청).
 * 화면 아무 곳이나 누르면 등장인물 소개로 넘어간다.
 */
import { Pressable, View } from 'react-native';

import BreadCluster from '@/src/components/bread-cluster';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { okMallangBHeroStyle } from '@/src/constants/typography';

/**
 * 빵 묶음 크기. 시안 묶음(7855:3810)은 약 234 x 153 인데, BreadCluster 는 좌표를 종횡비
 * 1.3948 기준 %로 들고 있어서 폭 234 에 그 비율을 맞춘 높이를 쓴다(빵이 눌려 보이지 않게).
 */
const CLUSTER_CLASS = 'h-[168px] w-[234px]';

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
      className="flex-1 flex-row items-center justify-center gap-[40px]"
      onPress={onNext}
    >
      <View className="w-[322px] flex-col items-center gap-[8px]">
        <Text className="text-center text-pink-500" style={okMallangBHeroStyle}>
          {title}
        </Text>
        <View className="w-full flex-col items-center gap-[8px]">
          <Text variant="body-s" className="text-center text-inferno-instruction">
            {subtitle}
          </Text>
          <Text variant="body-xs" className="text-center text-text-muted">
            탭하여 계속하기
          </Text>
          {skippable ? (
            <Button label="소개 건너뛰기" variant="outline" onPress={onSkip} />
          ) : null}
        </View>
      </View>
      <BreadCluster state="dough" jumping className={CLUSTER_CLASS} />
    </Pressable>
  );
}
