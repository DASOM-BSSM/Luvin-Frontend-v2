# AGENTS.md

Luvin is a mobile-based bread-themed AI dating simulation app. Core concept: **"Love is all about timing"** — users' romantic tendencies are analyzed and expressed as bread types, and an AI avatar ("분신") that mirrors the user's personality participates in a dating simulation.

This repository is `luvin-frontend-v2` — a fresh Expo SDK 57 rewrite. Follow the conventions in this file when creating new files rather than inferring them from the codebase.

> ## ALWAYS READ FIRST BEFORE STARTING ANY TASK
>
> 1. Read **§9 Directory Architecture** before writing any code
> 2. Read the **Figma design** before implementing any UI — do NOT assume or hardcode design values
> 3. Check `package.json` for exact dependency versions before installing anything
> 4. Use **`pnpm`** — not npm/yarn/bun
> 5. Before reporting a task done, run `pnpm typecheck && pnpm lint` (§5)

## Detail lives in skills / docs

Load these when the task touches the area — they are not repeated here:

| Task | Skill / doc |
| --- | --- |
| Ok Mallang B text, text stroke, font registration | `.claude/skills/typography-ok-mallang` |
| `useQuery`/`useMutation`, loading/error/empty states, toast, error copy | `.claude/skills/data-fetching-states` |
| Login, tokens, deep links, push, crash reporting, analytics | `.claude/skills/auth-push-observability` |
| axios, `openapi.json`, generated types, API functions | `.claude/skills/api-integration` |
| Prettier / husky / test / CI setup (not done yet) | `docs/tooling-roadmap.md` |
| AGENTS.md audit | `.claude/skills/review-agents-md` |

**Keeping this file accurate:** update AGENTS.md in the same PR only when a change makes a statement here wrong — a dependency added/removed (§2), a path or script name referenced here renamed, or a convention changed. Do not touch it for other changes, and do not add current-state facts that can be read from the repo (`package.json`, the file tree).

---

# 1. Platform Principles

- Targets: iOS and Android, with identical UX and behavior. Avoid platform-specific styles/logic unless strictly necessary (e.g. SafeArea padding)
- `expo-dev-client` with native code — **not Expo Go**. `pnpm ios` / `pnpm android` (`expo run:*`) prebuild and build; `pnpm start` only starts the bundler and needs an installed dev client build
- **`ios/` and `android/` are gitignored generated output** — never edit them; native config belongs in `app.json` or a config plugin
- Adding a library with native code requires a rebuild — say so when you add one

# 2. Tech Stack

> Verify exact versions in `package.json`. Do not upgrade packages without confirmation.

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

## Ask before adding

Check `package.json` for what is installed. Never add on your own initiative: formatter/hooks (§5), test tooling (§6), push notifications, crash reporting, analytics SDKs, toast libraries (build in-house), or icon packages.

`app.json` enables `experiments.typedRoutes` and `experiments.reactCompiler`:

- Route paths are type-checked — use typed hrefs, never cast to `any`
- The React Compiler handles memoization — do NOT add `useMemo` / `useCallback` / `memo` without a measured reason

# 3. Package & Dependency Rules

- `pnpm` only (lockfile: `pnpm-lock.yaml`). Add packages with `pnpm expo install <package-name>` for SDK compatibility
- Do not upgrade versions or add a dependency that is not in `package.json` or listed in §2 without asking
- If a package is missing or versions conflict, report it and ask before resolving
- Commit `pnpm-lock.yaml` together with any `package.json` change

# 4. Environment Variables

- `.env.example` is the committed template; `.env.local` / `.env.development` are never committed (`.gitignore` excludes `.env*` except the template)
- Only `EXPO_PUBLIC_`-prefixed variables reach the client, via `process.env.EXPO_PUBLIC_*`. **They are embedded in the bundle and readable by anyone** — never put a secret, private key, or OAuth client secret there
- Add every new key to `.env.example` (empty/placeholder value) in the same change
- `.env.example` still has an unused `VITE_API_URL` — a leftover; ask before removing it
- `EXPO_PUBLIC_USE_MOCK` must be empty/`false` before any distributed build (TestFlight, Play testing, store)
- Never read, print, or commit `.env*` files or `*.jks` keystores in the repo root

# 5. Quality Gate

