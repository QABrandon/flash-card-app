import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import App from '../App';

const MOCK_DECKS = [
  { id: 1, name: 'JavaScript Basics', cardCount: 3 },
  { id: 2, name: 'React Hooks', cardCount: 2 },
];

const MOCK_CARDS_DECK1 = [
  {
    id: 1,
    deckId: 1,
    front: 'What is a closure?',
    back: 'A function that retains access to its outer scope.',
  },
  {
    id: 2,
    deckId: 1,
    front: 'What does === do?',
    back: 'Strict equality — checks value and type.',
  },
];

const MOCK_CARDS_DECK2 = [
  {
    id: 4,
    deckId: 2,
    front: 'What does useState return?',
    back: 'A state value and a setter function.',
  },
];

describe('App', () => {
  beforeEach(() => {
    // Default mock: all fetch calls return the deck list.
    // Individual tests that need card data override this with their own mock.
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(MOCK_DECKS),
    });
  });

  it('renders deck names fetched from the API', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      expect(screen.getByText('React Hooks')).toBeInTheDocument();
    });
  });

  describe('quiz mode', () => {
    it('does not show Start Quiz button before a deck is selected', async () => {
      render(<App />);
      await waitFor(() => screen.getByText('JavaScript Basics'));
      expect(screen.queryByRole('button', { name: 'Start Quiz' })).not.toBeInTheDocument();
    });

    it('shows Start Quiz button after a deck is selected', async () => {
      // First fetch = decks (on mount), second fetch = cards (on deck click)
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_DECKS) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_CARDS_DECK1) });

      render(<App />);
      await waitFor(() => screen.getByText('JavaScript Basics'));
      fireEvent.click(screen.getByText('JavaScript Basics'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeInTheDocument();
      });
    });

    it('shows the quiz view when Start Quiz is clicked', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_DECKS) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_CARDS_DECK1) });

      render(<App />);
      await waitFor(() => screen.getByText('JavaScript Basics'));
      fireEvent.click(screen.getByText('JavaScript Basics'));
      await waitFor(() => screen.getByRole('button', { name: 'Start Quiz' }));

      fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));

      // Quiz view is active: Show Answer button visible, Start Quiz button gone
      expect(screen.getByRole('button', { name: 'Show Answer' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start Quiz' })).not.toBeInTheDocument();
    });

    it('shows the done screen after the last card, then returns to deck on Back to Deck click', async () => {
      // Use a single-card deck so we can reach the done screen in one step
      const SINGLE_CARD = [
        {
          id: 4,
          deckId: 2,
          front: 'What does useState return?',
          back: 'A state value and a setter function.',
        },
      ];
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_DECKS) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(SINGLE_CARD) });

      render(<App />);
      await waitFor(() => screen.getByText('React Hooks'));
      fireEvent.click(screen.getByText('React Hooks'));
      await waitFor(() => screen.getByRole('button', { name: 'Start Quiz' }));

      // Start quiz, reveal answer, click Next → to exhaust the single card
      fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));
      fireEvent.click(screen.getByRole('button', { name: 'Show Answer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Next →' }));

      // Done screen should appear
      expect(screen.getByText('Done!')).toBeInTheDocument();

      // Back to Deck returns to browse view
      fireEvent.click(screen.getByRole('button', { name: '↩ Back to Deck' }));
      expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeInTheDocument();
      expect(screen.queryByText('Done!')).not.toBeInTheDocument();
    });

    it('exits quiz mode and shows card grid when a different deck is selected', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_DECKS) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_CARDS_DECK1) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(MOCK_CARDS_DECK2) });

      render(<App />);
      await waitFor(() => screen.getByText('JavaScript Basics'));

      // Select deck 1 and start quiz
      fireEvent.click(screen.getByText('JavaScript Basics'));
      await waitFor(() => screen.getByRole('button', { name: 'Start Quiz' }));
      fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));
      expect(screen.getByRole('button', { name: 'Show Answer' })).toBeInTheDocument();

      // Switch to deck 2 — quiz should exit
      fireEvent.click(screen.getByText('React Hooks'));
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Show Answer' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeInTheDocument();
      });
    });
  });
});
