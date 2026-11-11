---
name: typography-ok-mallang
description: Luvin 폰트 규칙 상세 — Ok Mallang B(러빈지옥 제목·강조 문구) 적용법, 텍스트 스트로크(OkMallangBText), 폰트 등록·파일명 규칙. Ok Mallang B 텍스트를 쓰거나 폰트 로딩·typography.ts를 수정할 때 사용한다.
---

# Typography 상세 (Ok Mallang B)

기본 규칙(폰트 3종, `fontWeight` 금지, 토큰 사용)은 AGENTS.md §5에 있다. 이 문서는 Ok Mallang B와 폰트 등록의 세부 규칙이다.

## 폰트 등록

- `.ttf` 3개는 `src/assets/fonts/`에 있고 `src/app/_layout.tsx`의 `useFonts`로 로드한다.
- Ok Mallang B 파일은 `OkMallangB-Regular.ttf`다 (원본 `Ok Mallang B.ttf`에서 변경). **파일명에 공백을 넣지 않는다** — Metro가 Android에서 폰트 에셋을 못 찾고 시스템 폰트로 조용히 대체된다.
- **불변 조건**: `useFonts`의 키와 `src/constants/typography.ts`의 `fontFamily` 값은 같은 문자열이어야 한다. 한쪽만 바꾸면 시스템 폰트로 대체된다. Ok Mallang B의 등록 문자열은 `OkMallangBRegular`이며, `.ttf`의 PostScript 이름(`OkMallangB-Regular`)과 달라도 된다(expo-font는 `useFonts`에 넘긴 키로 찾는다).
- 굵기는 폰트 패밀리를 바꿔서 표현한다(`YdestreetB` / `YdestreetL` / `OkMallangBRegular`). `fontWeight`, `font-bold` 금지.
- 크기는 `typography.ts`의 Tailwind 토큰(`Heading/H1`–`H5`, `Body/XL`–`XXS`, 줄간격 160%)을 쓴다. 원시 `fontSize` 금지(아래 예외 제외).

## 실기기에서 확인된 버그

**`font-ok-mallang-b` Tailwind 클래스로 Ok Mallang B를 적용하지 않는다.** NativeWind v4의 CSS→RN 스타일 변환이 `className` 경로에서 이 폰트를 조용히 떨어뜨린다(Android 실기기, 하이픈 유무와 무관하게 재현). 같은 문자열을 `style={{ fontFamily: fontFamily.okMallangB }}`로 주면 정상 렌더된다. 항상 `style` prop으로 적용한다 — 인라인 스타일 금지 규칙의 의도된 예외다(Reanimated 예외와 같은 위치).

## 예외: 크기 토큰 없음 + 텍스트 스트로크

Ok Mallang B는 Figma `Heading/*`·`Body/*` 스타일에 없어서 `typography.ts`에 크기 토큰이 없고, 지금까지의 모든 Figma 인스턴스에 **텍스트 스트로크(외곽선)** 가 있다. Figma 코드젠(`get_design_context`)은 스트로크를 내보내지 않아 스트로크 없는 텍스트처럼 보이므로 신뢰하지 않는다.

- 사용할 때마다 **해당 인스턴스의 정확한 크기와 스트로크(유무·색·두께)를 Figma 노드 스크린샷으로 확인**한다. 다른 인스턴스 값을 재사용하지 않는다.
- 확인된 값: `display.title`(Ready?/Game Over, 40px)은 얇은 pink-200 스트로크, `display.score`(HUD 기록, 28px)는 굵은 검정(`default/black` `#1D1D1D`) 스트로크, 일회성 로고 텍스트(`Choose Your Mode` 50px, `Luvin's Inferno` 24px)는 아주 얇은 pink-200 스트로크.
- RN `Text`에는 스트로크 속성이 없다. `src/components/ui/ok-mallang-b-text.tsx`(`OkMallangBText`)가 스트로크 색 복사본 8장을 방향별로 오프셋해 깔고 그 위에 채움색 1장을 올린다. 일반 `Text`처럼 여러 줄 줄바꿈이 된다. (`react-native-svg`의 `Text`는 줄바꿈에 `tspan` 수동 배치가 필요해 채택하지 않았다. 픽셀 단위로 정확한 스트로크 접합이 필요해지면 재검토.)
- 토큰이 없으므로 이곳에서만 원시 `fontSize`/스트로크 값 쌍을 인라인으로 쓸 수 있다. 같은 크기+스트로크 조합이 2곳 이상에서 쓰이면 `typography.ts`의 `display` 객체에 이름 있는 토큰(`fill`/`stroke.color`/`stroke.width`)으로 추가한다.
- `Text` 컴포넌트의 `display-title`/`display-score` 변형은 이미 `OkMallangBText`와 `display.*` 토큰을 쓴다. 두 토큰과 정확히 일치하면 `OkMallangBText`를 직접 부르지 말고 그 변형을 쓴다.
- 스트로크 없는 단순 텍스트는 `typography.ts`의 `okMallangBStyle` / `okMallangBTitleStyle`을 `style`로 적용한다.
