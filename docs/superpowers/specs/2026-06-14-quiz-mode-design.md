# Quiz Mode — Design Spec

**Date:** 2026-06-14
**Status:** Approved

## Overview

Add a quiz mode to the flashcard app. When a user selects a deck, they can start a focused quiz that shows one card at a time — question first, answer hidden until revealed, then advance to the next card. No scoring. When all cards are done, a completion screen appears with an option to return to the deck view.

## User Flow

1. User selects a deck → sees the card grid as before, plus a **"Start Quiz"** button at the top of the main panel.
2. User clicks "Start Quiz" → quiz mode activates. The card grid is replaced by a single-card quiz view.
3. Quiz view shows: deck name, progress counter (e.g. "1 / 3"), and the **question only**.
4. User clicks **"Show Answer"** → the answer appears below the question. The button changes to **"Next →"**.
5. User clicks "Next →" → advances to the next card. Answer hides again.
6. After the last card, clicking "Next →" → shows a **done screen** ("You went through all N cards." + "Back to Deck" button).
7. User clicks "Back to Deck" → quiz mode exits, card grid returns.
8. Switching to a different deck while in quiz mode resets quiz state and exits quiz mode.

## Components

### `QuizCard.jsx` (new)

Single-purpose component responsible for rendering one card in quiz mode.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `card` | `{ id, front, back }` | The current card to display |
| `index` | `number` | 0-based index of current card |
| `total` | `number` | Total number of cards in the deck |
| `deckName` | `string` | Displayed in the header |
| `revealed` | `boolean` | Whether the answer is showing |
| `onReveal` | `() => void` | Called when user clicks "Show Answer" |
| `onNext` | `() => void` | Called when user clicks "Next →" |
| `onExit` | `() => void` | Called when user clicks "Back to Deck" (done screen only) |

QuizCard does not fetch data or manage state — it is purely a display component driven by props from App.

### `App.jsx` (modified)

Gains three new state variables:

```js
const [quizMode, setQuizMode] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
const [revealed, setRevealed] = useState(false);
```

**Behaviour changes:**

- When a deck is selected, a "Start Quiz" button appears at the top of `<main>`.
- Clicking it sets `quizMode = true`, `currentIndex = 0`, `revealed = false`.
- When `quizMode` is true and `currentIndex < cards.length`, renders `<QuizCard>`.
- When `quizMode` is true and `currentIndex >= cards.length`, renders the done screen inline.
- `selectDeck()` resets all three quiz state variables in addition to fetching cards.

## Styling (`App.css`)

New classes added:

- `.quiz-card` — white panel, border, border-radius, padding. Contains all quiz content.
- `.quiz-progress` — small text showing "1 / 3", right-aligned.
- `.quiz-question` — highlighted box (light blue background) for the question text.
- `.quiz-answer` — highlighted box (light green background) for the answer text.
- `.quiz-done` — centered completion screen with emoji, message, and back button.

Existing `.card` and `.cards` styles are unchanged.

## Testing

Tests are written before implementation (TDD).

### `QuizCard` unit tests (`client/src/__tests__/QuizCard.test.jsx`)

- Renders the question text
- Does not render the answer when `revealed` is false
- Renders the answer when `revealed` is true
- Calls `onReveal` when "Show Answer" is clicked
- Calls `onNext` when "Next →" is clicked
- Shows progress counter ("1 / 3")

### `App` unit tests (additions to `client/src/__tests__/App.test.jsx`)

- "Start Quiz" button appears after selecting a deck
- "Start Quiz" button is not visible before a deck is selected
- Clicking "Start Quiz" shows the quiz view (QuizCard rendered)
- Switching decks while in quiz mode exits quiz mode and shows the card grid

## Constraints

- Test-first (TDD). Tests come first, always.
- Validate frontend inputs. Required fields, types, length limits, basic format checks.
- Write for a junior-to-mid dev. Clear and conventional over clever.
- (Optional) Why-comments. Short explanations where they help a beginner.
- Validation: Zod at the API route boundary (when added).
- Tests: Vitest; API routes via Supertest on an in-memory SQLite DB (when added).
- E2E: Playwright, in /e2e (CI, not pre-commit).
- Errors: Return `{ error: { code, message } }`; 404 for unknown routes/resources.
- Pre-commit: Runs lint + unit + API tests. Never bypass with --no-verify.

## Out of Scope

- Scoring or right/wrong tracking
- Card shuffle / randomisation
- Animations (flip effect)
- Routing changes (no React Router added)
- Backend changes (no new API routes)
