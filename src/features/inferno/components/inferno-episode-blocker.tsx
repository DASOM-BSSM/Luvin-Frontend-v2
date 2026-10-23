/**
 * [DRAFT] 재생할 블록이 아직 없을 때의 본문: 로딩·생성 대기·오류(InfernoEpisodeStateView)와
 * 나이 입력 바텀시트. 409 `AGE_REQUIRED` 면 시트를 바로 띄우고, 닫으면 "나이 입력하기"
 * 버튼으로 다시 연다. 저장하면 본문을 다시 요청한다(보정 문서 7장).
 */
import { useState } from 'react';

import AgeRequiredSheet from '@/src/features/inferno/components/age-required-sheet';
import InfernoEpisodeStateView from '@/src/features/inferno/components/inferno-episode-state-view';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

interface InfernoEpisodeBlockerProps {
  order: number;
  isLoading: boolean;
  isGenerating: boolean;
  error: unknown;
  onRetry: () => void;
  onShowReport: () => void;
}

export default function InfernoEpisodeBlocker({
  order,
  isLoading,
  isGenerating,
  error,
  onRetry,
  onShowReport,
}: InfernoEpisodeBlockerProps) {
  const [ageSheetDismissed, setAgeSheetDismissed] = useState(false);
  const ageSheetVisible = !ageSheetDismissed && getStoryErrorCode(error) === 'AGE_REQUIRED';

  function handleAgeRequired() {
    setAgeSheetDismissed(false);
  }

  function handleAgeSheetClose() {
    setAgeSheetDismissed(true);
  }

  return (
    <>
      <InfernoEpisodeStateView
        order={order}
        isLoading={isLoading}
        isGenerating={isGenerating}
        error={error}
        onRetry={onRetry}
        onShowReport={onShowReport}
        onAgeRequired={handleAgeRequired}
      />
      <AgeRequiredSheet visible={ageSheetVisible} onSaved={onRetry} onClose={handleAgeSheetClose} />
    </>
  );
}
