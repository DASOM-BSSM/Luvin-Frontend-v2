import type { BreadType } from '@/src/assets/images/BreadCharacter';
import { jumpRopeLayout } from '@/src/constants/typography';

export const JUMP_ROPE = {
  /** 줄이 한 바퀴 도는 시간. */
  periodSec: 1.1,
  /** 줄 몇 바퀴마다 반죽 한 마리가 넘는가. 1 이면 줄이 돌 때마다 한 마리씩 넘는다. */
  gap: 1,
  height: jumpRopeLayout.jumper.jumpHeight,
  /**
   * 체공 시간 배율. 1 이면 줄 반 바퀴(0.55초) 동안 떠 있고, 0.75 면 그 1/0.75 배(약 0.73초)로
   * 천천히 뜨고 내려온다. 정점은 늘 줄이 바닥에 닿는 순간이라 줄 속도와는 따로 조절된다.
   */
  airtimeRate: 0.75,
  fadeSec: 0.5,
  /** 동시에 보일 수 있는 반죽 수. 한 마리가 머무는 4.5 바퀴 동안 한 바퀴마다 하나씩 온다. */
  slotCount: 5,
  /** 첫 반죽이 정점을 찍는 바퀴. 시작하자마자 두 마리가 줄 서 있도록 앞당겨 둔다. */
  firstPeakCycle: 2,
} as const;

/**
 * 반죽 한 마리의 동선. 값은 정점(줄이 바닥에 닿는 순간)을 0 으로 둔 바퀴 단위 시각 u.
 *
 * 뒷자리에 나타남 → 앞자리로 당김 → 줄 밑으로 달려 들어감 → 가운데서 넘음 → 빠져나가며 사라짐.
 * 반죽이 gap(1) 바퀴마다 하나씩 오므로, 앞 반죽이 떠나는 순간 뒤 반죽이 그 자리로 당겨진다.
 * 줄 서서 기다리는 시간은 자리마다 한 바퀴씩, 모두 두 바퀴(약 2.2초)다.
 */
export const JUMPER_PHASE = {
  appear: -3,
  fadeInEnd: -2.75,
  // 앞 반죽이 달려 나가는 순간(run) 뒤 반죽이 앞자리로 당겨지도록 run 과 한 바퀴 차이를 둔다.
  moveForward: -2.1,
  moveForwardEnd: -1.85,
  // 앞자리에서 줄 밑까지 달려 들어가는 시간 0.6 바퀴(약 0.66초).
  run: -1.1,
  jump: -0.5,
  land: 0.5,
  gone: 1.5,
} as const;

/** 쪽지 위쪽 문구가 바뀌는 간격. */
export const JUMP_ROPE_MESSAGE_INTERVAL_MS = 5_000;

/** 문구 전환. 이전 문구가 먼저 사라지기 시작하고, 새 문구가 살짝 아래에서 떠오르며 나타난다. */
export const JUMP_ROPE_MESSAGE_TRANSITION = {
  exitMs: 250,
  enterDelayMs: 150,
  enterMs: 450,
  riseDistance: 6,
} as const;

/**
 * 쪽지 위쪽 문구. 자리는 시안(7219:3695) 그대로이고, 문구는 사용자가 준 목록이다.
 * 섞어서 하나씩 보여 주며, 목록을 다 돌기 전에는 같은 문구가 다시 나오지 않는다.
 */
export const JUMP_ROPE_MESSAGES = [
  '붕어빵에는 붕어가 없어요. 놀라지 마세요.',
  '슈크림빵은 안에 팥이 들어가지 않아요!',
  '카스테라는 전기밥솥에 구울 수 있어요.',
  '소금빵 반죽은 버터를 품고 있다는 걸 아시나요?',
  '소금빵을 먹으면 짭짤해요. 당연한 얘기예요.',
  '바게트로 칼싸움은 하지 마세요. 부러져요.',
  '식빵은 먹는 빵이에요. 안 먹는 빵은 없어요.',
  '반죽은 지금 부풀고 있어요. 서버는 안 부풀어요.',
  '대화가 생성되는 동안 줄넘기를 감상하세요~!',
  'AI가 대사를 쓰는 중이에요. 오타가 나면 AI 탓이에요.',
  '이 문구를 읽는 사이에도 1초는 지났어요.',
  '로딩이 길어지는 건 당신 잘못이 아니에요.',
  '소금빵 속엔 버터가 숨어 있어요. 말은 안 하지만요.',
  '소금빵 속 버터는 조용히 녹는 중이에요.',
  '회피형 AI가 답장을 미루는 중이에요.',
  '불안형 AI가 보낸 대사를 세 번째 확인하고 있어요.',
  '안정형 AI는 느긋해요. 그래서 좀 걸려요.',
  '분신이 상대 앞에서 손톱을 만지작거리고 있어요.',
  '빵도 사랑도 너무 일찍 꺼내면 설익어요.',
  '로딩도 타이밍이에요. 조금만 더 기다려주세요.',
  '허리를 펴세요. 방금 굽어 있었죠?',
  '물 한 잔 마시고 오세요. 아직 안 끝났어요.',
  '눈을 세 번 깜빡이면 로딩이 끝나요. (+ 아니에요)',
] as const;

/** 넘는 반죽은 이 중에서 무작위로 나온다. */
export const JUMP_BREAD_TYPES = [
  'salt',
  'castella',
  'madeleine',
  'redbean',
  'baguette',
  'cream',
  'donut',
  'pretzel',
] as const satisfies readonly BreadType[];
