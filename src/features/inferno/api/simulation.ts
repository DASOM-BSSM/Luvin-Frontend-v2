import httpClient from '@/src/lib/http-client';

import type { SimulationHighlightView, SimulationReportView } from '@/src/features/inferno/api/simulation-types';

/**
 * `GET /api/simulation/report`, `GET /api/simulation/highlights`.
 *
 * `ai-season.ts`의 다른 엔드포인트와 달리 `ApiEnvelope<T>` 래퍼(`{success, data, message}`)를
 * 쓰는지 확인되지 않았다 — 전달받은 응답 예시가 최상위에 바로 이 모양이라 그대로 가정했다.
 * 실제로 감싸져 있으면 아래 두 함수에서 `.data.data`로 한 번 더 벗겨야 한다.
 */
export async function getSimulationReport(): Promise<SimulationReportView> {
  const { data } = await httpClient.get<SimulationReportView>('/api/simulation/report');
  return data;
}

export async function getSimulationHighlights(): Promise<SimulationHighlightView[]> {
  const { data } = await httpClient.get<SimulationHighlightView[]>('/api/simulation/highlights');
  return data;
}
