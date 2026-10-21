import type { AiReportView, AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import type { InfernoFinalMatchResult, InfernoHighlight, InfernoSeasonReport } from '@/src/features/inferno/types';
import { deriveCharacterPersona } from '@/src/features/inferno/utils/character-persona';

/**
 * `GET /api/ai/seasons/report`의 `narrative`를 화면이 쓰는 모양으로 바꾼다(§ types.ts 주석 참고).
 *
 * 새 형식에는 `narrative` 가 없고 `tendency`(성향)와 `feedback`(조언)이 따로 온다(AiReportView 주석).
 * 예전 행동 분석 화면은 문단 하나라 둘을 이어 붙였는데, Figma ep5-결과(6818:5117)가 나와서 굵은 한 줄
 * (`tendency`) + 한 줄(`feedback`) + 강점/약점 칩으로 나눠 보여준다. 옛 형식 시즌(지난 시즌 다시 보기)은
 * `narrative` 하나뿐이라 굵은 줄 자리에 그대로 넣고 나머지는 비운다.
 */
export function mapAiReport(report: AiReportView): InfernoSeasonReport {
  return {
    tendency: report.narrative ?? report.tendency ?? '',
    feedback: report.feedback ?? '',
    strengths: report.strengths ?? [],
    weaknesses: report.weaknesses ?? [],
  };
}

/** `episode2` → 2. 회차 번호가 없는 키는 undefined. */
function episodeNumberOfKey(key: string): number | undefined {
  const number = Number.parseInt(key.replace(/\D/g, ''), 10);
  return Number.isNaN(number) ? undefined : number;
}

/** 회차 번호 순. 번호가 없는 키는 맨 뒤로 보낸다. */
function compareEpisodeKeys(a: string, b: string): number {
  return (episodeNumberOfKey(a) ?? Number.MAX_SAFE_INTEGER) - (episodeNumberOfKey(b) ?? Number.MAX_SAFE_INTEGER);
}

/**
 * `GET /api/ai/seasons/report`의 `highlights`를 화면이 쓰는 모양으로 바꾼다.
 *
 * 백엔드 확인 완료 — `title`/`summary` 같은 카드형이 아니라 `AiHighlightView`(1:1 대화 중
 * 인상 깊었던 한 줄 `text`와 그 메시지를 가리키는 `messageId`)다. "제목+요약" 카드가 아니라
 * 대화에서 뽑은 인용구 한 줄이라는 뜻이라, 억지로 title/summary로 쪼개지 않고 `text` 그대로
 * 인용구 하나로 보여준다.
 *
 * 새 형식은 배열이 아니라 회차별 객체다(`{ episode2: { message, reason }, … }`, AiReportView 주석).
 * 배열로 보고 `.map` 을 부르면 화면이 죽어서(실기기 Render Error) 모양을 보고 나눈다. 객체면 회차 순서로
 * 늘어놓고 `message` 를 인용구로 쓴다. 회차 번호와 `reason` 도 함께 넘긴다 — Figma ep5-하이라이트
 * (5760:4351)가 "Episode 02" + 인용구 + 고른 이유로 보여준다. 옛 형식은 둘 다 없다.
 */
export function mapAiHighlights(highlights: AiReportView['highlights'] | undefined): InfernoHighlight[] {
  if (!highlights) {
    return [];
  }

  if (Array.isArray(highlights)) {
    return highlights.map((highlight) => ({ text: highlight.text }));
  }

  return Object.entries(highlights)
    .sort(([a], [b]) => compareEpisodeKeys(a, b))
    .flatMap(([key, highlight]) =>
      highlight?.message
        ? [{ episodeOrder: episodeNumberOfKey(key), text: highlight.message, reason: highlight.reason }]
        : [],
    );
}

/**
 * ep5 "최종 매칭"을 `GET /api/ai/seasons/report`의 `finalPartnerId`에서 뽑는다. 백엔드
 * 확인 완료 — 이 값은 "다시 굽기"로 상대가 바뀐 경우까지 반영된 진짜 최종 상대라, ep4
 * 대화에서 상대를 직접 추론하던 예전 우회 로직(`mapFinalMatchFromEp4`)을 대체한다.
 */
export function mapFinalMatchFromReport(
  report: AiReportView,
  season: Pick<AiSeasonStatusView, 'characters'>,
): InfernoFinalMatchResult | undefined {
  const character = season.characters.find((candidate) => candidate.characterId === report.finalPartnerId);
  if (!character) {
    return undefined;
  }

  const persona = deriveCharacterPersona(character.characterId);

  return {
    profile: { type: persona.type, name: persona.name },
    summaryLine: '이 시즌, 당신의 분신은 진짜 인연을 만났어요',
  };
}
