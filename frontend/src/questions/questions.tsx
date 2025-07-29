import { useEffect, useState } from "react"

interface Question {
    id: number
    question: string
    options: string[]
    correct_answer: string
}

interface AnswerSubmission {
    question_id: number
    selected: string
}

export default function Questions() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<AnswerSubmission[]>([])
    const [result, setResult] = useState<{
        score: number
        total: number
        percentage: number
    } | null>(null)
    const [current, setCurrent] = useState(0)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        fetch("http://localhost:8000/questions")
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    function handleSelect(questionId: number, option: string) {
        setAnswers((prev) => {
            const otherAnswers = prev.filter(
                (a) => a.question_id !== questionId
            )
            return [
                ...otherAnswers,
                { question_id: questionId, selected: option },
            ]
        })
    }

    async function submitQuiz() {
        const response = await fetch("http://localhost:8000/submit-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers }),
        })

        if (response.ok) {
            const data = await response.json()
            setResult(data)
            setSubmitted(true)
        } else {
            alert("Error submitting quiz")
        }
    }

    function handleNext() {
        setCurrent((prev) => prev + 1)
    }

    if (loading) return <p>Loading questions...</p>

    return (
        <div>
            {!submitted && questions.length > 0 && (
                <div
                    key={questions[current].id}
                    style={{
                        marginBottom: "1.5rem",
                        padding: "1rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                    }}
                >
                    <h3>{questions[current].question}</h3>
                    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                        {questions[current].options.map((opt) => (
                            <li key={opt}>
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${questions[current].id}`}
                                        value={opt}
                                        checked={
                                            answers.find(
                                                (a) => a.question_id === questions[current].id
                                            )?.selected === opt
                                        }
                                        onChange={() => handleSelect(questions[current].id, opt)}
                                    />{" "}
                                    {opt}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: "1rem" }}>
                        {current < questions.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={
                                    !answers.find(
                                        (a) => a.question_id === questions[current].id
                                    )
                                }
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={submitQuiz}
                                disabled={answers.length !== questions.length}
                            >
                                Submit Quiz
                            </button>
                        )}
                    </div>
                </div>
            )}

            {result && submitted && (
                <div
                    style={{
                        marginTop: "2rem",
                        padding: "1rem",
                        backgroundColor: "#13932aff",
                        borderRadius: "8px",
                    }}
                >
                    <h2>Your Score</h2>
                    <p>
                        {result.score} out of {result.total} correct
                    </p>
                    <p>Percentage: {result.percentage}%</p>
                </div>
            )}
        </div>
    )
}
