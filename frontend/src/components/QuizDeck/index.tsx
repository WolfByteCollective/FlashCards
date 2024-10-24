import { useState } from "react";
import "./styles.scss";

interface QuizProps {
  cards: { front: string; back: string; hint: string }[];
}

export default function Quiz({ cards }: QuizProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false); // Track quiz completion

  const currentCard = cards[currentCardIndex];
  const options = shuffleOptions(cards, currentCard?.back);

  function shuffleOptions(cards: QuizProps["cards"], correctAnswer: string) {
    const otherOptions = cards
      .map((card) => card.back)
      .filter((answer) => answer !== correctAnswer);
    const shuffled = [correctAnswer, ...otherOptions.slice(0, 3)].sort(
      () => Math.random() - 0.5
    );
    return shuffled;
  }

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    const correct = option === currentCard.back;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);

    // Move to the next card or end the quiz after a delay
    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);

      if (currentCardIndex + 1 < cards.length) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setIsQuizFinished(true); // End the quiz if no more cards are left
      }
    }, 1000);
  };

  const restartQuiz = () => {
    setCurrentCardIndex(0);
    setScore(0);
    setIsQuizFinished(false);
  };

  if (isQuizFinished) {
    return (
      <div className="quiz-summary">
        <h2>Quiz Complete!</h2>
        <p>Your Score: {score} / {cards.length}</p>
        <button className="btn btn-primary" onClick={restartQuiz}>
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2>{currentCard.front}</h2>
      <div className="options">
        {options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${
              selectedOption === option
                ? isCorrect
                  ? "correct"
                  : "incorrect"
                : ""
            }`}
            onClick={() => handleOptionClick(option)}
            disabled={!!selectedOption}
          >
            {option}
          </button>
        ))}
      </div>
      <p>Score: {score}</p>
      <p>
        Question {currentCardIndex + 1} / {cards.length}
      </p>
    </div>
  );
}
