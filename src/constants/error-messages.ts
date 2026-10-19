/**
 * 사용자에게 보여줄 에러 문구(AGENTS.md §11). 서버 message 를 그대로 보여주지 않고,
 * 서버가 주는 `code` 를 여기 문구로 바꿔 보여준다.
 */
export const ERROR_MESSAGES = {
  /** 시즌 생성 시 서버가 `409 PROFILE_REQUIRED` 로 막을 때 — 성별이 아직 설정되지 않았다. */
  profileRequired: '러빈지옥을 시작하려면 먼저 성별을 설정해야 해요',
  /** `POST /api/ai/seasons/next` 실패. 잔액 부족 등 서버 code 가 아직 정해지지 않아 하나로 묶는다. */
  nextSeasonFailed: '다음 시즌을 시작하지 못했어요. 다시 시도해주세요',
  /** EP5 이후 최종 매칭 상대가 보낸 쪽지 본문을 받지 못했을 때. */
  partnerLetterFailed: '쪽지를 펼치지 못했어요. 다시 시도해주세요',
  /** "나의 빵에게" 피드백 저장 실패. 서버 code 가 아직 정해지지 않아 하나로 묶는다. */
  feedbackFailed: '피드백을 보내지 못했어요. 다시 시도해주세요',
};
