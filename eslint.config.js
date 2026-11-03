// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/** react-native 에서 가져오면 안 되는 것 — AGENTS.md §15 · §10. */
const REACT_NATIVE_IMPORT_BANS = {
  name: 'react-native',
  importNames: ['Animated', 'Image'],
  message: 'Animated 는 react-native-reanimated, Image 는 expo-image 를 쓴다 (AGENTS.md §10 · §15).',
};

/** MMKV 는 src/lib/storage.ts 래퍼로만 쓴다 — AGENTS.md §12 · §15. */
const MMKV_IMPORT_BAN = {
  name: 'react-native-mmkv',
  message: 'MMKV 는 src/lib/storage.ts 래퍼로만 쓴다 (AGENTS.md §12).',
};

module.exports = defineConfig([
  expoConfig,
  {
    // ios/ · android/ 는 prebuild 산출물, api-generated.ts 는 openapi-typescript 산출물이다.
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'src/types/api-generated.ts'],
  },
  {
    // @typescript-eslint 플러그인은 eslint-config-expo 가 TS 파일에만 붙인다.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    rules: {
      'no-console': 'warn',
      'no-restricted-imports': ['error', { paths: [REACT_NATIVE_IMPORT_BANS, MMKV_IMPORT_BAN] }],
    },
  },
  {
    // src/lib/ 만 MMKV 를 직접 쓸 수 있다.
    files: ['src/lib/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: [REACT_NATIVE_IMPORT_BANS] }],
    },
  },
]);
