/** [DRAFT] 최종 리포트(`GET /api/ai/seasons/report`). 10화를 완료하면 서버가 만든다. */
import { useQuery } from '@tanstack/react-query';

import { getSeasonReport } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';

export default function useSeasonReport(enabled: boolean) {
  return useQuery({ queryKey: aiSeasonKeys.report, queryFn: getSeasonReport, enabled });
}
