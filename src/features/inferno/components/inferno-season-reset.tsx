import { useState } from 'react';
import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import ConfirmModal from '@/src/components/ui/confirm-modal';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import useResetSeasons from '@/src/features/inferno/hooks/use-reset-seasons';

const CONFIRM_MESSAGE =
  '러빈지옥 시즌을 모두 지울까요? 회차·선택·쪽지·리포트가 사라지고 1화부터 다시 시작해요.';

/**
 * [DRAFT] "시즌 초기화". 러빈지옥 홈(oven)의 시즌 카드를 펼치면 1화 밑에 뜬다(사용자 결정). 개발용이 아니라 모든 빌드에서 보인다(사용자 결정 —
 * 예전에는 개발 빌드에서만 그렸다). 버튼은 가로 꽉 찬 연한 노랑(`noticeSoft` — yellow/200 바탕 ·
 * yellow/300 테두리)이다(사용자 지정 — 처음엔 로그인 버튼과 같은 `primary` 였는데 더 연하게 바꿨다). 되돌릴 수 없는 동작이라 확인 모달을 거친다(§11).
 *
 * 서버는 정식 경로(`POST /api/ai/seasons/reset`)를 쓴다 — 쓴 토큰은 돌려주지 않아서(`refundedTokens` 늘 0)
 * 결과 문구에 환불 수를 쓰지 않는다.
 */
export default function InfernoSeasonReset() {
  const reset = useResetSeasons();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  function handleResetPress() {
    setIsConfirmVisible(true);
  }

  function handleConfirmCancel() {
    setIsConfirmVisible(false);
  }

  function handleConfirm() {
    setIsConfirmVisible(false);
    reset.mutate();
  }

  return (
    <View className="w-full flex-col items-start gap-[12px]">
      <Button
        label={reset.isPending ? '초기화 중…' : '시즌 초기화'}
        variant="noticeSoft"
        disabled={reset.isPending}
        onPress={handleResetPress}
      />
      {reset.isSuccess ? (
        <Text variant="body-xs" className="text-text-primary">
          {`시즌 ${reset.data.deletedSeasons ?? 0}개를 지웠어요`}
        </Text>
      ) : null}
      {reset.isError ? (
        <Text variant="body-xs" className="text-state-error">
          {ERROR_MESSAGES.seasonResetFailed}
        </Text>
      ) : null}
      <ConfirmModal
        visible={isConfirmVisible}
        message={CONFIRM_MESSAGE}
        confirmLabel="초기화"
        onConfirm={handleConfirm}
        onCancel={handleConfirmCancel}
      />
    </View>
  );
}
