import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getTodayBalanceGame } from '@/src/features/diaries/api/balance-game';
import { balanceGameKeys } from '@/src/features/diaries/api/query-keys';

/** 오늘의 밸런스 게임. 오늘 질문이 없으면 data 가 null 이다. 로그인 전에는 부르지 않는다. */
export default function useTodayBalanceGame() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: balanceGameKeys.today,
    queryFn: getTodayBalanceGame,
    enabled: isAuthenticated,
  });
}
