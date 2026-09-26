import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import axios from 'axios';

/** 개발 중 원인 불명 실패를 안 겪으려고 실제 요청 URL/상태코드까지 찍는다(§14 — 프로덕션 전 크래시 리포팅으로 교체할 자리). */
function logQueryError(context: string, error: unknown) {
  if (!__DEV__) {
    return;
  }

  if (axios.isAxiosError(error)) {
    console.error(
      `[${context}] ${error.config?.method?.toUpperCase()} ${error.config?.url} -> ${error.response?.status}`,
      error.response?.data,
    );
    return;
  }

  console.error(`[${context}]`, error);
}

/**
 * 앱 전역에서 쓰는 단 하나의 QueryClient. §11 — 컴포넌트 안에서 새로 만들지 않는다.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => logQueryError(`query ${String(query.queryKey[0])}`, error),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) =>
      logQueryError(`mutation ${mutation.options.mutationKey ?? ''}`, error),
  }),
});

export default queryClient;
