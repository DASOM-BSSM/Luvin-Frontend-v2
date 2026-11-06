import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DialogueSpeedSetting from '@/src/features/dialogue-speed/components/dialogue-speed-setting';
import InfernoDotModal from '@/src/features/inferno/components/inferno-dot-modal';

interface InfernoSpeedModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 에피소드 안에서 대화 속도를 바로 조절하는 모달.
 *
 * 마이페이지의 `DialogueSpeedSetting` 을 그대로 쓴다 — 같은 저장소(MMKV)를 보므로 여기서 고른 값이
 * 마이페이지에도, 다음 대사부터는 본문에도 바로 반영된다. 시안이 없어 다른 러빈지옥 모달의
 * 껍데기(InfernoDotModal)에 담았다.
 *
 * NOTE: 안드로이드는 Modal 안에서 제스처가 동작하려면 모달 안쪽에 `GestureHandlerRootView` 가 따로
 * 있어야 한다(슬라이더가 제스처로 움직인다). 루트의 것은 Modal 밖이라 닿지 않는다.
 */
export default function InfernoSpeedModal({ visible, onClose }: InfernoSpeedModalProps) {
  return (
    <InfernoDotModal
      visible={visible}
      minWidthClass="min-w-[344px]"
      closeLabel="대화 속도 닫기"
      onClose={onClose}
    >
      <GestureHandlerRootView>
        <DialogueSpeedSetting />
      </GestureHandlerRootView>
    </InfernoDotModal>
  );
}
