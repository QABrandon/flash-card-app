import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizCard from '../QuizCard';

// A sample card used across tests
const CARD = {
  id: 1,
  front: 'What is a closure?',
  back: 'A function that retains access to its outer scope.',
};

// Helper: render QuizCard with sensible defaults, override any prop via the spread
function renderQuizCard(props = {}) {
  return render(
    <QuizCard
      card={CARD}
      index={0}
      total={3}
      deckName="JavaScript Basics"
      revealed={false}
      onReveal={vi.fn()}
      onNext={vi.fn()}
      {...props}
    />
  );
}

describe('QuizCard', () => {
  it('renders the question text', () => {
    renderQuizCard();
    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
  });

  it('shows the progress counter', () => {
    renderQuizCard({ index: 0, total: 3 });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('does not render the answer when revealed is false', () => {
    renderQuizCard({ revealed: false });
    expect(
      screen.queryByText('A function that retains access to its outer scope.')
    ).not.toBeInTheDocument();
  });

  it('renders the answer when revealed is true', () => {
    renderQuizCard({ revealed: true });
    expect(
      screen.getByText('A function that retains access to its outer scope.')
    ).toBeInTheDocument();
  });

  it('calls onReveal when Show Answer is clicked', () => {
    const onReveal = vi.fn();
    renderQuizCard({ revealed: false, onReveal });
    fireEvent.click(screen.getByRole('button', { name: 'Show Answer' }));
    expect(onReveal).toHaveBeenCalledOnce();
  });

  it('calls onNext when Next is clicked', () => {
    const onNext = vi.fn();
    renderQuizCard({ revealed: true, onNext });
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
