import { QueryClient } from '@tanstack/react-query';

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
});

export default queryClient;
