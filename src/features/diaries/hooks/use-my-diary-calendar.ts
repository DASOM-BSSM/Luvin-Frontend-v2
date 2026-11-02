import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getMyDiaryCalendar } from '@/src/features/diaries/api/diaries';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';

/** 내 일기 달력 한 달 — 모든 공유방에서 내가 일기를 쓴 날. month 는 1~12. */
export default function useMyDiaryCalendar(year: number, month: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: diaryKeys.calendar(year, month),
    queryFn: () => getMyDiaryCalendar(year, month),
    enabled: isAuthenticated,
  });
}
