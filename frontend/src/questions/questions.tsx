import React, { useEffect, useState } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
}

interface AnswerSubmission {
  question_id: number;
  selected: string;
}

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<AnswerSubmission[]>([]);
  const [result, setResult] = useState<{score: number; total: number; percentage: number} | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // When user selects an option for a question
  function handleSelect(questionId: number, option: string) {
    setAnswers((prev) => {
      const otherAnswers = prev.filter(a => a.question_id !== questionId);
      return [...otherAnswers, { question_id: questionId, selected: option }];
    });
  }

  async function submitQuiz() {
    const response = await fetch("http://localhost:8000/submit-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (response.ok) {
      const data = await response.json();
      setResult(data);
    } else {
      alert("Error submitting quiz");
    }
  }

  if (loading) return <p>Loading questions...</p>;

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "1.5rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3>{q.question}</h3>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {q.options.map((opt) => (
              <li key={opt}>
                <label>
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt}
                    checked={answers.find(a => a.question_id === q.id)?.selected === opt}
                    onChange={() => handleSelect(q.id, opt)}
                  />
                  {" "}{opt}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button onClick={submitQuiz} disabled={answers.length !== questions.length}>
        Submit Quiz
      </button>

      {result && (
        <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#13932aff", borderRadius: "8px" }}>
          <h2>Your Score</h2>
          <p>
            {result.score} out of {result.total} correct
          </p>
          <p>Percentage: {result.percentage}%</p>
        </div>
      )}
    </div>
  );
}
