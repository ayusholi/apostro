// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Module boundaries (INFRASTRUCTURE-DESIGN.md §4) are enforced here as
      // modules/* are added — no rule needed yet with zero feature modules.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      // The logger (shared/logger.ts) is the only sanctioned output; a bare
      // console.* bypasses redaction and structured correlation.
      'no-console': 'warn',
    },
  },
  {
    // Scaffolded modules (FOLDER-STRUCTURE.md §3): service/repository
    // methods are `async ... : Promise<never>` stubs that only
    // `AppError.notImplemented()` until each module gets its Prisma slice.
    // `async` is correct here — it's what the real implementation will be,
    // and callers rely on it returning a genuine Promise
    // (`@typescript-eslint/await-thenable`) — so silence the complementary
    // `require-await`, which would otherwise want the `async` removed.
    files: ['src/modules/**/*.service.ts', 'src/modules/**/*.repository.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  eslintConfigPrettier,
);
