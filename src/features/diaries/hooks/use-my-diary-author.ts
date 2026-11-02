import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import type { GroupDiaryAuthor } from '@/src/features/diaries/types';
import { toPlainBreadName, UNKNOWN_BREAD_NAME } from '@/src/features/diaries/utils/feed';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

/**
 * 일기 카드에 그릴 "나" — 내 빵 캐릭터와 빵 이름("쫀쫀한 소금빵"). 오늘 쓸 자리 · 일기 올리기 카드 ·
 * 내 일기 · 내 댓글 · 내 답이 같이 쓴다. 실제 이름(계정 닉네임)은 쓰지 않는다(사용자 결정).
 *
 * 이름은 서버가 정한 내 빵 이름(`GET /api/users/me` 의 `breadName`)이다 — 다른 사람에게 보이는 내 이름과 같다.
 * 그걸 받기 전 · 없을 때만 이 기기가 만든 반죽 이름에서 "반죽"을 뗀 값을 쓴다.
 */
export default function useMyDiaryAuthor(): GroupDiaryAuthor {
  const { profile } = useBreadProfile();
  const serverBreadName = useMyProfile().data?.breadName;
  const localName = profile ? toPlainBreadName(profile.name) : UNKNOWN_BREAD_NAME;

  return {
    type: profile?.type ?? null,
    state: 'dough',
    name: serverBreadName ?? localName,
  };
}
