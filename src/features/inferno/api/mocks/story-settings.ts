/**
 * [DRAFT] 배경별 무대 소개와 회차 상황 소개 목 문구. 실제로는 서버(AI)가 만든다.
 * 출연진 이름·역할은 AI 연동 전 임시 문구다. 애착 유형 이름은 쓰지 않는다.
 */
import type { SeasonSetting } from '@/src/features/inferno/types/story';

export const STAGE_TITLES: Record<SeasonSetting, { title: string; subtitle: string }> = {
  school: { title: 'In School', subtitle: '같은 반 친구들 사이에서 구워지는 내 반죽의 이야기' },
  campus: { title: 'In Campus', subtitle: '같은 과 동기들 사이에서 부풀어 오르는 내 반죽의 이야기' },
  office: { title: 'In Office', subtitle: '같은 팀 동기들 사이에서 익어가는 내 반죽의 이야기' },
  cafe: { title: 'In Cafe', subtitle: '같은 매장 근무 팀 안에서 구워지는 내 반죽의 이야기' },
};

/** 목 출연진 id(scene-cast.ts) → 배경별 역할과 행동으로만 쓴 성격 한 줄. */
export const STAGE_ROLES: Record<
  SeasonSetting,
  Record<string, { role: string; description: string }>
> = {
  school: {
    castella: { role: '같은 반 반장', description: '늘 먼저 괜찮냐고 물어보는 반장' },
    donut: { role: '창가 자리 친구', description: '말수는 적지만 은근히 챙기는 친구' },
    pretzel: { role: '옆자리 친구', description: '답장이 제일 빠른 옆자리 친구' },
    friend: { role: '내 단짝', description: '고민을 제일 잘 들어주는 내 단짝' },
    host: { role: '반 행사 담당', description: '반 행사는 꼭 이 친구가 만든다' },
  },
  campus: {
    castella: { role: '과 대표', description: '모임마다 빠진 사람을 먼저 챙긴다' },
    donut: { role: '조별과제 조원', description: '말없이 자료를 정리해 두고 간다' },
    pretzel: { role: '같은 동아리 동기', description: '단톡방에 제일 먼저 답한다' },
    friend: { role: '새내기 때부터 친구', description: '밤늦게 고민을 들어주는 친구' },
    host: { role: '동아리 회장', description: '엠티 일정은 늘 이 동기가 짠다' },
  },
  office: {
    castella: { role: '옆 팀 동기', description: '회의가 끝나면 먼저 안부를 묻는다' },
    donut: { role: '옆자리 동기', description: '바빠 보여도 필요한 자료는 챙겨 준다' },
    pretzel: { role: '같은 팀 동기', description: '메신저 답장이 가장 빠르다' },
    friend: { role: '입사 동기 친구', description: '퇴근길에 속마음을 들어준다' },
    host: { role: '동기 모임 총무', description: '회식과 워크숍은 이 동기 담당' },
  },
  cafe: {
    castella: { role: '오픈 조 매니저', description: '교대할 때마다 컨디션을 물어본다' },
    donut: { role: '마감 조 동료', description: '조용히 남은 정리를 끝내 둔다' },
    pretzel: { role: '주말 근무 동료', description: '근무 단톡에 제일 먼저 답한다' },
    friend: { role: '같이 들어온 동기', description: '쉬는 시간마다 고민을 들어준다' },
    host: { role: '근무 단톡 방장', description: '매장 행사는 꼭 이 동료가 꾸린다' },
  },
};

/** 회차 제목(8자 이내). 배경과 상관없이 공통 사건을 따른다. */
export const EPISODE_TITLES: Record<number, string> = {
  1: '첫 만남',
  2: '단톡방이 생겼다',
  3: '둘만 남은 날',
  4: '다 같이 준비',
  5: '그날의 연락',
  6: '마음을 전하는 날',
  7: '멀어진 거리',
  8: '엇갈린 마음',
  9: '다시 이야기할 때',
  10: '시즌의 끝',
};

/** 회차 상황 소개(2~3줄). 계약 8장 표의 배경별 장면을 따른다. */
export const EPISODE_SITUATIONS: Record<SeasonSetting, Record<number, string>> = {
  school: {
    1: '새 학기 반 배정 날. 낯선 얼굴들 사이에서 내 자리를 찾는다.',
    2: '반 단톡방이 생겼다. 누가 먼저 말을 꺼낼까.',
    3: '청소 당번으로 둘만 교실에 남았다.',
    4: '축제 준비가 시작됐다. 반 전체가 바빠졌다.',
    5: '몸이 안 좋아서 조퇴한 날. 누군가는 연락을 했고, 누군가는 하지 않았다.',
    6: '축제 당일. 오늘은 마음을 전해 보기로 했다.',
    7: '시험 기간이 시작됐다. 연락이 조금씩 줄어든다.',
    8: '반 행사를 두고 의견이 부딪혔다.',
    9: '체육대회 날. 다시 이야기할 기회가 생겼다.',
    10: '학기 말. 함께 보낸 시간을 돌아본다.',
  },
  campus: {
    1: '동아리 신입 환영회. 처음 보는 동기들과 인사를 나눈다.',
    2: '조별과제 단톡방이 생겼다.',
    3: '과제하다 보니 둘만 남았다.',
    4: '엠티 준비가 시작됐다.',
    5: '시험 전날. 각자 나를 대하는 방식이 달랐다.',
    6: '엠티 밤. 마음을 전해 보기로 했다.',
    7: '과제 폭탄이 쏟아졌다. 서로 얼굴 보기도 어렵다.',
    8: '조별과제 무임승차 문제로 마음이 상했다.',
    9: '종강 모임. 다시 이야기할 기회가 생겼다.',
    10: '종강. 한 학기를 돌아본다.',
  },
  office: {
    1: '입사 동기 첫 모임. 어색한 인사가 오간다.',
    2: '동기 단톡방이 생겼다.',
    3: '야근 후 퇴근길, 둘만 남았다.',
    4: '워크숍 준비가 시작됐다.',
    5: '업무 실수를 한 날. 누가 먼저 연락할까.',
    6: '워크숍 저녁. 마음을 전해 보기로 했다.',
    7: '마감 시즌이 시작됐다. 연락이 뜸해진다.',
    8: '업무 분담을 두고 갈등이 생겼다.',
    9: '프로젝트 마무리. 다시 이야기할 기회가 생겼다.',
    10: '연말. 함께한 한 해를 돌아본다.',
  },
  cafe: {
    1: '첫 출근 날. 같은 매장 팀원들과 처음 만난다.',
    2: '근무 단톡방이 생겼다.',
    3: '마감을 같이 하게 된 날, 둘만 남았다.',
    4: '시즌 행사 준비가 시작됐다.',
    5: '진상 손님을 응대하고 난 뒤. 각자 반응이 달랐다.',
    6: '행사 주말. 마음을 전해 보기로 했다.',
    7: '근무 시간이 엇갈리기 시작했다.',
    8: '대타 문제로 서로 서운해졌다.',
    9: '마감 후 야식. 다시 이야기할 기회가 생겼다.',
    10: '마지막 근무 날. 함께한 시간을 돌아본다.',
  },
};

/** 나이로 배경을 정한다. 서버가 하는 일을 흉내 낸다 — 20~23세는 시즌 시작 때 한 번 고른다. */
export function settingForAge(age: number, pick: number): SeasonSetting {
  if (age <= 19) return 'school';
  if (age <= 23) return pick < 0.5 ? 'campus' : 'cafe';
  return 'office';
}
