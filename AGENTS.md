# AGENTS.md

Luvin is a mobile-based bread-themed AI dating simulation app. Core concept: **"Love is all about timing"** — users' romantic tendencies are analyzed and expressed as bread types, and an AI avatar ("분신") that mirrors the user's personality participates in a dating simulation.

This repository is `luvin-frontend-v2` — a fresh Expo SDK 57 rewrite. Follow the conventions in this file when creating new files rather than inferring them from the codebase.

> ## ALWAYS READ FIRST BEFORE STARTING ANY TASK
>
> 1. Read **§6 Directory Architecture** before writing any code
> 2. Read the **Figma design** before implementing any UI — do NOT assume or hardcode design values
> 3. Check `package.json` for exact dependency versions before installing anything
> 4. Use **`pnpm`** — not npm/yarn/bun
> 5. Before reporting a task done, run `pnpm typecheck && pnpm lint` (§4)

Detailed rules live in skills under `.claude/skills/` (typography/Ok Mallang B, data fetching and loading/error/empty states, auth/push/crash reporting, API integration) — load the matching one when the task touches that area. Tooling not yet set up (formatter, hooks, tests, PR CI) is in `docs/tooling-roadmap.md`.

**Keeping this file accurate:** update AGENTS.md in the same PR only when a change makes a statement here wrong — a dependency added/removed (§2), a path or script name referenced here renamed, or a convention changed. Do not touch it for other changes, and do not add current-state facts that can be read from the repo (`package.json`, the file tree).

---

# 1. Platform Principles

- Targets: iOS and Android, with identical UX and behavior. Avoid platform-specific styles/logic unless strictly necessary (e.g. SafeArea padding)
- `expo-dev-client` with native code — **not Expo Go**. `pnpm ios` / `pnpm android` (`expo run:*`) prebuild and build; `pnpm start` only starts the bundler and needs an installed dev client build
- **`ios/` and `android/` are gitignored generated output** — never edit them; native config belongs in `app.json` or a config plugin
- Adding a library with native code requires a rebuild — say so when you add one

# 2. Tech Stack & Packages

> Verify exact versions in `package.json`.

| Category | Library |
| --- | --- |
| Framework / routing | `expo` (SDK 57), `expo-router` (file-based, `src/app/`) |
| Runtime | `react-native`, `react`, `typescript` (strict) |
| Styling | `nativewind` v4 (Tailwind CSS v3) |
| Global state | `zustand` (in-memory) |
| Async state | `@tanstack/react-query` |
| HTTP | `axios` — single instance in `src/lib/http-client.ts` |
| Local storage | `react-native-mmkv` — non-sensitive only, via `src/lib/storage.ts` |
| Secure storage | `expo-secure-store` — tokens only, via `src/features/auth/lib/token-storage.ts` |
| Animation | `react-native-reanimated` v4 (+ `react-native-worklets`) |
| Native UI | `@expo/ui`, `expo-glass-effect` — prefer over reimplementing native looks |
| Auth | Google (`@react-native-google-signin`) and Apple (`expo-apple-authentication`); no separate sign-up |
| Deep linking | `expo-linking`, scheme `luvinfrontendv2` |

`app.json` enables `experiments.typedRoutes` and `experiments.reactCompiler`:

- Route paths are type-checked — use typed hrefs, never cast to `any`
- The React Compiler handles memoization — do NOT add `useMemo` / `useCallback` / `memo` without a measured reason

## Package rules

- `pnpm` only (lockfile: `pnpm-lock.yaml`, commit it with any `package.json` change). Add packages with `pnpm expo install <package-name>`
- Do not upgrade versions, or add a dependency not already in `package.json`, without asking. If a package is missing or versions conflict, report it and ask
- Never add on your own initiative: formatter/hooks, test tooling, push notifications, crash reporting, analytics SDKs, toast libraries (build in-house), or icon packages

# 3. Environment Variables

