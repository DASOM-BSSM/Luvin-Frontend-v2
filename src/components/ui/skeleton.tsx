import { View } from 'react-native';

interface SkeletonProps {
  /**
   * 크기·모양 클래스. 실제 내용이 들어올 자리와 같은 크기를 넘긴다(예: `h-[16px] w-[80px]`).
   *
   * NOTE: NativeWind 는 소스에 그대로 적힌 클래스만 만든다. 그래서 숫자를 받아 조립하지 않고
   * 부르는 쪽이 클래스 문자열을 그대로 넘긴다.
   */
  className: string;
}

/**
 * 불러오는 중에 실제 내용 자리를 채우는 회색 막대(§11). 화면별 스켈레톤은 이걸 실제 레이아웃대로
 * 조합해서 만든다 — 데이터가 와도 자리가 밀리지 않게.
 *
 * [DRAFT] Figma 에 스켈레톤 시안이 없어 기존 `default/gray` 토큰을 연하게 깔았다.
 */
export default function Skeleton({ className }: SkeletonProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`rounded-[4px] bg-default-gray/50 ${className}`}
    />
  );
}
