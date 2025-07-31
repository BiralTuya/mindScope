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

    function getIQValue(percentage: number) {
        // Map percentage to IQ (simple linear scale, 70-145)
        // 0% = 70, 100% = 145
        return Math.round(70 + (percentage / 100) * 75)
    }

    function getIQDescription(iq: number) {
        if (iq >= 140) return "Genius or near genius";
        if (iq >= 130) return "Very superior intelligence";
        if (iq >= 120) return "Superior intelligence";
        if (iq >= 110) return "High average intelligence";
        if (iq >= 90) return "Average intelligence";
        if (iq >= 80) return "Low average intelligence";
        if (iq >= 70) return "Borderline impaired";
        return "Extremely low intelligence";
    }

    function getPersonalityTraits(iq: number) {
        if (iq >= 140) return "Highly creative, visionary, strong problem-solving skills, often curious and independent thinker.";
        if (iq >= 130) return "Analytical, quick learner, enjoys intellectual challenges, often innovative.";
        if (iq >= 120) return "Logical, good memory, adapts well to new situations, detail-oriented.";
        if (iq >= 110) return "Practical, reliable, good at understanding complex ideas, sociable.";
        if (iq >= 90) return "Balanced, cooperative, steady, values routine and stability.";
        if (iq >= 80) return "Supportive, prefers structure, diligent, may need more time for complex tasks.";
        if (iq >= 70) return "Cautious, persistent, benefits from clear instructions, values consistency.";
        return "Needs support, benefits from guidance, values routine, may struggle with abstract concepts.";
    }
    const [current, setCurrent] = useState(0)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/questions`)
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/submit-quiz`, {
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
                        margin: "2rem auto",
                        maxWidth: 500,
                        padding: "2rem 2.5rem",
                        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                        borderRadius: "2rem",
                        border: "1px solid rgba(255,255,255,0.18)",
                        color: "#fff",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <h3 style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        marginBottom: "1.5rem",
                        letterSpacing: "0.03em",
                        textShadow: "0 2px 8px #0006"
                    }}>{questions[current].question}</h3>
                    <ul style={{ listStyle: "none", paddingLeft: 0, marginBottom: "1.5rem" }}>
                        {questions[current].options.map((opt) => (
                            <li key={opt} style={{ marginBottom: "1rem" }}>
                                <label style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "rgba(255,255,255,0.08)",
                                    borderRadius: "1rem",
                                    padding: "0.75rem 1.2rem",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
                                    transition: "background 0.2s"
                                }}>
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
                                        style={{
                                            accentColor: "#ffb347",
                                            marginRight: "1rem",
                                            width: 20,
                                            height: 20
                                        }}
                                    />
                                    <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>{opt}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: "1rem", textAlign: "right" }}>
                        {current < questions.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={
                                    !answers.find(
                                        (a) => a.question_id === questions[current].id
                                    )
                                }
                                style={{
                                    background: "linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)",
                                    color: "#222",
                                    border: "none",
                                    borderRadius: "1.5rem",
                                    padding: "0.7rem 2.2rem",
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    boxShadow: "0 2px 8px 0 #ffb34755",
                                    cursor: "pointer",
                                    opacity: !answers.find((a) => a.question_id === questions[current].id) ? 0.6 : 1,
                                    transition: "opacity 0.2s, box-shadow 0.2s"
                                }}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={submitQuiz}
                                disabled={answers.length !== questions.length}
                                style={{
                                    background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
                                    color: "#222",
                                    border: "none",
                                    borderRadius: "1.5rem",
                                    padding: "0.7rem 2.2rem",
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    boxShadow: "0 2px 8px 0 #38f9d755",
                                    cursor: "pointer",
                                    opacity: answers.length !== questions.length ? 0.6 : 1,
                                    transition: "opacity 0.2s, box-shadow 0.2s"
                                }}
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
                        margin: "2.5rem auto 0 auto",
                        maxWidth: 500,
                        padding: "2.5rem 2.5rem 2rem 2.5rem",
                        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
                        borderRadius: "2rem",
                        border: "1px solid rgba(255,255,255,0.18)",
                        color: "#222",
                        textAlign: "center"
                    }}
                >
                    <h2 style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        marginBottom: "1.5rem",
                        letterSpacing: "0.04em",
                        textShadow: "0 2px 8px #fff6"
                    }}>Your Score</h2>
                    <p style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8 }}>
                        {result.score} out of {result.total} correct
                    </p>
                    <p style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#1e3c72", marginBottom: 8 }}>
                        IQ Value: {getIQValue(result.percentage)}
                    </p>
                    <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>
                        {getIQDescription(getIQValue(result.percentage))}
                    </p>
                    <p style={{ marginTop: "1.2rem", fontSize: "1.1rem", background: "rgba(255,255,255,0.25)", borderRadius: "1rem", padding: "1rem 1.2rem", fontWeight: 500 }}>
                        <span style={{ fontWeight: "bold", color: "#1e3c72" }}>Personality Traits:</span> {getPersonalityTraits(getIQValue(result.percentage))}
                    </p>
                </div>
            )}
        </div>
    )
}
