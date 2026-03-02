# CLAUDE.md — Wordless Codebase Guide

## Project Overview

**Wordless** (package name: `wordle-solve`) is a React + TypeScript single-page application that helps users solve Wordle puzzles. Users enter their guess letters and click/keyboard-cycle each tile through colour states (grey/yellow/green); the app then filters a word dictionary and suggests the best next guess using information-theoretic entropy.

- **Stack:** React 18, TypeScript 5, Vite 5, Bootstrap 5 / react-bootstrap 2
- **Test runner:** Vitest (Jest-compatible API)
- **Deployed to:** GitHub Pages (`dist/` folder, CI via `.github/workflows/static.yml`)
- **No backend / API.** All processing is client-side.

---

## Essential Commands

```bash
# Development
npm run dev            # Vite dev server at http://localhost:3000

# Build
npm run build          # tsc + vite build → dist/

# Testing
npm test               # Vitest interactive watch mode
npm run test:coverage  # Single run with v8 coverage report

# Linting / formatting
npm run lint           # ESLint (max 7 warnings allowed)
npm run lint:fix       # ESLint with --fix
```

> **Node version:** `.tool-versions` specifies Node 20.18.1. `.nvmrc` says 18.0.0 (legacy—prefer `.tool-versions`).

---

## Repository Layout

```
wordless/
├── public/               # Static assets (favicon, manifest, logos)
├── src/
│   ├── App.tsx           # Root component — layout, word-length selector, help toggle
│   ├── board.tsx         # Board, WordGrid, WordRow, LetterTile, keyboard/event wiring
│   ├── keyboard.tsx      # On-screen keyboard display
│   ├── word-results.tsx  # Displays count/list of matching words
│   ├── word-guess-state.tsx  # useWordGuessState hook — grid state management
│   ├── position-utils.tsx    # Grid navigation helpers (moveUp/Down/Left/Right)
│   ├── help.tsx          # Help modal content
│   ├── solver.ts         # Core algorithm — see section below
│   ├── dictionary.ts     # ~1.7 MB embedded word dictionary string
│   ├── answers.ts        # Re-exports answer lists indexed by word length
│   ├── answers_5.ts      # 5-letter Wordle answer list
│   ├── App.css           # Dark-theme styles, grid/tile layout using CSS vars
│   ├── index.css         # Global resets
│   ├── index.tsx         # React entry point
│   ├── setupTests.ts     # jest-dom matchers setup (used by Vitest)
│   ├── typings.d.ts      # Module augmentations
│   └── *.test.{ts,tsx}   # Test files co-located with source
├── .github/workflows/static.yml  # Deploy dist/ to GitHub Pages
├── vite.config.ts        # Build + test configuration
├── tsconfig.json         # Strict TypeScript for src/
├── tsconfig.node.json    # TypeScript for vite.config.ts
├── .eslintrc.cjs         # ESLint rules
└── .prettierrc           # Prettier config
```

---

## Core Algorithm (`src/solver.ts`)

This is the most important file in the project. Understand it before touching anything related to word filtering or suggestions.

### Key Types

```typescript
enum GuessResult {
  UNKNOWN = 'BLACK',   // tile not yet evaluated
  ABSENT  = 'GREY',    // letter not in word
  PRESENT = 'YELLOW',  // letter in word, wrong position
  CORRECT = 'GREEN',   // letter in correct position
}

type LetterGuess = Readonly<{ letter: string; result: GuessResult }>;
type WordGuess   = readonly LetterGuess[];
```

### Key Exports

| Function | Purpose |
|---|---|
| `parseGuess(str)` | Parses shorthand strings like `"=S+EA+RCH"` into `WordGuess` |
| `buildMatchState(guesses, wordLength)` | Accumulates correct/present/absent constraints |
| `buildMatcher(guesses, wordLength)` | Produces a `RegExp` using lookahead assertions |
| `findWords(guesses, wordLength)` | Scans dictionary string for all matching words |
| `findAnswers(guesses, wordLength)` | Same, but scans the answer list only |
| `findBestGuess(guesses, wordLength)` | Returns highest-entropy next guess |
| `isWord(word)` | Checks if a string appears in the dictionary |

### Guess shorthand syntax (used in tests and `parseGuess`)

Modifiers precede the letter they apply to:

| Char | Meaning |
|---|---|
| `=` | CORRECT (green) |
| `+` | PRESENT (yellow) |
| _(none)_ | ABSENT (grey) |

Example: `"=S+EA+RCH"` → S correct, E present, A absent, R present, C absent, H absent.

### Entropy-based best-guess selection (`findBestGuess`)

