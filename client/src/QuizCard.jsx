import PropTypes from 'prop-types';

// QuizCard displays one flashcard in quiz mode.
// It receives all data and callbacks as props — no internal state.
export default function QuizCard({ card, index, total, deckName, revealed, onReveal, onNext }) {
  return (
    <div className="quiz-card">
      {/* Header: deck name on the left, progress counter on the right */}
      <div className="quiz-header">
        <span>{deckName}</span>
        <span className="quiz-progress">
          {index + 1} / {total}
        </span>
      </div>

      <div className="quiz-question">{card.front}</div>

      {/* Only show the answer after the user asks for it */}
      {revealed && <div className="quiz-answer">{card.back}</div>}

      {revealed ? (
        <button className="quiz-next" onClick={onNext}>
          Next →
        </button>
      ) : (
        <button className="quiz-reveal" onClick={onReveal}>
          Show Answer
        </button>
      )}
    </div>
  );
}

QuizCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number,
    front: PropTypes.string,
    back: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  deckName: PropTypes.string.isRequired,
  revealed: PropTypes.bool.isRequired,
  onReveal: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};
