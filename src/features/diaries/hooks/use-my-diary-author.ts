import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import type { GroupDiaryAuthor } from '@/src/features/diaries/types';
import { UNKNOWN_AUTHOR_NAME } from '@/src/features/diaries/utils/feed';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

/** 일기 카드에 그릴 "나" — 내 빵 캐릭터와 닉네임. 오늘 쓸 자리 · 일기 올리기 카드가 같이 쓴다. */
export default function useMyDiaryAuthor(): GroupDiaryAuthor {
  const { profile } = useBreadProfile();
  const myProfileQuery = useMyProfile();

  return {
    type: profile?.type ?? null,
    state: 'dough',
    name: myProfileQuery.data?.nickname ?? profile?.name ?? UNKNOWN_AUTHOR_NAME,
  };
}