Lint rules live in `eslint.config.js`. Formatter and pre-commit hooks are a pending decision — see `docs/tooling-roadmap.md`; follow the style of existing files (single quotes, semicolons, 2-space indent, width 100).

Before reporting any code change done, run and report the result honestly:

```bash
pnpm typecheck && pnpm lint
```

Rules not machine-enforced (inline styles, manual memoization, margin/padding, etc., §16) hold by review. Do not run `pnpm lint` flows that scaffold/install packages without asking.

# 6. Testing

**There is deliberately no automated test suite in v2 MVP** (screens churn with Figma). Do NOT add `jest`, `jest-expo`, `@testing-library/react-native`, Detox, or Maestro without explicit approval. Safety net: strict TypeScript + lint + manual verification.

- Manually verify every UI change on iOS and Android, and **state which platforms you actually ran**. If you could not run the app, say so plainly — never imply it was verified
- Keep pure logic out of components so tests are cheap later: survey scoring, bread-type calculation, matching rules, date/text formatting → pure functions in `src/features/<feature>/utils/` or `src/lib/`. No business logic in JSX or `useEffect`; no hooks/navigation/storage inside those functions

# 7. CI

CI lives in `.eas/workflows/`; PR CI is a pending decision (`docs/tooling-roadmap.md`). Do not add native builds or EAS Build to PR CI without asking.

---

# 8. Design System

> **All design values (colors, spacing, typography, radius, …) come from Figma.** Do NOT hardcode or assume tokens.

- Token values (hex, px) live **only** in `src/constants/colors.ts` and `src/constants/typography.ts`. `tailwind.config.js` `require`s them into `theme.extend` — no literal values there
- `src/constants/theme.ts` re-exports both as `theme`, for the rare JS-style-value case
- If a token is missing, read it from Figma and add it to the constants file first, then use it
- Figma source: file **"Luvin-Design"** — `Color system` variable collection, `Heading/*` / `Body/*` text styles. **Never hardcode the Figma file key** — ask the user for it before querying

## Light mode only

`src/app/_layout.tsx` pins `colorScheme.set('light')` (Figma has no dark palette). No `dark:` variants or theme toggle until a dark palette lands in Figma.

## Figma MCP rules

- Read the Figma design before implementing any screen/component; if unavailable, **ask before proceeding**
- If Figma MCP returns a localhost URL for an image/SVG, use the same asset from `src/assets/images`
- No new icon packages and no placeholder assets — use the actual Figma assets
- Figma MCP needs authorization; if it is unauthenticated, tell the user to authorize it instead of guessing values. Specify `fileKey` and `node-id` separately. Never commit API tokens (they expire every 90 days)

## Typography

| Font | Registered family | Usage |
| --- | --- | --- |
| `Yde street B` | `YdestreetB` | Headlines, brand, display |
| `Yde street L` | `YdestreetL` | Body, descriptions |
| `Ok Mallang B` | `OkMallangBRegular` | 러빈지옥 titles / emphasis copy |

- No other fonts. Weight is expressed by **switching family** — never `fontWeight` / `font-bold`
- Use the Tailwind `fontSize`/`fontFamily` tokens from `typography.ts` (`Heading/H1`–`H5`, `Body/XL`–`XXS`) — no raw `fontSize`
- **Ok Mallang B: never use the `font-ok-mallang-b` class (NativeWind drops it) — apply it via `style`; it has no size token and carries a text stroke.** Read `.claude/skills/typography-ok-mallang` before using it, and check size + stroke in Figma for each instance
- No space in font filenames; the `useFonts` key and `typography.ts` `fontFamily` must be the identical string (details in the skill)

---

# 9. Directory Architecture

> Place files exactly as described. Do not create new top-level directories without confirmation.

All source lives under `src/`, including routes. Static app assets (icon, splash) stay in root `assets/`.

```
src/
├── app/           # Expo Router routes only (_layout.tsx with ErrorBoundary, (tabs)/, …)
├── assets/        # fonts/, icons/ (SVG components from Figma), images/
├── components/    # shared domain components; ui/ = domain-agnostic (Button, Text, Skeleton, …)
├── constants/     # colors.ts, typography.ts, theme.ts, error-messages.ts
├── hooks/         # common hooks
├── features/<feature>/   # api/ components/ hooks/ lib/ store/ types/ utils/ (create as needed)
├── lib/           # http-client.ts, query-client.ts, storage.ts (MMKV wrapper), …
├── providers/     # ONLY providers with real logic (query, toast)
└── types/         # global types; api-generated.ts is auto-generated
```

