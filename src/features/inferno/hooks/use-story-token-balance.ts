import { useQuery } from '@tanstack/react-query';

import { getStoryTokenBalance } from '@/src/features/inferno/api/story';
import { storyKeys } from '@/src/features/inferno/api/query-keys';

/**
 * 소금빵(무료)·식빵(유료) 보유 토큰. 목 모드면 목 서버의 값을 쓴다.
 * 회차 열기 안내와 오븐 탭이 같은 캐시(`storyKeys.tokenBalance`)를 본다.
 */
export default function useStoryTokenBalance() {
  return useQuery({
    queryKey: storyKeys.tokenBalance,
    queryFn: getStoryTokenBalance,
  });
}
