import { ActivityIndicator, View } from 'react-native';

import Text from '@/src/components/ui/text';
import { pink } from '@/src/constants/colors';
import InfernoDotModal from '@/src/features/inferno/components/inferno-dot-modal';

interface InfernoEpisodeSavingModalProps {
  visible: boolean;
  onDismiss?: () => void;
}

/** 완료 요청 또는 잠시 나가기 저장 중에 보여주는 러빈지옥 쪽지. */
export function InfernoEpisodeSavingContent() {
  return (
    <View className="items-center gap-[12px]" accessibilityLiveRegion="polite">
      <ActivityIndicator color={pink[500]} accessibilityLabel="에피소드 저장 중" />
      <Text variant="heading-h4" className="text-center text-text-primary">
        에피소드 저장 중
      </Text>
      <Text variant="body-s" className="text-center text-text-muted">
        잠시만 기다려 주세요
      </Text>
    </View>
  );
}

export default function InfernoEpisodeSavingModal({
  visible,
  onDismiss,
}: InfernoEpisodeSavingModalProps) {
  return (
    <InfernoDotModal
      visible={visible}
      minWidthClass="min-w-[344px]"
      closeLabel="에피소드 저장 중"
      dismissible={false}
      onDismiss={onDismiss}
    >
      <InfernoEpisodeSavingContent />
    </InfernoDotModal>
  );
}
