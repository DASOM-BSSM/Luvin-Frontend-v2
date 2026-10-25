/**
 * 첫 로그인 환영 투어의 문구. Figma 시안이 없어 기획 단계에서 정한 문구다 — 디자인이 나오면 맞출 것.
 *
 * 첫 장(인사)은 닉네임이 들어가서 `buildWelcomeTitle` 이 제목을 만들고, 나머지는 기능을 하나씩
 * 소개한 뒤 반죽 만들기(설문)로 이어진다. 반죽이 있어야 러빈지옥이 시작되기 때문이다.
 */
export const TOUR_GREETING_DESCRIPTION =
  '사랑은 타이밍이에요.\n러빈이 그 타이밍을 함께 찾아드릴게요';

/** 기능 소개 장의 그림 종류. 그림 컴포넌트는 `tour-illustration.tsx` 가 고른다. */
export type TourIllustrationKind = 'dough' | 'inferno' | 'minigame' | 'diary' | 'finish';

export interface TourFeaturePage {
  key: TourIllustrationKind;
  title: string;
  description: string;
}

export const TOUR_FEATURE_PAGES: readonly TourFeaturePage[] = [
  {
    key: 'dough',
    title: '먼저, 나만의 반죽을 만들어요',
    description: '몇 가지 질문에 답하면\n내 연애 성향이 8가지 빵 중 하나로 빚어져요',
  },
  {
    key: 'inferno',
    title: '내 분신이 대신 연애해요',
    description: '나를 닮은 AI 분신이 매주 한 편씩\n낯선 빵들과 관계를 맺어가요.\n분신의 선택을 보며 나를 알아가요',
  },
  {
    key: 'minigame',
    title: '미니게임으로 다음 이야기를 열어요',
    description: '공룡빵게임, 빵건너친구들로 토큰을 모아\n다음 에피소드를 열어요',
  },
  {
    key: 'diary',
    title: '친구들과 마음을 나눠요',
    description: '그룹을 만들어 오늘의 질문에 답하고\n서로의 생각을 나눠요',
  },
  {
    key: 'finish',
    title: '이제 반죽을 빚어볼까요?',
    description: '내 빵이 구워져야\n분신이 연애를 시작할 수 있어요',
  },
];

/** 인사 장 + 기능 소개 장. */
export const TOUR_PAGE_COUNT = 1 + TOUR_FEATURE_PAGES.length;

export const TOUR_BUTTON_LABEL = {
  next: '다음',
  skip: '건너뛰기',
  start: '나만의 반죽 만들기',
  later: '먼저 둘러볼게요',
} as const;