1. Find all still-possible answers (`findAnswers`).
2. For each candidate word in the full dictionary, simulate its result against every possible answer.
3. Group results by outcome pattern string; compute Shannon entropy: `H = -Σ p·log₂(p)`.
4. Return the candidate with the highest entropy (maximally splits the remaining answer space).

**Known limitation (see TODO in source):** Multiple occurrences of the same PRESENT letter are not handled correctly in `buildMatcher`.

---

## State Management

The grid state lives in `useWordGuessState` (`src/word-guess-state.tsx`). It exposes a `WordGuessState` object consumed by `board.tsx`. There is no global store (no Redux, no Context for game state). State is local to the `Board` component.

Changing `wordLength` in `App.tsx` resets the entire board via React's `key` prop:
```tsx
<Board key={wordLength} wordLength={wordLength} />
```

---

## UI Interaction Model

- **Click a tile once** → focus/select it.
- **Click same tile again / press Space** → cycle colour: UNKNOWN → ABSENT → PRESENT → CORRECT → UNKNOWN.
- **Press `=` / `+` / `-` / `_`** → jump directly to CORRECT / PRESENT / ABSENT / UNKNOWN.
- **Type a letter** → fill tile, advance right.
- **Arrow keys** → navigate grid (page scroll suppressed).
- **Backspace** → clear letter, move left.
- **Enter** → submit row.
- **"Add Best Guess" button** → fills the next empty row with the entropy-optimal word.

---

## Code Conventions

### Naming

- **Components:** PascalCase (`Board`, `WordGrid`, `LetterTile`)
- **Hooks:** `use` prefix (`useWordGuessState`)
- **Utilities / pure functions:** camelCase (`buildMatcher`, `findBestGuess`)
- **Files:** match their primary export name (`board.tsx`, `word-guess-state.tsx`, `position-utils.tsx`)

### TypeScript

- Strict mode is on (`strict: true`, `noUnusedLocals`, `noUnusedParameters`).
- Prefer `Readonly<{}>` and `readonly` arrays for immutable data structures.
- Avoid `any`; the `@typescript-eslint/recommended-requiring-type-checking` ruleset is active.
- Unused variables are a **warning** if they start with `_`, otherwise an **error**.

### React patterns

- All components are functional.
- Inline prop interfaces are acceptable for small components.
- Co-locate event handlers as named functions or constants above the JSX that uses them (see `tileKeyHandler`, `tileClickHandler` in `board.tsx`).
- CSS custom properties (`--row-count`, `--column-count`) are set via inline style for grid layout.

### Styling

- Dark theme implemented in `App.css`.
- Bootstrap utility classes are used for layout (`d-flex`, `justify-content-center`, `mt-3`).
- Tile colours are driven by the `data-color` attribute (CSS attribute selectors in `App.css`).

### Formatting (Prettier)

- 2-space indentation
- Single quotes
- Trailing commas (ES5)
- 100-character line width

---

## Testing

Test files live next to the source files they test (`*.test.ts` / `*.test.tsx`).

| Test file | What it covers |
|---|---|
| `solver.test.ts` | `buildMatcher`, `findWords`, `findAnswers`, `findBestGuess` |
| `parseGuess.test.ts` | `parseGuess` shorthand parsing |
| `findWords.test.ts` | Word-matching integration |
| `dictionary.test.ts` | Dictionary content sanity checks |
| `App.test.tsx` | Basic component render smoke test |

Vitest is configured in `vite.config.ts` (`test.globals: true`, `environment: 'jsdom'`). Jest globals (`describe`, `it`, `expect`) are available without imports. The `@testing-library/jest-dom` matchers are registered in `src/setupTests.ts`.

**Run before every commit:**

```bash
npm test          # all tests pass
npm run lint      # zero errors, ≤7 warnings
```

A `lint-staged` pre-commit hook runs `eslint --fix` on staged `.ts`/`.tsx` files automatically.

---

## Build & Deployment

- `npm run build` runs `tsc` (type-check only; emits nothing) then `vite build` → `dist/`.
- The Vite base is `'./'` (relative paths) for GitHub Pages compatibility.
- `.github/workflows/static.yml` deploys the `dist/` directory to GitHub Pages on every push to `main`. **The workflow does not build**; the `dist/` folder must be committed or generated before deployment.

---

## Known TODOs (from source comments)

- Filter word choices using an in-progress (unfinished) guess row.
- Allow clicking a match to use it as the next guess.
- Add a help popup / modal.
- Add a "game mode" where the app picks the answer and scores guesses.
- `buildMatcher` does not correctly handle multiple occurrences of the same PRESENT letter.
