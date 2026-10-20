import { jumpRopeLayout } from '@/src/constants/typography';
import { JUMP_ROPE, JUMPER_PHASE } from '@/src/features/inferno/constants/jump-rope';
import { getJumpPeakSec } from '@/src/features/inferno/utils/jump-rope-timing';

interface RopePose {
  /** 줄 곡선(3차 베지어). 쪽지 좌표. */
  path: string;
  /** 양 끝 분홍 손잡이 두 개. 각각 줄 끝에서 줄의 접선 반대 방향으로 뻗는다. */
  handles: string;
  angleDeg: number;
  front: boolean;
}

interface JumpPose {
  x: number;
  y: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
  rotationDeg: number;
}

function lerp(from: number, to: number, ratio: number): number {
  'worklet';
  return from + (to - from) * ratio;
}

function clamp01(value: number): number {
  'worklet';
  return Math.max(0, Math.min(1, value));
}

/** 끝점 (x, y)에서 접선 (tx, ty) 의 반대쪽으로 손잡이 길이만큼 뻗은 선분. */
function handleSegment(x: number, y: number, tx: number, ty: number): string {
  'worklet';
  const length = Math.hypot(tx, ty) || 1;
  const reach = jumpRopeLayout.rope.handleLength;
  const hx = x - (tx / length) * reach;
  const hy = y - (ty / length) * reach;
  return `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
}

/**
 * 줄 모양. cos θ = 1 이면 가운데가 바닥 바로 위까지 내려오고, -1 이면 시안처럼 머리 위로 올라간다.
 * 3차 베지어의 두 제어점을 같은 높이에 두면 가운데가 제어점 높이의 3/4 만큼 움직인다.
 */
export function getRopePose(elapsedSec: number): RopePose {
  'worklet';
  const theta = 2 * Math.PI * ((elapsedSec / JUMP_ROPE.periodSec) % 1);
  const sine = Math.sin(theta);
  const cosine = Math.cos(theta);
  const rope = jumpRopeLayout.rope;
  const endY = rope.endY + rope.handRadius * cosine;
  const sag = cosine > 0 ? rope.downHeight * cosine : rope.upHeight * cosine;
  const controlY = endY + (4 / 3) * sag;
  const reach = (rope.endX - rope.startX) * 0.25;
  const c1x = rope.startX + reach;
  const c2x = rope.endX - reach;
  const path =
    `M ${rope.startX} ${endY.toFixed(1)} C ${c1x} ${controlY.toFixed(1)} ` +
    `${c2x} ${controlY.toFixed(1)} ${rope.endX} ${endY.toFixed(1)}`;
  const handles =
    handleSegment(rope.startX, endY, c1x - rope.startX, controlY - endY) +
    ' ' +
    handleSegment(rope.endX, endY, c2x - rope.endX, controlY - endY);
  return { path, handles, angleDeg: 2 * sine, front: sine < 0 };
}

/** 도약 직전 웅크림과 착지 직후 찌그러짐. 체공 구간(±0.25/airtimeRate 바퀴) 바로 바깥에 둔다. */
function getSquash(u: number): number {
  'worklet';
  const edge = 0.25 / JUMP_ROPE.airtimeRate + 0.05;
  return (
    0.14 * Math.exp(-Math.pow((u - edge) / 0.06, 2)) +
    0.1 * Math.exp(-Math.pow((u + edge) / 0.06, 2))
  );
}

/**
 * jumpIndex 번째 반죽의 자세. 동선은 JUMPER_PHASE 순서를 따른다.
 * 줄 서 있거나 달리는 동안은 줄 박자에 맞춰 통통 뛰고, 가운데서는 줄이 바닥에 닿을 때 정점을 찍는다.
 */
export function getJumpPose(elapsedSec: number, jumpIndex: number): JumpPose {
  'worklet';
  const u = (elapsedSec - getJumpPeakSec(jumpIndex)) / JUMP_ROPE.periodSec;
  const layout = jumpRopeLayout.jumper;
  const phase = JUMPER_PHASE;
  const hop = layout.hopHeight * Math.abs(Math.sin(2 * Math.PI * u));
  const pose: JumpPose = {
    x: layout.queueBackX,
    y: hop,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    rotationDeg: 0,
  };

  if (u < phase.appear || u >= phase.gone) {
    pose.opacity = 0;
  } else if (u < phase.moveForward) {
    pose.opacity = clamp01((u - phase.appear) / (phase.fadeInEnd - phase.appear));
  } else if (u < phase.moveForwardEnd) {
    const ratio = (u - phase.moveForward) / (phase.moveForwardEnd - phase.moveForward);
    pose.x = lerp(layout.queueBackX, layout.queueFrontX, ratio);
  } else if (u < phase.run) {
    pose.x = layout.queueFrontX;
  } else if (u < phase.jump) {
    pose.x = lerp(layout.queueFrontX, layout.jumpStartX, (u - phase.run) / (phase.jump - phase.run));
  } else if (u <= phase.land) {
    pose.x = lerp(layout.jumpStartX, layout.jumpEndX, (u - phase.jump) / (phase.land - phase.jump));
    const airPhase = 2 * Math.PI * u * JUMP_ROPE.airtimeRate;
    pose.y = JUMP_ROPE.height * Math.max(0, Math.cos(airPhase));
    const squash = getSquash(u);
    pose.scaleX = 1 + 0.6 * squash;
    pose.scaleY = 1 - squash;
    pose.rotationDeg = pose.y > 0 ? -9 * Math.sin(airPhase) : 0;
  } else {
    const ratio = (u - phase.land) / (phase.gone - phase.land);
    pose.x = lerp(layout.jumpEndX, layout.exitX, ratio);
    pose.opacity = Math.max(0, 1 - 1.1 * ratio);
    pose.scaleX = 1 - 0.18 * ratio;
    pose.scaleY = pose.scaleX;
  }
  return pose;
}
