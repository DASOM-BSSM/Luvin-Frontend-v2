import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getTodayQuestion } from '@/src/features/diaries/api/daily-question';
import { dailyQuestionKeys } from '@/src/features/diaries/api/query-keys';

/** 오늘의 밸런스 게임. 로그인 전에는 부르지 않는다. */
export default function useTodayQuestion() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: dailyQuestionKeys.today,
    queryFn: getTodayQuestion,
    enabled: isAuthenticated,
  });
}
