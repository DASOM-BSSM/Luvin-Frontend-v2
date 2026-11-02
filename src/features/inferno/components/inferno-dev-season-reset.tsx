import { useState } from 'react';
import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import ConfirmModal from '@/src/components/ui/confirm-modal';
import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import useResetSeasons from '@/src/features/inferno/hooks/use-reset-seasons';

const CONFIRM_MESSAGE =
  '러빈지옥 시즌을 모두 지울까요? 회차·선택·쪽지·리포트가 사라지고 1화부터 다시 시작해요.';

/**
 * [DRAFT] 개발 빌드 전용 "시즌 초기화"(사용자 요청). 러빈지옥 홈(oven)에 붙는다.
 *
 * Figma 시안이 없는 개발 도구라 공용 Button·ConfirmModal 로만 만들었고, 배포 빌드에서는 그리지 않는다
 * (`__DEV__`). 서버도 dev·staging 에만 경로가 있다. 되돌릴 수 없는 동작이라 확인 모달을 거친다(§11).
 */
export default function InfernoDevSeasonReset() {
  const reset = useResetSeasons();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  if (!__DEV__) {
    return null;
  }

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
      <SectionHeader title="개발용" />
      <Button
        label={reset.isPending ? '초기화 중…' : '시즌 초기화'}
        variant="outline"
        disabled={reset.isPending}
        onPress={handleResetPress}
      />
      {reset.isSuccess ? (
        <Text variant="body-xs" className="text-text-primary">
          {`시즌 ${reset.data.deletedSeasons ?? 0}개를 지웠어요 · 토큰 ${reset.data.refundedTokens ?? 0}개 환불`}
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
