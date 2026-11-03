import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import BottomNav from '@/src/components/bottom-nav';
import BackHeader from '@/src/components/ui/back-header';
import Button from '@/src/components/ui/button';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import GroupMemberList from '@/src/features/diaries/components/group-member-list';
import InviteCodeField from '@/src/features/diaries/components/invite-code-field';
import LeaveGroupModal from '@/src/features/diaries/components/leave-group-modal';
import SettingsFieldRow from '@/src/features/diaries/components/settings-field-row';
import useRoom from '@/src/features/diaries/hooks/use-room';
import useRoomMembers from '@/src/features/diaries/hooks/use-room-members';
import useUpdateRoom from '@/src/features/diaries/hooks/use-update-room';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

/**
 * 그룹 설정하기. Figma "그룹 설정하기 - 리원"(6606:3984). 경로 `/diaries/groups/[roomId]/settings`.
 *
 * 그룹 이름 수정 · 멤버 내보내기 · 설정 저장은 방장만 보인다. 그룹 정보는 `GET /api/diary-rooms/{roomId}`
 * 로 받는다.
 *
 * 설정 저장하기는 이름을 바꾸지 않아도 누를 수 있다(막 만든 그룹도 바로 들어갈 수 있게) — 바뀐
 * 이름이 있으면 저장한 뒤, 없으면 바로 나간다. 그룹을 막 만들고 왔으면(`created`) 그 그룹의 감정일기
 * 메인으로, 아니면 이전 화면으로 돌아간다.
 *
 * 수정 API(PUT)는 모든 필드를 다시 받아서, 이 화면에서 바꾸지 않는 최대 인원 · 소개 · 방장 닉네임은
 * 지금 값을 그대로 보낸다. 방장 닉네임은 방 정보에 없어 멤버 목록의 방장 줄에서 가져온다.
 */
export default function GroupSettingsScreen() {
  const { roomId: roomIdParam, created } = useLocalSearchParams<{
    roomId: string;
    created?: string;
  }>();
  const roomId = Number(roomIdParam);
  const isJustCreated = created === '1';
  const room = useRoom(roomId).data;
  const myId = useMyProfile().data?.memberId;
  const isOwner = room !== undefined && room.ownerId === myId;
  // 멤버 목록(GroupMemberList)과 같은 쿼리라 캐시를 같이 쓴다.
  const ownerNickname = useRoomMembers(roomId).data?.find(({ id }) => id === room?.ownerId)?.nickname;
  const updateRoomMutation = useUpdateRoom();

  // null 이면 아직 손대지 않은 것 — 서버의 그룹 이름을 그대로 보여준다.
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const name = nameDraft ?? room?.name ?? '';
  const hasNameChange = name.trim() !== room?.name;
  // 이름을 바꿨으면 PUT 에 같이 보낼 방장 닉네임이 있어야 저장할 수 있다.
  const canSave = isOwner && name.trim() !== '' && (!hasNameChange || !!ownerNickname);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({ pathname: '/diaries/groups/[roomId]', params: { roomId } });
  }

  function handleEditNamePress() {
    setIsEditingName((editing) => !editing);
  }

  function leaveSettings() {
    if (isJustCreated || !router.canGoBack()) {
      router.replace({ pathname: '/diaries/groups/[roomId]', params: { roomId } });
      return;
    }
    router.back();
  }

  function handleSaveSuccess() {
    setIsEditingName(false);
    setNameDraft(null);
    leaveSettings();
  }

  function handleSavePress() {
    if (!hasNameChange) {
      leaveSettings();
      return;
    }
    if (!room || !ownerNickname) return;
    updateRoomMutation.mutate(
      {
        roomId,
        name: name.trim(),
        description: room.description ?? undefined,
        maxMemberCount: room.maxMemberCount,
        ownerNickname,
      },
      { onSuccess: handleSaveSuccess },
    );
  }

  function handleLeavePress() {
    setIsLeaveModalVisible(true);
  }

  function handleLeaveModalClose() {
    setIsLeaveModalVisible(false);
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[60px] px-[30px] pb-[24px] pt-[36px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BackHeader title="그룹 설정하기" onBackPress={handleBackPress} />

        <View className="w-full flex-col items-start gap-[60px]">
          <View className="w-full flex-col items-start gap-[24px]">
            <SettingsFieldRow
              label="그룹 이름"
              value={name}
              onChangeText={setNameDraft}
              placeholder="그룹 이름을 작성해주세요"
              editable={isOwner && isEditingName}
              actionLabel={isOwner ? (isEditingName ? '완료' : '수정') : undefined}
              onActionPress={handleEditNamePress}
            />
            <InviteCodeField roomId={roomId} />
            <View className="w-full flex-col items-start gap-[12px]">
              <View className="flex-col items-start gap-[4px]">
                <Text variant="heading-h5" className="text-text-primary">
                  그룹 멤버 목록
                </Text>
                {isOwner ? (
                  <Text variant="body-xs" className="text-text-muted">
                    x버튼을 눌러 탈퇴 시킬 수 있어요
                  </Text>
                ) : null}
              </View>
              {room ? <GroupMemberList roomId={roomId} ownerId={room.ownerId} isOwner={isOwner} /> : null}
            </View>
          </View>

          <View className="w-full flex-col items-center gap-[8px]">
            {isOwner ? (
              <Button
                label="설정 저장하기"
                variant="infoSave"
                disabled={!canSave || updateRoomMutation.isPending}
                onPress={handleSavePress}
              />
            ) : null}
            {updateRoomMutation.isError ? (
              <Text variant="body-xs" className="text-state-error">
                설정을 저장하지 못했어요. 다시 시도해 주세요
              </Text>
            ) : null}
            <Pressable accessibilityRole="button" hitSlop={8} onPress={handleLeavePress}>
              <Text variant="body-xs" className="text-text-muted">
                그룹 나가기
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="diary" />
      </View>

      <LeaveGroupModal
        visible={isLeaveModalVisible}
        roomId={roomId}
        isOwner={isOwner}
        onClose={handleLeaveModalClose}
      />
    </Screen>
  );
}
