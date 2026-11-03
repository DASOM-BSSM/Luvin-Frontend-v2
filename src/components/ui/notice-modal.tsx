import { Modal, Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';

interface NoticeModalProps {
  visible: boolean;
  /** 분홍 제목. 기본 "NOTICE"(7958:5971), 성공 쪽지는 "SUCCESS!"(7962:6087). */
  title?: string;
  message: string;
  /** 화면 아무 곳(쪽지 안 포함)을 누르거나 안드로이드 뒤로가기를 했을 때. */
  onClose: () => void;
}

/**
 * 버튼 없는 NOTICE 쪽지. Figma `모달`(7958:5971). 같은 모양의 SUCCESS 쪽지(7962:6087)도 이걸 쓴다.
 *
 * `ConfirmModal`·`InfernoNoticeModal`과 같은 쪽지 모양인데 시안에 버튼이 없어서 따로 둔다.
 * 닫을 방법이 버튼뿐이 아니도록, 쪽지 안을 눌러도 닫힌다(사용자 결정: 화면 아무 곳이나 탭).
 *
 * NOTE: 제목은 Tailwind 클래스가 아니라 style 로 폰트를 넣는다. `font-ok-mallang-b` 는
 * 실기기에서 폰트가 깨진다(src/constants/typography.ts 주석 참고).
 */
export default function NoticeModal({
  visible, title = 'NOTICE', message, onClose,
}: NoticeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="안내 닫기"
        className="flex-1 items-center justify-center bg-default-black/30 px-[30px]"
        onPress={onClose}
      >
        <View className="w-full max-w-[342px] overflow-hidden rounded-[8px] bg-default-white px-[24px] py-[28px]">
          <View className="w-full flex-col items-center gap-[4px]">
            <Text className="w-full text-center text-pink-500" style={okMallangBTitleStyle}>
              {title}
            </Text>
            <Text variant="body-m" className="w-full text-center text-default-black">
              {message}
            </Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
