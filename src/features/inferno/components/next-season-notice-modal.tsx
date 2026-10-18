import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';
import { NEXT_SEASON_NOTICE, NEXT_SEASON_TOKEN_COST } from '@/src/features/inferno/constants/season';
import useStartNextSeason from '@/src/features/inferno/hooks/use-start-next-season';
import useMySurveyResult from '@/src/features/survey/hooks/use-my-survey-result';
import useTokenBalance from '@/src/features/tokens/hooks/use-token-balance';

interface NextSeasonNoticeModalProps {
  visible: boolean;
  onClose: () => void;
  /** 토큰이 모자랄 때의 "미니게임으로 토큰 모으기". */
  onCollectTokensPress: () => void;
  /** 새 시즌이 열렸을 때. 새 시즌의 첫 회차로 보내는 건 호출부가 정한다. */
  onSeasonStarted: () => void;
}

/**
 * "다음 시즌" 안내. 같은 NOTICE 모달(InfernoNoticeModal)에 버튼만 잔액에 따라 바꿔 넣는다.
 *
 * - 토큰이 `NEXT_SEASON_TOKEN_COST` 개 이상이면 "토큰 N개로 시작하기" → `POST /api/ai/seasons/next`
 * - 모자라면 지금처럼 "미니게임으로 토큰 모으기"
 *
 * 잔액은 서버 값(`useTokenBalance`)으로 판단한다. 아직 못 받았으면 모자란 쪽으로 보여준다 —
 * 시작 버튼을 눌렀는데 잔액이 없어 실패하는 것보다 낫다. 토큰 차감은 서버가 `/next` 안에서
 * 한다고 가정한다(use-start-next-season.ts 주석 참고).
 *
 * 설문 결과는 최신 것을 넘기고, 아직 못 받았으면 생략해서 서버가 최신 결과를 쓰게 한다.
 */
export default function NextSeasonNoticeModal({
  visible,
  onClose,
  onCollectTokensPress,
  onSeasonStarted,
}: NextSeasonNoticeModalProps) {
  const balanceQuery = useTokenBalance();
  const surveyResultQuery = useMySurveyResult();
  const startMutation = useStartNextSeason();

  const canStart = (balanceQuery.data?.tokenBalance ?? 0) >= NEXT_SEASON_TOKEN_COST;

  function handleStartPress() {
    startMutation.mutate(surveyResultQuery.data?.resultId, { onSuccess: handleSeasonStarted });
  }

  function handleSeasonStarted() {
    startMutation.reset();
    onSeasonStarted();
  }

  // 닫을 때 지난 실패 문구를 지워서, 다음에 열면 처음 안내부터 보이게 한다.
  function handleClose() {
    startMutation.reset();
    onClose();
  }

  if (!canStart) {
    return (
      <InfernoNoticeModal
        visible={visible}
        message={NEXT_SEASON_NOTICE.message}
        actionLabel={NEXT_SEASON_NOTICE.actionLabel}
        onClose={handleClose}
        onActionPress={onCollectTokensPress}
      />
    );
  }

  return (
    <InfernoNoticeModal
      visible={visible}
      message={startMutation.isError ? ERROR_MESSAGES.nextSeasonFailed : NEXT_SEASON_NOTICE.message}
      actionLabel={startMutation.isPending ? NEXT_SEASON_NOTICE.startingLabel : NEXT_SEASON_NOTICE.startLabel}
      isActionDisabled={startMutation.isPending}
      onClose={handleClose}
      onActionPress={handleStartPress}
    />
  );
}
