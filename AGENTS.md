# Repository Guidelines

## Project Structure & Module Organization

This package is a small TypeScript library for DOM-based WordPress routing. Source lives in `lib/`, with the public entry point in `lib/index.ts`, router behavior in `lib/wp-router.ts`, and shared types in `lib/interfaces/`. Build output goes to `dist/` and should not be edited by hand. Release automation is handled by `.github/workflows/release.yml` and `.releaserc`; package metadata and scripts are in `package.json`.

## Build, Test, and Development Commands

- `npm run build` removes `dist/` and compiles TypeScript with declarations and source maps.
- `npm run build:production` compiles with `tsconfig.production.json` and disables source maps.
- `npm run watch` runs TypeScript in watch mode after clearing `dist/`.
- `npm run lint` runs ESLint over `lib/*.ts`.
- `npm test` runs the Jest test suite.

The planned Rollup migration should preserve declarations and add explicit multi-target outputs, for example CommonJS and ESM bundles from the same `lib/index.ts` entry.

## Coding Style & Naming Conventions

Use TypeScript with strict mode enabled. Formatting is controlled by Prettier: single quotes, trailing commas, and `printWidth: 150`. ESLint uses `@typescript-eslint` plus Prettier integration. Keep exported interfaces in `lib/interfaces/`, name interface files with the existing `*.interface.ts` pattern, and prefer named exports through `lib/index.ts`.

## Testing Guidelines

For behavior changes, add focused Jest tests first and wire them into `npm test` if needed. Verify changes with `npm run lint`, `npm test`, and the relevant build commands. For Rollup work, inspect generated artifacts to confirm each target resolves and includes type declarations.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits such as `fix: Dependency tuneup` and `chore(ci): Update GitHub Actions versions and runner`. Use concise subjects with an appropriate type (`fix`, `chore`, `feat`, etc.). Pull requests should describe the change, link the beads issue, list verification commands, and note any packaging or release impact.

## Agent-Specific Instructions

This repository uses `bd` (beads) for issue tracking. Run `bd prime` for workflow context, create or claim an issue before code changes, and close it when finished. Use `bd remember` for durable project knowledge; do not add memory files. Avoid interactive shell prompts: use `cp -f`, `mv -f`, `rm -f`, `rm -rf`, `ssh -o BatchMode=yes`, and similar non-interactive flags. Before ending a work session with changes, run quality gates, commit, `git pull --rebase`, `bd dolt push`, `git push`, and confirm `git status` is clean and up to date.