- `.env.example` is the committed template; real `.env*` files are never committed. Never read, print, or commit `.env*` files or `*.jks` keystores in the repo root
- Only `EXPO_PUBLIC_`-prefixed variables reach the client, via `process.env.EXPO_PUBLIC_*`. **They are embedded in the bundle and readable by anyone** — never put a secret, private key, or OAuth client secret there
- Add every new key to `.env.example` (empty/placeholder value) in the same change. `VITE_API_URL` there is an unused leftover — ask before removing it
- `EXPO_PUBLIC_USE_MOCK` must be empty/`false` before any distributed build (TestFlight, Play testing, store)

# 4. Quality Gate, Testing & CI

Lint rules live in `eslint.config.js`. Before reporting any code change done, run and report the result honestly:

```bash
pnpm typecheck && pnpm lint
```

- Formatter, hooks, and PR CI are pending decisions (`docs/tooling-roadmap.md`) — follow the style of existing files (single quotes, semicolons, 2-space indent, width 100). Do not add native builds or EAS Build to PR CI without asking
- **There is deliberately no automated test suite in v2 MVP** (screens churn with Figma). Do NOT add `jest`, `jest-expo`, `@testing-library/react-native`, Detox, or Maestro without explicit approval
- Manually verify every UI change on iOS and Android, and **state which platforms you actually ran**. If you could not run the app, say so plainly — never imply it was verified
- Keep pure logic out of components so tests are cheap later: survey scoring, bread-type calculation, matching rules, date/text formatting → pure functions in `src/features/<feature>/utils/` or `src/lib/`. No business logic in JSX or `useEffect`

---

# 5. Design System

> **All design values (colors, spacing, typography, radius, …) come from Figma.** Do NOT hardcode or assume tokens.

- Token values (hex, px) live **only** in `src/constants/colors.ts` and `src/constants/typography.ts`. `tailwind.config.js` `require`s them into `theme.extend` — no literal values there. `src/constants/theme.ts` re-exports both as `theme` for the rare JS-style-value case
- If a token is missing, read it from Figma and add it to the constants file first, then use it
- Figma source: file **"Luvin-Design"** — `Color system` variable collection, `Heading/*` / `Body/*` text styles. **Never hardcode the Figma file key** — ask the user for it before querying
- **Light mode only**: `src/app/_layout.tsx` pins `colorScheme.set('light')` (Figma has no dark palette). No `dark:` variants or theme toggle until a dark palette lands in Figma

## Figma MCP rules

- Read the design before implementing any screen/component; if unavailable, **ask before proceeding**
- If Figma MCP returns a localhost URL for an image/SVG, use the same asset from `src/assets/images`. No new icon packages, no placeholder assets — use the actual Figma assets
- If the Figma MCP is unauthenticated, tell the user to authorize it instead of guessing values. Specify `fileKey` and `node-id` separately. Never commit API tokens

## Typography

| Font | Registered family | Usage |
| --- | --- | --- |
| `Yde street B` | `YdestreetB` | Headlines, brand, display |
| `Yde street L` | `YdestreetL` | Body, descriptions |
| `Ok Mallang B` | `OkMallangBRegular` | 러빈지옥 titles / emphasis copy |

- No other fonts. Weight is expressed by **switching family** — never `fontWeight` / `font-bold`. Use the Tailwind `fontSize`/`fontFamily` tokens from `typography.ts` — no raw `fontSize`
- **Ok Mallang B: never use the `font-ok-mallang-b` class (NativeWind drops it) — apply it via `style`; it has no size token and carries a text stroke.** Read the `typography-ok-mallang` skill before using it, and check size + stroke in Figma for each instance. No space in font filenames; the `useFonts` key and `typography.ts` `fontFamily` must be the identical string

---

# 6. Directory Architecture

> Place files exactly as described. Do not create new top-level directories without confirmation.

All source lives under `src/`, including routes. Static app assets (icon, splash) stay in root `assets/`. Create feature folders (`api/ components/ hooks/ lib/ store/ types/ utils/`) in place when first needed; do not invent another layout.

## Import alias

`@/*` maps to the **project root**, not `src/` — always use absolute `@/` imports, never `../../` climbing:

```ts
import Button from '@/src/components/ui/button';
```

## Placement rules

