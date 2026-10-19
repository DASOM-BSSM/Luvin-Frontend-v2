import { useLocalSearchParams } from 'expo-router';

/**
 * 회차 화면이 보고 있는 시즌. 경로의 `seasonId` 파라미터로 정해진다(constants/routes 의 infernoIntroHref).
 *
 * - `pastSeasonId` 가 없으면: 지금 시즌을 본다. 지금까지와 똑같이 동작한다.
 * - 있으면: **지난 시즌 다시 보기**다. 오븐의 지난 시즌 카드에서만 들어온다. 조회 API 에 `season_id` 를
 *   붙여 그 시즌 대화를 읽고, 쓰기는 하나도 하지 않는다 — 대화 생성 요청, 투표·결과 제출, 다시 굽기,
 *   피드백, 완료 기록, 이어보기 자리, 쪽지 모두. 서버는 회차 조회만 시즌을 고를 수 있고 쓰기 API 는 늘
 *   최신 시즌에 들어가서, 지난 시즌 화면에서 쓰기를 보내면 지금 시즌 진행이 바뀐다.
 *
 * 파라미터는 사용자가 딥링크로 아무 값이나 넣을 수 있다(§13). 그래도 조회만 하므로 다른 사람의 시즌이면
 * 서버가 막고, 화면은 불러오기 실패 안내를 보여준다.
 */
export default function useViewedSeason() {
  const { seasonId } = useLocalSearchParams<{ seasonId?: string }>();
  const pastSeasonId = typeof seasonId === 'string' && seasonId.length > 0 ? seasonId : undefined;

  return { pastSeasonId, isPastSeason: pastSeasonId !== undefined };
}
