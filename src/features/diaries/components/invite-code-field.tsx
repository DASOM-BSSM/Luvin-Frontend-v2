import { Share } from 'react-native';

import SettingsFieldRow from '@/src/features/diaries/components/settings-field-row';
import useRoomInviteCode from '@/src/features/diaries/hooks/use-room-invite-code';
import type { RoomId } from '@/src/features/diaries/types';

interface InviteCodeFieldProps {
  roomId: RoomId;
}

/**
 * 초대코드 줄(Figma 6606:4136). `GET /api/diary-rooms/{roomId}/invite-code` 의 코드를 보여준다.
 *
 * NOTE: "복사"는 지금 시스템 공유 시트(`Share`)로 연다 — 클립보드에 바로 넣으려면
 * `expo-clipboard`(네이티브 모듈, 재빌드 필요)가 있어야 하는데 아직 설치하지 않았다(§3, 설치 전 합의).
 * 공유 시트에도 "복사"가 있어서 우선 이걸로 둔다.
 */
export default function InviteCodeField({ roomId }: InviteCodeFieldProps) {
  const inviteCodeQuery = useRoomInviteCode(roomId);
  const inviteCode = inviteCodeQuery.data?.inviteCode;

  function handleCopyPress() {
    if (!inviteCode) return;
    Share.share({ message: inviteCode });
  }

  const placeholder = inviteCodeQuery.isError ? '초대코드를 불러오지 못했어요' : '불러오는 중...';

  return (
    <SettingsFieldRow
      label="초대코드"
      value={inviteCode ?? ''}
      placeholder={placeholder}
      actionLabel="복사"
      onActionPress={handleCopyPress}
    />
  );
}
