import { View } from 'react-native';

import StatBar from '@/src/components/ui/stat-bar';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import type {
  InfernoBehaviorMetric,
  InfernoEngagementStats,
  InfernoRebakeUsage,
} from '@/src/features/inferno/types';

interface InfernoAnalysisSceneProps {
  metrics: InfernoBehaviorMetric[];
  rebakeUsage: InfernoRebakeUsage;
  engagement: InfernoEngagementStats;
  insightLine: string;
}

/**
 * [DRAFT] ep5 2페이지 — 행동 분석 리포트.
 *
 * Figma "ep5-결과"(5748:4314)에 쪽지 틀(781x300)과 "REPORT" 타이틀 + 한 줄까지만 잡혀
 * 있고(재확인 완료) 나머지 항목(게이지 등)은 여전히 시안이 없다. 세로 스크롤로 짰던 첫
 * 버전이 쪽지 높이(300)를 넘겨 스크롤이 생기는 문제가 있어, `InfernoVoteScene`과 같은
 * 좌우 반분(304 + gap 60 + 300 — 같은 쪽지에서 이미 검증된 폭) 배치로 바꿨다.
 *
 * 다음 페이지 이동은 상단 바 "다음화면"(InfernoTopBar)이 이미 있어 페이지 안에 따로
 * 버튼을 두지 않는다 — 중복이라 뺐다.
 */
export default function InfernoAnalysisScene({
  metrics,
  rebakeUsage,
  engagement,
  insightLine,
}: InfernoAnalysisSceneProps) {
  return (
    <View className="flex-1 flex-row items-center justify-center gap-[60px]">
      <View className="w-[304px] flex-col items-center gap-[16px]">
        <Text className="w-full text-center text-pink-500" style={okMallangBTitleStyle}>
          REPORT
        </Text>
        <View className="w-full flex-col gap-[8px]">
          {/* body-s 와 크기(14px)는 같고 글꼴만 굵게(Yde street B) 바꾼 것 — heading-h5 가
              정확히 그 조합의 기존 토큰이라 새 값을 만들지 않고 그대로 썼다. */}
          <Text variant="heading-h5" className="text-text-primary">
            {insightLine}
          </Text>
          <Text variant="body-xs" className="text-text-muted">
            {rebakeUsage.summaryLine}
          </Text>
          <Text variant="body-xs" className="text-text-muted">
            공감 표시 {engagement.empathyCount}회 · AI 피드백 {engagement.aiFeedbackCount}회
          </Text>
        </View>
      </View>

      <View className="w-[300px] flex-col gap-[16px]">
        <Text variant="heading-h5" className="text-text-primary">
          성향별 반응
        </Text>
        <View className="w-full flex-col gap-[12px]">
          {metrics.map((metric) => (
            <StatBar key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </View>
      </View>
    </View>
  );
}

