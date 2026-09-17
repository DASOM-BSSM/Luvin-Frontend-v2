/**
 * 설문 도메인 타입.
 *
 * 화면 디자인은 Figma "Luvin-Design" / `설문-우린` (5726:2582) 이지만,
 * 문항과 배점표는 Figma 가 아니라 기획에서 받은 표가 출처다.
 */

/** 20문항이 합산해서 만드는 성향 지표 13종. */
export type SurveyTrait =
  | 'relationshipInitiative'
  | 'relationshipPace'
  | 'affectionExpression'
  | 'emotionSuppression'
  | 'attentionFrequency'
  | 'relationshipAnxiety'
  | 'reassuranceNeed'
  | 'relationshipAvoidance'
  | 'energyDependence'
  | 'emotionalSynchrony'
  | 'realityPriority'
  | 'conflictConfrontation'
  | 'jealousyReactivity';

/** 보기 식별자. 기획표의 A / B / C 와 같은 순서다. */
export type SurveyOptionId = 'a' | 'b' | 'c';

/**
 * 보기 하나가 성향 점수에 주는 증감.
 * 빠진 지표는 "변화 없음" 이라 0 을 따로 적지 않는다.
 */
export type TraitDeltas = Partial<Record<SurveyTrait, number>>;

export interface SurveyOption {
  id: SurveyOptionId;
  /** 카드에 보이는 문구. */
  label: string;
  /**
   * 기획표에 보기마다 딸려 있는 한 줄 속마음.
   * Figma 카드에는 이걸 놓을 자리가 아직 없어서 화면에는 쓰지 않는다.
   */
  hint: string;
  deltas: TraitDeltas;
}

export interface SurveyQuestion {
  /** 1부터 시작하는 문항 번호. "01 / 20", "반죽 만들기 01." 에 그대로 쓴다. */
  number: number;
  /** 이 문항이 주로 재는 지표. 배점은 options 쪽 deltas 가 가진다. */
  trait: SurveyTrait;
  title: string;
  options: SurveyOption[];
}

/** 문항 번호 → 고른 보기. 아직 답하지 않은 문항은 키 자체가 없다. */
export type SurveyAnswers = Record<number, SurveyOptionId>;

/** 지표 13종 전체 점수. 채점 결과는 항상 모든 지표를 채워서 돌려준다. */
export type TraitScores = Record<SurveyTrait, number>;