Font loading and `colorScheme` live directly in `src/app/_layout.tsx`; a theme/font provider was deliberately removed — do not reintroduce one. Add to `src/providers/` only for providers with real logic, mounted in `_layout.tsx`. Create folders in place when first needed; do not invent another layout.

## Import alias

`@/*` maps to the **project root**, not `src/` — always use absolute `@/` imports, never `../../` climbing:

```ts
import Button from '@/src/components/ui/button';
```

## Placement rules

| Situation | Location |
| --- | --- |
| Reusable across any domain | `src/components/ui/` |
| Shared but domain-specific | `src/components/` |
| One feature only | `src/features/<feature>/components/` |
| API calls / query keys | `src/features/<feature>/api/` |
| Zustand store / types / pure logic | `src/features/<feature>/store/` · `types/` · `utils/` |
| Routes | `src/app/` only — no screen files under `src/features/` |

# 10. Component-First Development

Before developing any page:

1. Identify reusable UI elements shared across pages and build them in `src/components/ui/` first
2. Identify all image/illustration assets and implement each as a component
3. Check `src/components/ui/` and `src/features/<feature>/components/` for an existing component — never duplicate

- Every image/SVG is a React component: copy SVG from Figma into `src/assets/icons/`; bitmaps use `expo-image`'s `Image` (not `react-native`'s). Never use a raw `<Image>` with a file path in a page. Naming: `<BreadCharacter type="salt" />`
- Checklist: shared UI exists · assets wrapped as components · loading/error/empty handled (`data-fetching-states` skill) · no hardcoded design values · no duplicates

---

# 15. Coding Rules

- Functional components, hooks, explicit types (`strict: true`)
- `export default function Name() {}` for components. Exceptions: `forwardRef` (`const Name = forwardRef(...)` + separate export); small internal helpers may be `const` arrows
- Style with NativeWind `className`; keep `babel.config.js` / `metro.config.js` NativeWind v4 config (`jsxImportSource: "nativewind"`, `withNativeWind({ input: "./global.css" })`)
- Async state through TanStack Query — no `useEffect` + `useState` fetching
- Persisted local state through the MMKV wrapper only; never secrets
- Animations with `react-native-reanimated` v4 — never `Animated` from `react-native`
- **Preserve all existing comments and docstrings**

# 16. Avoid Patterns

- `any` type — define proper interfaces in the feature's `types/`
- `margin`/`padding` — use `gap` or `h-{}` spacer views
- Components over 150 lines — split into hook/component files
- `React.[module]` — import directly (`import { useState } from 'react'`)
- Inline functions — use named handlers `handle{Target}{Event}`
- Inline styles and `StyleSheet.create` — **allowed only for**: Reanimated animated styles, Ok Mallang B (`fontFamily`, stroke), and values with no Tailwind equivalent that you have checked first
- `relative`/`absolute` layout — use flex classes (exception: overlays/stacking with no flex equivalent, e.g. the `OkMallangBText` stroke layers)
- Hardcoded design values, or hex/px literals in `tailwind.config.js`, components, or style objects
- `dark:` variants, `fontWeight` / `font-bold`
- Manual `useMemo` / `useCallback` / `memo` (React Compiler is on)
- `console.log` in committed code (use crash reporting once installed)
- Success-path-only screens; `Alert.alert` for validation/success (use a toast); raw server errors, stack traces, or status codes shown to users
- Tokens or secrets in MMKV, persisted Zustand, `.env`, logs
- Editing `ios/` / `android/`; installing packages from §2's "Not installed" list on your own initiative
- Claiming a change was verified on device when you did not run it (§6)

> Existing code may still contain inline `style={{}}`, `useMemo`/`useCallback` and `console.*` that predate these rules. Do not copy them into new code; clean them up only when touching that code.

# 17. Git Conventions

See `CONTRIBUTING.md` for the full table.

- Branch: `<type>/<jira-number>` → `feat/LUV-26`
- Commit: `<type>(<jira-number>) :: 변경 사항 요약` → `chore(LUV-26) :: 커밋 컨벤션 추가`
- Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `delete`, `build`; subject ≤ 50 chars; body optional, wrap at 72
- Ask before committing or pushing; never commit directly to `main`
- Once a pre-commit hook exists, do not bypass it with `--no-verify`
