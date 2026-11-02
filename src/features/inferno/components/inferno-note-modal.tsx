import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import InfernoDotModal from '@/src/features/inferno/components/inferno-dot-modal';

interface InfernoNoteModalProps {
  visible: boolean;
  /**
   * 쪽지 최소 폭 클래스. 시안 값을 `min-w-[…]` 로 넘긴다(VOTE 366, NOTICE 344).
   *
   * 시안은 글에 맞춰 늘어나는 상자다. 예전에는 시안 폭으로 고정해서(안쪽의 `w-full` 들이 기댈
   * 폭이 필요했다), 글이 길어지면 상자가 늘지 않고 그 폭 안에서 줄이 바뀌었다(사용자 지적).
   * 지금은 시안 폭을 최소로 두고 글에 맞춰 가로로 늘어나며, 화면의 90% 를 넘을 때만 줄을 바꾼다.
   * 안쪽은 `w-full` 대신 부모 폭에 맞춰 늘어나게(stretch) 해서 폭을 비워도 화면 끝까지 퍼지지 않는다.
   *
   * NOTE: NativeWind 는 소스에 그대로 적힌 클래스만 만든다. 그래서 숫자만 받아 클래스를 조립하지
   * 않고 부르는 쪽이 `min-w-[366px]` 문자열 그대로 넘긴다.
   */
  minWidthClass: string;
  /** 쪽지 맨 위 분홍 글자. 예: "VOTE", "NOTICE" */
  title: string;
  message: string;
  actionLabel: string;
  onActionPress: () => void;
  /** 버튼을 막는다. 서버 요청이 오가는 동안 다시 누르지 못하게 할 때 쓴다(§11). */
  isActionDisabled?: boolean;
  /** 완전히 닫힌 뒤(iOS) 불린다. iOS 는 모달 두 개를 겹쳐 띄우지 못해서, 다음 모달은 이걸 기다린다. */
  onDismiss?: () => void;
  /** 바깥을 누르거나 안드로이드 뒤로가기를 했을 때. */
  onClose: () => void;
}

/**
 * 러빈지옥 화면 위에 뜨는 쪽지 모달. Figma `ep1-투표` (5466:4550), `ep1-끝` (5467:5645).
 *
 * 물방울 무늬 종이 위에 흰 쪽지가 한 겹 얹힌 모양이라 두 겹으로 짠다. 바깥이 무늬(반경 12),
 * 안쪽이 흰 쪽지(반경 8)다. 최소 폭은 쪽지마다 달라서 부르는 쪽이 넘긴다(minWidthClass).
 * 두 겹 껍데기는 반죽 소개 모달과 같이 쓰려고 InfernoDotModal 로 뺐다.
 *
 * NOTE: 제목은 Tailwind 클래스가 아니라 style 로 폰트를 넣는다. `font-ok-mallang-b` 는
 * 실기기에서 폰트가 깨진다(src/constants/typography.ts 주석 참고).
 *
 * NOTE: 시안에 닫기 버튼이 없어서 바깥을 누르면 닫히게 했다. 안드로이드 뒤로가기도 같다.
 *
 * 홈의 InfernoNoticeModal 과 생김새가 비슷하지만 그쪽 시안(6602:3711)에는 무늬 테두리가 없고
 * 여백도 다르다. 시안이 하나로 합쳐지면 그때 합칠 것.
 */
export default function InfernoNoteModal({
  visible,
  minWidthClass,
  title,
  message,
  actionLabel,
  onActionPress,
  isActionDisabled = false,
  onClose,
  onDismiss,
}: InfernoNoteModalProps) {
  return (
    <InfernoDotModal
      visible={visible}
      minWidthClass={minWidthClass}
      closeLabel={`${title} 닫기`}
      onClose={onClose}
      onDismiss={onDismiss}
    >
      <View className="flex-col items-center gap-[20px]">
        <View className="flex-col items-stretch gap-[4px] self-stretch">
          <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
            {title}
          </Text>
          <Text variant="body-m" className="text-center text-default-black">
            {message}
          </Text>
        </View>
        {/* `notice` 가 아니라 `noticeFit` — 폭이 글에 맞춰 정해지는 상자라 `w-full` 버튼을 쓰면
            상자가 최대 폭까지 늘어난다(Button 의 noticeFit 주석 참고). */}
        <Button
          label={actionLabel}
          variant="noticeFit"
          disabled={isActionDisabled}
          onPress={onActionPress}
        />
      </View>
    </InfernoDotModal>
  );
}
