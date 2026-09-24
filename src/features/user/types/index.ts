/** openapi `UserProfileResponse` — `GET /api/users/me`. */
export interface UserProfile {
  memberId: number;
  name: string;
  nickname: string;
  gender: string;
  age: number;
  job: string;
  bio: string;
  /** "내 성향"/분석 결과와 연결될 자리 — 아직 어떤 값이 오는지 확인되지 않았다. */
  personalityType: string;
  surveyCompleted: boolean;
}

/** openapi `UserProfileUpdateRequest` — `PUT /api/users/me`. gender 는 이 요청에 없다. */
export interface UpdateUserProfileInput {
  nickname?: string;
  job?: string;
  bio?: string;
}
