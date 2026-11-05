import TypewriterText, {
  TYPEWRITER_SPEED_MS,
  type TypewriterTextProps,
} from '@/src/components/ui/typewriter-text';
import { useDialogueSpeedStore } from '@/src/features/dialogue-speed/store/dialogue-speed-store';
import { speedToCharMs } from '@/src/features/dialogue-speed/utils/dialogue-speed';

/**
 * 사용자가 마이페이지에서 고른 속도 배율로 쳐지는 `TypewriterText`.
 *
 * 러빈지옥 대화(말풍선·내레이션·인터뷰)는 전부 이걸 써서 한 설정을 따른다. `TypewriterText` 자체는
 * 도메인을 모르는 공용 컴포넌트라 설정 저장소를 읽지 않는다 — 배율은 여기서만 붙인다.
 */
export default function SpeedTypewriterText(props: Omit<TypewriterTextProps, 'speedMs'>) {
  const multiplier = useDialogueSpeedStore((state) => state.multiplier);

  return <TypewriterText {...props} speedMs={speedToCharMs(multiplier, TYPEWRITER_SPEED_MS)} />;
}
