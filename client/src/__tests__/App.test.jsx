import { render, screen, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import App from '../App';

const MOCK_DECKS = [
  { id: 1, name: 'JavaScript Basics', cardCount: 3 },
  { id: 2, name: 'React Hooks', cardCount: 2 },
];

describe('App', () => {
  beforeEach(() => {
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
});
