import axios from 'axios';

/** 초대코드가 틀렸을 때(서버 404). 서버 문구를 그대로 보여주지 않고 앱 문구로 바꾼다(§11). */
const INVALID_INVITE_CODE_MESSAGE = '초대코드가 올바르지 않아요. 다시 확인해주세요';
const JOIN_ROOM_FALLBACK_MESSAGE = '그룹에 참여하지 못했어요. 다시 시도해 주세요';

/** 그룹 참여 실패 → 화면 문구. */
export function getJoinRoomErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return INVALID_INVITE_CODE_MESSAGE;
  }
  return JOIN_ROOM_FALLBACK_MESSAGE;
}
