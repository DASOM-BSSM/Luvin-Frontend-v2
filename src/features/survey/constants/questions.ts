import type { SurveyQuestion } from '@/src/features/survey/types';

/**
 * 설문 문항과 배점표. 출처는 기획에서 받은 20문항 표다(Figma 아님).
 *
 * 규칙 두 가지만 지키면 된다.
 * - `number` 는 배열 순서와 같고 1부터 시작한다.
 * - `deltas` 에 없는 지표는 "변화 없음" 이다. 0 을 적지 않는다.
 */
export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    number: 1,
    trait: 'relationshipInitiative',
    title: '좋아하는 사람이랑 가까워지고 싶을 때 나는?',
    options: [
      {
        id: 'a',
        label: '같이 할 수 있는 걸로 자리를 만든다',
        hint: '기회는 내가 만드는 거지',
        deltas: { relationshipInitiative: 20, relationshipPace: 10 },
      },
      {
        id: 'b',
        label: '자연스럽게 천천히 가까워진다',
        hint: '억지로 자리를 만드는것 보다 자연스러운게 좋아',
        deltas: { relationshipPace: 5 },
      },
      {
        id: 'c',
        label: '상대가 먼저 다가와주길 기다린다',
        hint: '절대 내가 먼저 못 가',
        deltas: { relationshipInitiative: -20, relationshipPace: -10 },
      },
    ],
  },
  {
    number: 2,
    trait: 'affectionExpression',
    title: '사귀기 전, 좋아하는 감정을 상대가 눈치챘으면 할 때 나는?',
    options: [
      {
        id: 'a',
        label: '직접 말하거나 확실하게 티를 낸다',
        hint: '돌려 말하다 타이밍 놓치는 거 싫어',
        deltas: { affectionExpression: 20, emotionSuppression: -10, attentionFrequency: 10 },
      },
      {
        id: 'b',
        label: '작은 행동으로 알아채주길 바란다',
        hint: '눈치 있으면 알겠지',
        deltas: { affectionExpression: 10, attentionFrequency: 5 },
      },
      {
        id: 'c',
        label: '들키지 않으려고 최대한 숨긴다',
        hint: '알게 되면 어색해질 것 같아서',
        deltas: { affectionExpression: -20, emotionSuppression: 10, attentionFrequency: -10 },
      },
    ],
  },
  {
    number: 3,
    trait: 'relationshipAnxiety',
    title: '답장이 평소보다 늦게 왔을 때 나는?',
    options: [
      {
        id: 'a',
        label: '별로 신경 안 쓴다, 바쁘겠지',
        hint: '기다리는 게 딱히 힘들지 않아',
        deltas: { relationshipAnxiety: -20, reassuranceNeed: -10 },
      },
      {
        id: 'b',
        label: '살짝 신경 쓰이지만 참는다',
        hint: '신경 쓰이는데 티는 안 내려고',
        deltas: { relationshipAnxiety: 3 },
      },
      {
        id: 'c',
        label: '이유가 뭔지 여러 가지 생각이 든다',
        hint: '그 1시간이 왜 이렇게 길게 느껴지냐',
        deltas: { relationshipAnxiety: 20, reassuranceNeed: 10 },
      },
    ],
  },
  {
    number: 4,
    trait: 'relationshipAvoidance',
    title: '상대가 나한테 많이 의지하기 시작하면?',
    options: [
      {
        id: 'a',
        label: '가까워지는 것 같아서 좋다',
        hint: '믿어준다는 게 느껴지잖아',
        deltas: { relationshipAvoidance: -20, energyDependence: 10 },
      },
      {
        id: 'b',
        label: '좋긴 한데 가끔 벅차다',
        hint: '좋은데 나도 숨 좀 쉬어야지',
        deltas: {},
      },
      {
        id: 'c',
        label: '조금 부담스럽고 거리를 두고 싶어진다',
        hint: '가까워지는 게 설레기도 하고 무섭기도 하고',
        deltas: { relationshipAvoidance: 20, energyDependence: -10 },
      },
    ],
  },
  {
    number: 5,
    trait: 'emotionalSynchrony',
    title: '같이 있는 사람이 기분이 안 좋으면 나는?',
    options: [
      {
        id: 'a',
        label: '나도 같이 가라앉는다',
        hint: '옆 사람 기분이 곧 내 기분인 사람 있잖아',
        deltas: { emotionalSynchrony: 20 },
      },
      {
        id: 'b',
        label: '신경은 쓰이지만 내 기분은 유지한다',
        hint: '네 기분은 이해하는데 나까지 가라앉긴 싫어',
        deltas: { emotionalSynchrony: 10 },
      },
      {
        id: 'c',
        label: '내 기분은 따로 유지할 수 있다',
        hint: '네 기분은 네 거, 내 기분은 내 거',
        deltas: { emotionalSynchrony: -20 },
      },
    ],
  },
  {
    number: 6,
    trait: 'realityPriority',
    title: '사귀는 사람이랑 갈등이 생겼을 때 나는?',
    options: [
      {
        id: 'a',
        label: '바로 얘기해서 빨리 해결하고 싶다',
        hint: '풀릴 때까지 기다리다 더 꼬이는 경우 있음',
        deltas: { realityPriority: 20, conflictConfrontation: 10 },
      },
      {
        id: 'b',
        label: '감정 좀 식으면 그때 차분하게 얘기한다',
        hint: '흥분한 상태에서 말하면 더 커지더라',
        deltas: { realityPriority: 10 },
      },
      {
        id: 'c',
        label: '분위기가 자연스럽게 풀릴 때까지 기다린다',
        hint: '말했다가 더 커질 것 같아서',
        deltas: { realityPriority: -20, conflictConfrontation: -10 },
      },
    ],
  },
  {
    number: 7,
    trait: 'relationshipInitiative',
    title: '연락 패턴은?',
    options: [
      {
        id: 'a',
        label: '내가 먼저 연락하는 편이다',
        hint: '먼저 연락하는 사람이 더 좋아하는 거 맞지?',
        deltas: { relationshipInitiative: 20, attentionFrequency: 20 },
      },
      {
        id: 'b',
        label: '서로 비슷하게 주고받는 편이다',
        hint: '밸런스가 맞아야 편하지',
        deltas: { attentionFrequency: 10 },
      },
      {
        id: 'c',
        label: '오면 잘 받지만 먼저 하진 않는다',
        hint: '연락 안 한다고 관심 없는 거 아니야',
        deltas: { relationshipInitiative: -20, attentionFrequency: -10 },
      },
    ],
  },
  {
    number: 8,
    trait: 'affectionExpression',
    title: '상대가 힘들어 보일 때 나는?',
    options: [
      {
        id: 'a',
        label: '먼저 말 걸고 바로 표현한다',
        hint: '모른 척하는 게 더 어려워',
        deltas: { affectionExpression: 20, emotionSuppression: -10, attentionFrequency: 10 },
      },
      {
        id: 'b',
        label: '티는 안 내지만 옆에서 더 잘 챙긴다',
        hint: '말은 못 해도 행동으로 보여줄 수 있잖아',
        deltas: { affectionExpression: 10 },
      },
      {
        id: 'c',
        label: '상대가 먼저 꺼내길 기다린다',
        hint: '괜히 먼저 물어봤다가 부담줄 것 같아서',
        deltas: { affectionExpression: -20, emotionSuppression: 10, attentionFrequency: -10 },
      },
    ],
  },
  {
    number: 9,
    trait: 'relationshipAnxiety',
    title: '상대가 다른 이성이랑 친하게 지내는 걸 알게 됐을 때?',
    options: [
      {
        id: 'a',
        label: '별로 개의치 않는다',
        hint: '믿으면 되는 거지',
        deltas: { relationshipAnxiety: -20, jealousyReactivity: -20 },
      },
      {
        id: 'b',
        label: '살짝 신경 쓰이지만 믿으려고 한다',
        hint: '믿고 싶은데 자꾸 생각나',
        deltas: {},
      },
      {
        id: 'c',
        label: '신경 쓰이고 괜히 예민해진다',
        hint: '아무렇지 않은 척하는데 사실 엄청 신경 쓰임',
        deltas: { relationshipAnxiety: 20, jealousyReactivity: 20 },
      },
    ],
  },
  {
    number: 10,
    trait: 'relationshipAvoidance',
    title: '연애할 때 나는?',
    options: [
      {
        id: 'a',
        label: '일상을 많이 공유하고 같이 있는 시간이 많았으면 좋다',
        hint: '같이 있는 시간이 쌓이는 게 좋아',
        deltas: { relationshipAvoidance: -20, energyDependence: 10 },
      },
      {
        id: 'b',
        label: '같이 있는 시간도 좋고 혼자 시간도 필요하다',
        hint: '둘 다 있어야 균형이 맞지',
        deltas: {},
      },
      {
        id: 'c',
        label: '각자 시간이 충분히 있어야 편하다',
        hint: '붙어만 있으면 나 숨막혀',
        deltas: { relationshipAvoidance: 20, energyDependence: -10 },
      },
    ],
  },
  {
    number: 11,
    trait: 'emotionalSynchrony',
    title: '분위기가 어색한 자리에 가면 나는?',
    options: [
      {
        id: 'a',
        label: '내가 분위기를 바꿔보려고 한다',
        hint: '어색한 거 그냥 넘어가면 되지',
        deltas: { emotionalSynchrony: -20 },
      },
      {
        id: 'b',
        label: '어색하지만 적당히 맞춰간다',
        hint: '분위기 파악하면서 끼어드는 편',
        deltas: {},
      },
      {
        id: 'c',
        label: '분위기에 맞게 나도 어색해진다',
        hint: '어색함을 내가 왜 이렇게 못 견디냐',
        deltas: { emotionalSynchrony: 20 },
      },
    ],
  },
  {
    number: 12,
    trait: 'realityPriority',
    title: '썸 탈 때 밀당에 대해서?',
    options: [
      {
        id: 'a',
        label: '솔직하게 표현하는 게 맞다고 생각한다',
        hint: '밀당인지 관심 없는 건지 어떻게 알아',
        deltas: { realityPriority: 20 },
      },
      {
        id: 'b',
        label: '적당한 밀당은 자연스러운 과정이다',
        hint: '너무 쉽게 잡히면 설렘이 없잖아',
        deltas: {},
      },
      {
        id: 'c',
        label: '밀당을 즐기는 편이다',
        hint: '당기고 밀고 하는 게 오히려 재미있어',
        deltas: { realityPriority: -20 },
      },
    ],
  },
  {
    number: 13,
    trait: 'reassuranceNeed',
    title: '사귀자는 말 없이 썸만 계속 이어지면?',
    options: [
      {
        id: 'a',
        label: '자연스럽게 흘러가면 된다고 생각한다',
        hint: '굳이 확인 안 해도 느낌으로 알잖아',
        deltas: { reassuranceNeed: -20 },
      },
      {
        id: 'b',
        label: '슬슬 확인하고 싶어진다',
        hint: '이게 뭔지는 알아야 할 것 같아',
        deltas: {},
      },
      {
        id: 'c',
        label: '빨리 관계를 정의하고 싶다',
        hint: '썸인지 사귀는 건지 모르면 불편해',
        deltas: { reassuranceNeed: 20 },
      },
    ],
  },
  {
    number: 14,
    trait: 'jealousyReactivity',
    title: '좋아하는 사람이 나 말고 다른 사람한테 잘해주는 걸 봤을 때?',
    options: [
      {
        id: 'a',
        label: '별로 신경 안 쓰인다',
        hint: '다들 친한 거겠지',
        deltas: { jealousyReactivity: -20 },
      },
      {
        id: 'b',
        label: '마음이 살짝 불편하지만 티는 안 낸다',
        hint: '티 내면 쪼잔해 보일 것 같아서',
        deltas: { emotionSuppression: 10 },
      },
      {
        id: 'c',
        label: '모르게 신경 쓰이고 태도가 바뀐다',
        hint: '나도 모르게 말수가 줄어들더라',
        deltas: { jealousyReactivity: 20, relationshipAnxiety: 10 },
      },
    ],
  },
  {
    number: 15,
    trait: 'energyDependence',
    title: '연애할 때 상대에게 기대는 편인가요?',
    options: [
      {
        id: 'a',
        label: '독립적으로 각자 에너지를 채우는 편이다',
        hint: '상대한테 기대는 게 불편해',
        deltas: { energyDependence: -20 },
      },
      {
        id: 'b',
        label: '가끔은 기대고 가끔은 혼자 해결한다',
        hint: '상황에 따라 다른 것 같아',
        deltas: {},
      },
      {
        id: 'c',
        label: '상대가 있어야 힘이 나는 편이다',
        hint: '같이 있으면 에너지가 충전되는 느낌',
        deltas: { energyDependence: 20 },
      },
    ],
  },
  {
    number: 16,
    trait: 'emotionSuppression',
    title: '화가 났을 때 나는?',
    options: [
      {
        id: 'a',
        label: '바로 표현한다, 쌓아두는 게 더 싫다',
        hint: '참다가 한 번에 터지면 더 힘들잖아',
        deltas: { emotionSuppression: -20, affectionExpression: 10, conflictConfrontation: 10 },
      },
      {
        id: 'b',
        label: '어느 정도 참다가 적당한 타이밍에 말한다',
        hint: '바로 말하면 감정적으로 보일 것 같아서',
        deltas: {},
      },
      {
        id: 'c',
        label: '최대한 감추고 혼자 삭힌다',
        hint: '말해봤자 달라지는 게 없을 것 같아',
        deltas: { emotionSuppression: 20, affectionExpression: -10, conflictConfrontation: -10 },
      },
    ],
  },
  {
    number: 17,
    trait: 'conflictConfrontation',
    title: '상대방이 나를 서운하게 했을 때?',
    options: [
      {
        id: 'a',
        label: '바로 얘기한다, 모르면 바뀌지 않으니까',
        hint: '말 안 하면 평생 몰라',
        deltas: { conflictConfrontation: 20, realityPriority: 10 },
      },
      {
        id: 'b',
        label: '한 번은 참고 두 번째면 말한다',
        hint: '한 번은 그럴 수도 있다고 생각해',
        deltas: {},
      },
      {
        id: 'c',
        label: '최대한 넘어가려고 한다',
        hint: '괜히 얘기했다가 사이 어색해질 것 같아',
        deltas: { conflictConfrontation: -20, emotionSuppression: 10 },
      },
    ],
  },
  {
    number: 18,
    trait: 'relationshipPace',
    title: '처음 만난 사람과 친해지는 속도는?',
    options: [
      {
        id: 'a',
        label: '빠른 편이다, 금방 편해진다',
        hint: '처음부터 편하게 대하는 게 좋아',
        deltas: { relationshipPace: 20, relationshipInitiative: 10, relationshipAvoidance: -10 },
      },
      {
        id: 'b',
        label: '보통이다, 몇 번 만나다 보면 편해진다',
        hint: '자연스럽게 쌓이는 게 맞지',
        deltas: {},
      },
      {
        id: 'c',
        label: '느린 편이다, 마음 열기까지 시간이 걸린다',
        hint: '쉽게 열었다가 상처받는 게 싫어',
        deltas: { relationshipPace: -20, relationshipInitiative: -10, relationshipAvoidance: 10 },
      },
    ],
  },
  {
    number: 19,
    trait: 'attentionFrequency',
    title: '좋아하는 사람한테 연락하는 편은?',
    options: [
      {
        id: 'a',
        label: '생각날 때마다 자주 한다',
        hint: '생각났다고 바로 연락하면 안 돼?',
        deltas: { attentionFrequency: 20, affectionExpression: 10, relationshipInitiative: 10 },
      },
      {
        id: 'b',
        label: '하루에 한두 번 적당하게 한다',
        hint: '너무 자주도 너무 없어도 부담이잖아',
        deltas: {},
      },
      {
        id: 'c',
        label: '연락은 잘 안 하지만 만나면 잘 챙긴다',
        hint: '연락 횟수가 마음의 크기는 아니잖아',
        deltas: { attentionFrequency: -20, affectionExpression: -10, relationshipInitiative: -10 },
      },
    ],
  },
  {
    number: 20,
    trait: 'energyDependence',
    title: '혼자 있는 시간 vs 같이 있는 시간, 어느 쪽이 더 충전이 돼요?',
    options: [
      {
        id: 'a',
        label: '혼자 있을 때 훨씬 충전된다',
        hint: '혼자 있어야 진짜 쉬는 느낌',
        deltas: { energyDependence: -20, relationshipAvoidance: 10 },
      },
      {
        id: 'b',
        label: '둘 다 필요하다, 상황마다 다르다',
        hint: '때로는 같이, 때로는 혼자',
        deltas: {},
      },
      {
        id: 'c',
        label: '좋아하는 사람이랑 있을 때 충전된다',
        hint: '같이 있으면 피곤해도 괜찮아',
        deltas: { energyDependence: 20, relationshipAvoidance: -10 },
      },
    ],
  },
];

/** 화면의 "01 / 20" 에서 분모로 쓴다. 문항을 늘리면 자동으로 따라간다. */
export const SURVEY_TOTAL_QUESTIONS = SURVEY_QUESTIONS.length;
