import axios from 'axios';

/** 서버가 프로필(현재는 gender)이 없어서 시즌 생성을 막을 때 주는 코드. */
const PROFILE_REQUIRED_CODE = 'PROFILE_REQUIRED';

/**
 * `POST /api/ai/seasons/from-survey` 실패가 "성별을 먼저 설정해야 한다"는 뜻인지 판단한다.
 * 실기기 응답: `409 {"code": "PROFILE_REQUIRED", "message": "시즌을 생성하려면 먼저 gender를
 * 설정해야 합니다."}` — message 는 바뀔 수 있어서 code 로만 판단한다.
 */
export function isProfileRequiredError(error: unknown): boolean {
  if (!axios.isAxiosError<{ code?: string }>(error)) {
    return false;
  }

  return error.response?.status === 409 && error.response.data?.code === PROFILE_REQUIRED_CODE;
}
