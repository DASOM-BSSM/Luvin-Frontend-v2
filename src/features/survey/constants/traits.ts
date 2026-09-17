import type { SurveyTrait } from '@/src/features/survey/types';

/**
 * 지표의 한글 이름. 코드 쪽 키는 영문이고 기획표는 한글이라, 대조하려면 이 표가 기준이다.
 * Record<SurveyTrait, string> 이라서 지표를 추가하면 여기서 타입 에러로 먼저 걸린다.
 */
export const SURVEY_TRAIT_LABEL: Record<SurveyTrait, string> = {
  relationshipInitiative: '관계 주도성',
  relationshipPace: '관계 속도감',
  affectionExpression: '애정 표현성',
  emotionSuppression: '감정 억제성',
  attentionFrequency: '관심 표현 빈도',
  relationshipAnxiety: '관계 불안도',
  reassuranceNeed: '확신 요구도',
  relationshipAvoidance: '관계 회피성',
  energyDependence: '관계 에너지 의존도',
  emotionalSynchrony: '감정 동조성',
  realityPriority: '현실 우선성',
  conflictConfrontation: '갈등 직면성',
  jealousyReactivity: '질투 반응성',
};

/** 위 표에서 파생시켜서 지표가 빠질 수 없게 한다. */
export const SURVEY_TRAITS = Object.keys(SURVEY_TRAIT_LABEL) as SurveyTrait[];
