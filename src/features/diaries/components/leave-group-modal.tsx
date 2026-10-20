import { router } from 'expo-router';
import { Modal, Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import useLeaveRoom from '@/src/features/diaries/hooks/use-leave-room';
import type { RoomId } from '@/src/features/diaries/types';

/** 방장은 나갈 수 없다(서버 400). 문구는 임시 — 정해지면 바꾼다. */
const OWNER_CANNOT_LEAVE_MESSAGE = '방장은 그룹을 나갈 수 없어요';
const LEAVE_ERROR_MESSAGE = '그룹을 나가지 못했어요. 다시 시도해 주세요';

interface LeaveGroupModalProps {
  visible: boolean;
  roomId: RoomId;
  /** 내가 방장이면 나가기 대신 안내만 보여준다. */
  isOwner: boolean;
  onClose: () => void;
}

/**
 * 그룹 나가기 확인. Figma "그룹 나가기 - 제민"(6606:4450).
 *
 * `ConfirmModal` 과 쪽지 모양은 같지만 버튼이 달라서(두 버튼이 반씩 나눠 차지하고, 취소가
 * 진한 노랑 · 나가기가 연한 노랑) 따로 그린다. 나가면 감정일기 홈으로 돌아간다.
 */
export default function LeaveGroupModal({ visible, roomId, isOwner, onClose }: LeaveGroupModalProps) {
  const leaveRoomMutation = useLeaveRoom();

  function handleLeaveSuccess() {
    onClose();
    router.replace('/diaries');
  }

  function handleLeavePress() {
    leaveRoomMutation.mutate(roomId, { onSuccess: handleLeaveSuccess });
  }

  function handleClose() {
    leaveRoomMutation.reset();
    onClose();
  }

  const errorMessage = isOwner
    ? OWNER_CANNOT_LEAVE_MESSAGE
    : leaveRoomMutation.isError
      ? LEAVE_ERROR_MESSAGE
      : undefined;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-default-black/30 px-[37px]"
        onPress={handleClose}
      >
        {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. */}
        <Pressable className="w-full max-w-[329px] overflow-hidden rounded-[8px] bg-default-white p-[28px]">
          <View className="w-full flex-col items-center gap-[20px]">
            <View className="w-full flex-col items-center gap-[4px]">
              <Text className="w-full text-center text-pink-500" style={okMallangBTitleStyle}>
                NOTICE
              </Text>
              <Text variant="body-m" className="text-center text-default-black">
                정말 그룹을 나가시겠어요?
              </Text>
              {errorMessage ? (
                <Text variant="body-xs" className="text-center text-state-error">
                  {errorMessage}
                </Text>
              ) : null}
            </View>
            <View className="w-full flex-row items-start gap-[12px]">
              <View className="flex-1">
                <Button label="취소" variant="notice" onPress={handleClose} />
              </View>
              <View className="flex-1">
                <Button
                  label="나가기"
                  variant="noticeSoft"
                  disabled={isOwner || leaveRoomMutation.isPending}
                  onPress={handleLeavePress}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
