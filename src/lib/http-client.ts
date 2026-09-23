import axios from 'axios';

/**
 * 서버 통신 전용 axios 인스턴스. §11 — 컴포넌트는 이 모듈을 직접 부르지 않고
 * `src/features/<feature>/api/` 안의 함수를 거친다.
 *
 * 인증 토큰 주입/401 리프레시 인터셉터는 §12 인증 작업이 시작되면
 * `src/features/auth/lib/token-storage.ts` 와 함께 여기 추가한다.
 */
const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

export default httpClient;
