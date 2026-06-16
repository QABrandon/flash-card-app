import { useState, useEffect } from 'react';
import QuizCard from './QuizCard';

export default function App() {
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetch('/api/decks')
      .then((r) => r.json())
      .then(setDecks);
  }, []);

  function selectDeck(deck) {
    setSelectedDeck(deck);
    // Always exit quiz when switching decks
    setQuizMode(false);
    setCurrentIndex(0);
    setRevealed(false);
    setCards([]); // clear stale cards while new deck loads
    fetch(`/api/decks/${deck.id}/cards`)
      .then((r) => r.json())
      .then(setCards);
  }

  function startQuiz() {
    if (cards.length === 0) return;
    setCurrentIndex(0);
    setRevealed(false);
    setQuizMode(true);
  }

  function handleNext() {
    // Move to next card and hide the answer again
    setCurrentIndex((i) => i + 1);
    setRevealed(false);
  }

  function exitQuiz() {
    setQuizMode(false);
    setCurrentIndex(0);
    setRevealed(false);
  }

  return (
    <div className="app">
      <h1>FlashCards</h1>
      <div className="layout">
        <aside>
          <h2>Decks</h2>
          <ul>
            {decks.map((deck) => (
              <li key={deck.id}>
                <button
                  className={selectedDeck?.id === deck.id ? 'active' : ''}
                  onClick={() => selectDeck(deck)}
                >
                  {deck.name}
                  <span className="count">{deck.cardCount}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          {selectedDeck ? (
            <>
              {quizMode ? (
                // Quiz is active — show one card at a time or the done screen
                currentIndex >= cards.length ? (
                  <div className="quiz-done">
                    <p>🎉</p>
                    <p className="quiz-done-title">Done!</p>
                    <p className="quiz-done-sub">You went through all {cards.length} cards.</p>
                    <button className="quiz-back" onClick={exitQuiz}>
                      ↩ Back to Deck
                    </button>
                  </div>
                ) : (
                  <QuizCard
                    card={cards[currentIndex]}
                    index={currentIndex}
                    total={cards.length}
                    deckName={selectedDeck.name}
                    revealed={revealed}
                    onReveal={() => setRevealed(true)}
                    onNext={handleNext}
                  />
                )
              ) : (
                // Normal browse view — card grid with a Start Quiz button
                <>
                  <h2>{selectedDeck.name}</h2>
                  <button className="quiz-start" onClick={startQuiz} disabled={cards.length === 0}>
                    Start Quiz
                  </button>
                  <div className="cards">
                    {cards.map((card) => (
                      <div key={card.id} className="card">
                        <p className="front">
                          <strong>Q:</strong> {card.front}
                        </p>
                        <p className="back">
                          <strong>A:</strong> {card.back}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="placeholder">Select a deck to view its cards.</p>
          )}
        </main>
      </div>
    </div>
  );
}
