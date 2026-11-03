import { ScrollView, View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoTraitChip from '@/src/features/inferno/components/inferno-trait-chip';
import type { InfernoSeasonReport } from '@/src/features/inferno/types';

interface InfernoAnalysisSceneProps {
  report: InfernoSeasonReport;
}

interface TraitGroupProps {
  label: string;
  traits: string[];
}

/** "강점"/"약점" 한 칸(Figma 6825:5155): 제목(Heading/H5) 아래 칩을 12 간격으로 늘어놓는다. */
function TraitGroup({ label, traits }: TraitGroupProps) {
  function renderTrait(trait: string, index: number) {
    return <InfernoTraitChip key={`${index}-${trait}`} label={trait} />;
  }

  return (
    <View className="shrink flex-col items-start gap-[8px]">
      <Text variant="heading-h5" className="text-inferno-instruction">
        {label}
      </Text>
      <View className="flex-row flex-wrap items-center gap-[12px]">{traits.map(renderTrait)}</View>
    </View>
  );
}

/**
 * ep5 2페이지 — 행동 분석 리포트.
 *
 * Figma `ep5-결과`(6818:5117)에 맞춰 제목, 성향 문장, 조언, 강점/약점 칩을 표시한다. 새 리포트는
 * 성향·조언·칩을 각각 제공하고, 옛 형식은 `narrative`를 성향 자리에 표시한다. AI 문구 길이가
 * 시안보다 길 수 있어 제목 아래 내용을 스크롤할 수 있게 했다.
 *
 * 다음 페이지 이동은 상단 바 "다음화면"(InfernoTopBar)이 이미 있어 페이지 안에 따로
 * 버튼을 두지 않는다 — 중복이라 뺐다.
 */
export default function InfernoAnalysisScene({ report }: InfernoAnalysisSceneProps) {
  const hasTraits = report.strengths.length > 0 || report.weaknesses.length > 0;

  return (
    <View className="w-full flex-1 flex-col items-center">
      <View className="h-[37px]" />
      <Text variant="display-section-title">
        REPORT
      </Text>
      {/* 6818:5117: 글 묶음은 쪽지 위에서 86. 제목 줄(37 + 35.2)을 빼면 13.8. */}
      <View className="h-[13.8px]" />
      <ScrollView
        className="w-full flex-1"
        contentContainerClassName="items-center"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[601px] flex-col items-center gap-[20px]">
          <View className="w-full flex-col items-center gap-[8px]">
            <Text variant="heading-h4" className="text-center text-inferno-instruction">
              {report.tendency}
            </Text>
            {report.feedback ? (
              <Text variant="body-s" className="text-center text-inferno-instruction">
                {report.feedback}
              </Text>
            ) : null}
          </View>
          {hasTraits ? (
            <View className="w-full flex-row items-start justify-center gap-[100px]">
              {report.strengths.length > 0 ? <TraitGroup label="강점" traits={report.strengths} /> : null}
              {report.weaknesses.length > 0 ? <TraitGroup label="약점" traits={report.weaknesses} /> : null}
            </View>
          ) : null}
        </View>
        <View className="h-[20px]" />
      </ScrollView>
    </View>
  );
}
