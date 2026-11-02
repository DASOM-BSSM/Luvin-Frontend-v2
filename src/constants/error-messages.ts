/**
 * 사용자에게 보여줄 에러 문구(AGENTS.md §11). 서버 message 를 그대로 보여주지 않고,
 * 서버가 주는 `code` 를 여기 문구로 바꿔 보여준다.
 */
export const ERROR_MESSAGES = {
  /** 시즌 생성 시 서버가 `409 PROFILE_REQUIRED` 로 막을 때 — 성별이 아직 설정되지 않았다. */
  profileRequired: '러빈지옥을 시작하려면 먼저 성별을 설정해야 해요',
  /** EP5 이후 최종 매칭 상대가 보낸 쪽지 본문을 받지 못했을 때. */
  partnerLetterFailed: '쪽지를 펼치지 못했어요. 다시 시도해주세요',
  /** "나의 빵에게" 피드백 저장 실패. 서버 code 가 아직 정해지지 않아 하나로 묶는다. */
  feedbackFailed: '피드백을 보내지 못했어요. 다시 시도해주세요',
  /** [DRAFT] 러빈지옥 새 10화(보정 문서 3~5장). 서버 code → 문구. */
  episodeLoadFailed: '이야기를 불러오지 못했어요. 다시 시도해주세요',
  episodeGenerating: '이야기를 굽고 있어요. 잠시만 기다려주세요',
  episodeGenerationTimeout: '이야기를 굽는 데 시간이 오래 걸리고 있어요. 다시 시도해주세요',
  storyNotStarted: '1화부터 시작해주세요',
  previousEpisodeRequired: '이전 회차를 먼저 끝내주세요',
  episodeNotReleased: '아직 공개되지 않은 회차예요',
  seasonCompleted: '이번 시즌은 끝났어요. 최종 리포트와 지난 회차만 볼 수 있어요',
  choiceFailed: '선택을 전하지 못했어요. 다시 시도해주세요',
  completeFailed: '회차를 마치지 못했어요. 다시 시도해주세요',
  ageRequired: '나이와 성별을 알려주면 이야기의 무대가 정해져요',
  reportLoadFailed: '최종 리포트를 불러오지 못했어요. 다시 시도해주세요',
  insufficientTokens: '토큰이 부족해요',
  unlockFailed: '회차를 열지 못했어요. 다시 시도해주세요',
  ageSaveFailed: '나이와 성별을 저장하지 못했어요. 다시 시도해주세요',
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
  /** 일기 모아보기 달력 조회 실패 — 문구를 누르면 다시 불러온다. */
  diaryCalendarFailed: '일기를 쓴 날을 불러오지 못했어요. 눌러서 다시 시도',
  /** 오늘의 밸런스 게임 조회 실패 — 문구를 누르면 다시 불러온다. */
  balanceGameFailed: '오늘의 질문을 불러오지 못했어요. 다시 시도',
  /** 밸런스 게임 — 이미 고른 질문일 때(서버 409 `DAILY_QUESTION_ALREADY_ANSWERED`). 답은 바꿀 수 없다. */
  balanceGameAlreadyAnswered: '이미 고른 질문이에요',
  /** 밸런스 게임 고르기 실패 — 위 경우가 아닌 나머지. */
  answerBalanceGameFailed: '답을 보내지 못했어요. 다시 눌러 주세요',
};