| Situation | Location |
| --- | --- |
| Routes | `src/app/` only — no screen files under `src/features/` |
| Reusable across any domain (Button, Text, Skeleton, …) | `src/components/ui/` |
| Shared but domain-specific | `src/components/` |
| One feature only | `src/features/<feature>/components/` |
| API calls / query keys | `src/features/<feature>/api/` |
| Zustand store / types / pure logic | `src/features/<feature>/store/` · `types/` · `utils/` |
| Common hooks | `src/hooks/` |
| Design tokens / error copy | `src/constants/` (`colors.ts`, `typography.ts`, `theme.ts`, `error-messages.ts`) |
| Icons / images from Figma | `src/assets/icons/` (SVG components) · `src/assets/images/` |
| Infrastructure (http, query client, MMKV wrapper) | `src/lib/` |

Font loading and `colorScheme` live directly in `src/app/_layout.tsx`; a theme/font provider was deliberately removed — do not reintroduce one. Add to `src/providers/` only for providers with real logic, mounted in `_layout.tsx`.

# 7. Component-First Development

Before developing any page: identify reusable UI shared across pages and build it in `src/components/ui/` first; identify all image/illustration assets and implement each as a component; check `src/components/ui/` and `src/features/<feature>/components/` for an existing component — never duplicate.

- Every image/SVG is a React component: copy SVG from Figma into `src/assets/icons/`; bitmaps use `expo-image`'s `Image` (not `react-native`'s). Never use a raw `<Image>` with a file path in a page. Naming: `<BreadCharacter type="salt" />`
- Handle loading, error, and empty states (`data-fetching-states` skill)

---

# 8. Coding Rules

- Functional components, hooks, explicit types (`strict: true`)
- `export default function Name() {}` for components. Exceptions: `forwardRef` (`const Name = forwardRef(...)` + separate export); small internal helpers may be `const` arrows
- Style with NativeWind `className`; keep `babel.config.js` / `metro.config.js` NativeWind v4 config (`jsxImportSource: "nativewind"`, `withNativeWind({ input: "./global.css" })`)
- Async state through TanStack Query — no `useEffect` + `useState` fetching
- Animations with `react-native-reanimated` v4 — never `Animated` from `react-native`
- **Preserve all existing comments and docstrings**

# 9. Avoid Patterns

- `any` type — define proper interfaces in the feature's `types/`
- `margin`/`padding` — use `gap` or `h-{}` spacer views
- Components over 150 lines — split into hook/component files
- `React.[module]` — import directly (`import { useState } from 'react'`)
- Inline functions — use named handlers `handle{Target}{Event}`
- Inline styles and `StyleSheet.create` — **allowed only for**: Reanimated animated styles, Ok Mallang B (`fontFamily`, stroke), and values with no Tailwind equivalent that you have checked first
- `relative`/`absolute` layout — use flex classes (exception: overlays/stacking with no flex equivalent, e.g. the `OkMallangBText` stroke layers)
- Hardcoded design values; hex/px literals in `tailwind.config.js`, components, or style objects
- `console.log` in committed code (use crash reporting once installed)
- Success-path-only screens; `Alert.alert` for validation/success (use a toast); raw server errors, stack traces, or status codes shown to users
- Tokens or secrets in MMKV, persisted Zustand, `.env`, or logs
- Claiming a change was verified on device when you did not run it (§4)

> Existing code may still contain inline `style={{}}`, `useMemo`/`useCallback` and `console.*` that predate these rules. Do not copy them into new code; clean them up only when touching that code.

# 10. Git Conventions

`CONTRIBUTING.md` is the source of truth: per-type descriptions, branch and commit message formats with examples, and the bundle version bump rules (patch/minor/major; major needs team agreement). Read it before bumping a version. Summary:

- Branch: `<type>/<jira-number>` → `feat/LUV-26` (`release` is a commit type only — not allowed as a branch type)
- Commit: `<type>(<jira-number>) :: 변경 사항 요약` → `chore(LUV-26) :: 커밋 컨벤션 추가`
- Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `delete`, `build`, `release` (bundle version bump); subject ≤ 50 chars; body optional, wrap at 72
- A `release` (version bump) commit must **always be its own standalone commit** — never mix it with other changes
- Ask before committing or pushing; never commit directly to `main`
- Once a pre-commit hook exists, do not bypass it with `--no-verify`
