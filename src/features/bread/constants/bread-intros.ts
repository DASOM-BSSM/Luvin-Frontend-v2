import type { BreadIntro } from '@/src/features/bread/types';

/**
 * 빵 8종 소개 문구. 서버에 유형별 설명 API 가 없어 앱에 둔다.
 *
 * 근거: 백엔드 `luvin-survey-change-plan/reference/SURVEY_AND_CLASSIFICATION.md` §5 의
 * 유형별 대표 지표(높음/낮음). 문구는 그 지표를 말로 옮긴 초안이며 기획 확정본이 아니다.
 * 같은 문서 §5·§7 에 따라 궁합, 영구적인 성격 단정, 애착 진단은 넣지 않는다 —
 * 단정 대신 경향으로만 쓴다.
 *
 * 순서는 서버 canonical 유형 목록(`BreadCanonicalType`) 순서와 같다.
 */
export const BREAD_INTROS: BreadIntro[] = [
  {
    type: 'cream',
    name: '크림빵',
    summary: '속마음을 감춰도 가까워지고 싶은 빵',
    traits: [
      '상대의 마음을 자주 확인하고 싶어요',
      '서운해도 겉으로는 잘 티 내지 않아요',
      '상대의 기분에 쉽게 물들어요',
    ],
  },
  {
    type: 'redbean',
    name: '팥빵',
    summary: '말보다 행동으로 챙겨 주는 든든한 빵',
    traits: [
      '말보다 행동으로 마음을 전해요',
      '익숙해진 관계도 오래 아끼고 싶어요',
      '연락이 뜸해도 크게 불안하지 않아요',
    ],
  },
  {
    type: 'salt',
    name: '소금빵',
    summary: '담백해 보여도 은근히 신경 쓰는 빵',
    traits: [
      '좋아하는 마음을 말로 잘 안 꺼내요',
      '천천히 가까워지는 게 편해요',
      '무심한 척해도 질투가 은근히 많아요',
    ],
  },
  {
    type: 'pretzel',
    name: '프레첼',
    summary: '마음과 다르게 말이 꼬여 나오는 빵',
    traits: [
      '좋아도 괜히 반대로 말할 때가 있어요',
      '먼저 다가가는 게 조금 자존심 상해요',
      '속마음은 꾹 눌러 두는 편이에요',
    ],
  },
  {
    type: 'donut',
    name: '도넛',
    summary: '사람들 사이에서 반짝이는 달콤한 빵',
    traits: [
      '처음 보는 사람과도 쉽게 어울려요',
      '관심과 애정을 자주, 듬뿍 표현해요',
      '함께하는 시간에서 힘을 얻어요',
    ],
  },
  {
    type: 'baguette',
    name: '바게트',
    summary: '겉은 단단해도 천천히 마음을 여는 빵',
    traits: [
      '내 공간과 시간이 소중해요',
      '관계는 천천히 쌓아 가는 게 편해요',
      '속이야기를 꺼내기까지 오래 걸려요',
    ],
  },
  {
    type: 'madeleine',
    name: '마들렌',
    summary: '관계도 반듯하고 또렷한 게 좋은 빵',
    traits: [
      '설렘만큼 현실도 함께 생각해요',
      '문제가 생기면 피하지 않고 이야기해요',
      '우리가 어떤 사이인지 분명한 게 좋아요',
    ],
  },
  {
    type: 'castella',
    name: '카스테라',
    summary: '폭신하게 상대에게 맞춰 주는 빵',
    traits: [
      '상대의 감정을 내 일처럼 느껴요',
      '내키지 않아도 거절하기 어려워요',
      '부딪히기보다 한발 물러서요',
    ],
  },
];
