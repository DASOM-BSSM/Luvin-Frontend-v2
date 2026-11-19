# Tooling Roadmap (lint · format · test · CI)

AGENTS.md §4(품질 게이트·테스트·CI)에서 분리한 목표 구성이다. 사용자가 승인했을 때만 진행한다.

## 현재 상태

- ESLint: 설치·설정 완료 (`eslint`, `eslint-config-expo`, `eslint.config.js`). `no-explicit-any`(error), `no-console`(warn), `react-native`의 `Animated`/`Image` import 금지, `src/lib/` 밖 `react-native-mmkv` import 금지가 적용되어 있다.
- 스크립트: `typecheck`, `lint`, `lint:fix`가 있다. `format`, `format:check`는 없다.
- Prettier: **미설치, 설정 없음.** `prettier-plugin-tailwindcss`는 devDependencies에 있지만 `prettier` 없이는 동작하지 않는다.
- husky / lint-staged: 없음. `.github/`: 없음.
- EAS: `.eas/workflows/release.yml`(릴리스)만 있고 PR CI는 없다.

## 목표: 포맷·훅

1. 설치: `prettier`, `husky`, `lint-staged`.
2. `.prettierrc` — `plugins: ["prettier-plugin-tailwindcss"]`, 기존 `src/` 코드에 맞춰 **작은따옴표, 세미콜론, 2칸 들여쓰기, `printWidth: 100`**.
3. 스크립트 추가: `format`, `format:check`.
4. `husky` + `lint-staged` pre-commit: 프로젝트 전체 `tsc --noEmit`, 스테이징 파일에 `eslint --fix` + `prettier --write`.
5. `git commit --no-verify`로 훅을 우회하지 않는다.

`.vscode/settings.json`은 이미 `source.fixAll` 저장 시 실행을 켜 두었다.

## 테스트 (현재는 의도적으로 없음)

v2 MVP는 자동화 테스트 스위트를 두지 않기로 **명시적으로 결정**했다(출시 전이고 화면이 Figma에서 계속 바뀌어 UI 테스트가 잡아내는 것보다 더 자주 다시 쓰이게 된다). 안전망은 `strict` TypeScript + lint + 양 플랫폼 수동 검증이다. 승인 없이 `jest`, `jest-expo`, `@testing-library/react-native`, Detox, Maestro를 추가하지 않는다.

켜게 될 때의 형태:

| 계층 | 도구 | 범위 |
| --- | --- | --- |
| Unit | `jest-expo` + `@testing-library/react-native` | 순수 로직 우선(채점, 매칭), 그다음 `src/components/ui/` 공용 UI |
| E2E | Maestro (`.maestro/`의 YAML 플로우) | 온보딩 → 로그인 → 설문 → 결과 |

단위 테스트는 대상 코드 옆 `__tests__/`에 둔다. 커버리지 수치를 목표로 하지 않고 채점·매칭 규칙과 인증 플로우를 다룬다.

## CI 목표

`.github/workflows/ci.yml`, `main` 대상 PR에서 실행:

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm format:check`

- Node·pnpm 버전은 로컬(`.nvmrc`)과 맞춘다. `--frozen-lockfile`이므로 `pnpm-lock.yaml`은 항상 `package.json`과 함께 커밋한다.
- 테스트 잡은 테스트가 켜지기 전까지 없다.
- PR CI에 네이티브 빌드나 EAS Build를 묻지 않고 추가하지 않는다(느리고 과금된다).
- 브랜치 보호에서 CI 체크를 필수로 걸도록 사용자에게 요청한다. pre-commit 훅은 편의 기능이고 실제 게이트는 CI다.
