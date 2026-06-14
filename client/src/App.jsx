import { useState, useEffect } from 'react';

export default function App() {
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch('/api/decks')
      .then((r) => r.json())
      .then(setDecks);
  }, []);

  function selectDeck(deck) {
    setSelectedDeck(deck);
    fetch(`/api/decks/${deck.id}/cards`)
      .then((r) => r.json())
      .then(setCards);
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
              <h2>{selectedDeck.name}</h2>
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
          ) : (
            <p className="placeholder">Select a deck to view its cards.</p>
          )}
        </main>
      </div>
    </div>
  );
}
