/**
 * [DRAFT] 10화 뒤 최종 리포트. 서버 리포트를 받아 기존 리포트 화면(InfernoSeasonReportScreen)에
 * 넘긴다. 받는 동안은 스켈레톤, 못 받으면 다시 시도. 연애/솔로는 `story.route` 로 가른다.
 */
import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Skeleton from '@/src/components/ui/skeleton';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoSeasonReportScreen from '@/src/features/inferno/components/inferno-season-report-screen';
import useSeasonReport from '@/src/features/inferno/hooks/use-season-report';
import type { InfernoFinalMatchProfile, InfernoParticipant } from '@/src/features/inferno/types';
import type { StoryState } from '@/src/features/inferno/types/story';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { buildSceneSummary, mergeSeasonReport } from '@/src/features/inferno/utils/scene-summary';

const LAST_ORDER = 10;

interface InfernoSeasonReportGateProps {
  story: StoryState;
  cast: InfernoParticipant[];
  mine: InfernoFinalMatchProfile;
  sessionKey: string;
  readOnly: boolean;
}

export default function InfernoSeasonReportGate({
  story,
  cast,
  mine,
  sessionKey,
  readOnly,
}: InfernoSeasonReportGateProps) {
  const report = useSeasonReport(true);

  function handleRetryPress() {
    void report.refetch();
  }

  if (!report.data)
    return (
      <InfernoEpisodeFrame episode={findInfernoEpisode(LAST_ORDER) ?? { order: LAST_ORDER, title: '' }}>
        <View className="flex-1 items-center justify-center gap-[12px] px-[50px]">
          {report.isError ? (
            <>
              <Text variant="body-m" className="text-text-primary">
                {ERROR_MESSAGES.reportLoadFailed}
              </Text>
              <Button label="다시 시도" onPress={handleRetryPress} />
            </>
          ) : (
            <>
              <Skeleton className="h-[45px] w-full" />
              <Skeleton className="h-[45px] w-full" />
            </>
          )}
        </View>
      </InfernoEpisodeFrame>
    );

  return (
    <InfernoSeasonReportScreen
      summary={mergeSeasonReport(buildSceneSummary(story, cast), report.data, cast)}
      mine={mine}
      sessionKey={sessionKey}
      solo={story.route !== 'romance'}
      readOnly={readOnly}
    />
  );
}
