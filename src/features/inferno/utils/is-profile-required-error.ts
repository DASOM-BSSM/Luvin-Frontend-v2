import axios from 'axios';

/**
 * 서버가 프로필(나이·성별)이 없어서 시즌 생성을 막을 때 주는 코드.
 * 예전 서버는 `PROFILE_REQUIRED`(성별만), 계약 v4 서버는 `AGE_REQUIRED`(나이·성별)를 준다.
 */
const PROFILE_REQUIRED_CODES = ['PROFILE_REQUIRED', 'AGE_REQUIRED'];

/**
 * `POST /api/ai/seasons/from-survey` 실패가 "나이·성별을 먼저 설정해야 한다"는 뜻인지 판단한다.
 * 실기기 응답: `409 {"code": "AGE_REQUIRED", "message": "나이와 성별을 먼저 입력해주세요."}` —
 * message 는 바뀔 수 있어서 code 로만 판단한다.
 */
export function isProfileRequiredError(error: unknown): boolean {
  if (!axios.isAxiosError<{ code?: string }>(error)) {
    return false;
  }

  const code = error.response?.data?.code;
  return error.response?.status === 409 && code !== undefined && PROFILE_REQUIRED_CODES.includes(code);
}
