import { toKnownAge } from '@/src/features/my-page/utils/age';
import { toKnownGender } from '@/src/features/my-page/utils/gender';
import type { UserProfile } from '@/src/features/user/types';

/**
 * 러빈지옥을 시작하기 전에 나이·성별이 둘 다 정해져 있는지. 서버가 시즌 배경(나이)과 캐릭터(성별)를
 * 정하는 데 둘 다 필요하다. 범위 밖 나이나 앱이 모르는 성별 값은 없는 것으로 본다.
 */
export function isAgeOrGenderMissing(profile: Pick<UserProfile, 'age' | 'gender'>): boolean {
  return toKnownAge(profile.age) === undefined || toKnownGender(profile.gender) === undefined;
}
