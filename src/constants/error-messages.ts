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
  /** 그룹 참여 — 초대코드가 틀렸을 때(서버 404). */
  invalidInviteCode: '초대코드가 올바르지 않아요. 다시 확인해주세요',
  /** 그룹 참여 — 최대 인원이 다 찼을 때(서버 409 `DIARY_ROOM_FULL`). */
  diaryRoomFull: '그룹 인원이 가득 찼어요',
  /** 그룹 참여 — 같은 그룹에 같은 닉네임이 있을 때(서버 409 `DIARY_ROOM_NICKNAME_DUPLICATED`). */
  diaryRoomNicknameDuplicated: '그룹에 같은 닉네임이 있어요. 다른 닉네임을 적어주세요',
  /** 그룹 참여 실패 — 위 경우가 아닌 나머지. */
  joinRoomFailed: '그룹에 참여하지 못했어요. 다시 시도해 주세요',
  /** 그룹 질문 만들기 실패(요청 실패 · 서버가 `failed` 를 준 경우 모두). */
  createQuestionFailed: '질문을 만들지 못했어요. 다시 시도해 주세요',
  /** 그룹 질문 답 — 1~200자가 아닐 때(서버 400 `ROOM_ANSWER_INVALID`). */
  roomAnswerInvalid: '답은 1~200자로 적어 주세요',
  /** 그룹 질문 답 — 아직 질문이 준비되지 않았을 때(서버 409 `ROOM_QUESTION_NOT_READY`). */
  roomQuestionNotReady: '질문이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요',
  /** 그룹 질문 답 저장 실패 — 위 경우가 아닌 나머지. */
  answerQuestionFailed: '답을 남기지 못했어요. 다시 시도해 주세요',
  /** 그룹 질문 내 답 삭제 실패. */
  deleteAnswerFailed: '답을 지우지 못했어요. 다시 시도해 주세요',
  /** 일기 수정 실패. */
  updateDiaryFailed: '일기를 고치지 못했어요. 다시 시도해 주세요',
  /** 일기 삭제 실패. */
  deleteDiaryFailed: '일기를 지우지 못했어요. 다시 시도해 주세요',
};
