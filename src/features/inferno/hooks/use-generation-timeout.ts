import { useEffect } from 'react';

/**
 * AI 생성을 이만큼 기다려도 결과가 안 오면 실패로 본다(사용자 결정: 3분).
 *
 * 서버가 작업을 `QUEUED` 로 받아 놓고 처리하지 못하면 실패 응답도 오지 않아서, 예전에는 줄넘기
 * 로더가 끝없이 돌았다(실기기 확인 — 생성 작업자가 멈춘 동안 3분 넘게 409 만 계속 옴).
 */
export const GENERATION_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * 생성을 기다리는 동안(`isWaiting`) 3분이 지나면 `onTimeout` 을 부른다. 부르는 쪽은 이때 생성 실패와
 * 똑같이 처리해서(폴링 멈춤 + "대화를 만들지 못했어요" + "다시 시도") 사용자가 갇히지 않게 한다.
 *
 * 기다림이 끝나면(결과 도착, 서버 실패 응답) 타이머는 정리되고, "다시 시도" 로 다시 기다리기
 * 시작하면 3분을 처음부터 다시 센다.
 */
export default function useGenerationTimeout(isWaiting: boolean, onTimeout: () => void) {
  useEffect(() => {
    if (!isWaiting) {
      return;
    }

    const timer = setTimeout(onTimeout, GENERATION_TIMEOUT_MS);

    return () => clearTimeout(timer);
    // onTimeout 은 부르는 쪽이 상태를 실패로 바꾸는 함수라 매 렌더 새로 만들어져도 하는 일이 같다.
    // 의존성에 넣으면 렌더마다 3분 타이머가 다시 시작돼 영영 끝나지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaiting]);
}
