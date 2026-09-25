/**
 * `simulation-controller`(`/api/simulation/*`) DTO. `ai-season-controller`(`/api/ai/seasons/*`)와
 * URL 프리픽스가 달라 별개 컨트롤러로 보고 파일을 나눴다. UI가 쓰는 `InfernoSeasonReport`/
 * `InfernoHighlight` 등과는 별개다 — 화면에 보여줄 모양으로 바꾸는 건
 * `utils/map-ai-season-report.ts` 가 한다.
 */

/** `GET /api/simulation/report`. */
export interface SimulationReportView {
  summary: string;
  strength: string[];
  weakness: string[];
  advice: string;
}

/** `GET /api/simulation/highlights`의 배열 원소 하나. */
export interface SimulationHighlightView {
  episodeId: number;
  title: string;
  summary: string;
  importance: number;
}
