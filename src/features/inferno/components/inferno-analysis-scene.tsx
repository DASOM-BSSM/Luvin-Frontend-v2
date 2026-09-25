import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import type { InfernoSeasonReport } from '@/src/features/inferno/types';

const STRENGTH_TITLE = '강점';
const WEAKNESS_TITLE = '약점';

interface InfernoAnalysisSceneProps {
  report: InfernoSeasonReport;
}

/** 강점/약점 항목 하나를 칩(알약 배지)으로. 텍스트 줄보다 눈에 띄게 하기 위함. */
function AnalysisChip({ label }: { label: string }) {
  return (
    <View className="rounded-full border border-pink-300 bg-pink-100 px-[12px] py-[4px]">
      <Text variant="body-s" className="text-text-primary">
        {label}
      </Text>
    </View>
  );
}

/**
 * [DRAFT] ep5 2페이지 — 행동 분석 리포트.
 *
 * Figma "ep5-결과"(5748:4314)에 쪽지 틀(781x300)과 "REPORT" 타이틀 + 한 줄까지만 잡혀
 * 있고(재확인 완료) 나머지 항목은 여전히 시안이 없다. 사용자 확인(스크린샷 피드백)을 거쳐
 * 위아래 배치로 정착했다 — 위는 REPORT 제목/요약/조언을 전체 폭에서 중앙 정렬하고, 아래는
 * 강점/약점을 가운데 정렬로 나란히 두되 둘 사이 간격을 100px 로 고정했다(사용자 지정값).
 * 좁은 고정폭 컬럼에 텍스트를 가두지 않아서
 * 전에 있던 "요약 문장이 3줄로 밀리는" 문제도 자연히 해결된다.
 *
 * `GET /api/simulation/report`가 성향별 수치·다시굽기 사용여부가 아니라 강점/약점/조언
 * 텍스트로 응답을 주는 걸 확인해서(원래 있던 막대그래프는 틀린 가정이었다), 강점/약점은
 * 막대그래프 대신 칩(배지)으로 눈에 띄게 보여준다 — 항목마다 점수가 없어서(문자열 배열)
 * 그래프로 그릴 수치 자체가 없다.
 *
 * 다음 페이지 이동은 상단 바 "다음화면"(InfernoTopBar)이 이미 있어 페이지 안에 따로
 * 버튼을 두지 않는다 — 중복이라 뺐다.
 */
export default function InfernoAnalysisScene({ report }: InfernoAnalysisSceneProps) {
  return (
    <View className="w-full flex-1 flex-col items-center justify-center gap-[32px] px-[40px]">
      <View className="w-full flex-col items-center gap-[8px]">
        <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
          REPORT
        </Text>
        <Text variant="heading-h4" className="text-center text-text-primary">
          {report.summary}
        </Text>
        <Text variant="body-s" className="text-center text-text-muted">
          {report.advice}
        </Text>
      </View>

      <View className="w-full flex-row justify-center gap-[100px]">
        <View className="flex-col items-start gap-[8px]">
          <Text variant="heading-h5" className="text-text-primary">
            {STRENGTH_TITLE}
          </Text>
          <View className="flex-row flex-wrap gap-[8px]">
            {report.strength.map((item) => (
              <AnalysisChip key={item} label={item} />
            ))}
          </View>
        </View>
        <View className="flex-col items-start gap-[8px]">
          <Text variant="heading-h5" className="text-text-primary">
            {WEAKNESS_TITLE}
          </Text>
          <View className="flex-row flex-wrap gap-[8px]">
            {report.weakness.map((item) => (
              <AnalysisChip key={item} label={item} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
