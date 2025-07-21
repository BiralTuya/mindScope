import models
from fastapi import FastAPI
import database
from fastapi.middleware.cors import CORSMiddleware
from models import Question
from pydantic import BaseModel
from database import SessionLocal
import json
from sqlalchemy.orm import Session
from fastapi import Depends
from typing import List

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello"}

@app.get("/api/hello")
def say_hello():
    return {"message": "Hello from FastAPI!"}

class IQQuestionCreate(BaseModel):
    question: str
    options: list[str]
    correct_answer: str

@app.post("/questions")
def create_question(iq: IQQuestionCreate):
    db = SessionLocal()
    db_iq = Question(
        question=iq.question,
        options=json.dumps(iq.options),
        correct_answer=iq.correct_answer,
    )
    db.add(db_iq)
    db.commit()
    db.refresh(db_iq)
    db.close()
    return {"message": "Question created!", "id": db_iq.id}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/questions")
def get_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return [
        {
            "id": q.id,
            "question": q.question,
            "options": json.loads(q.options)
        }
        for q in questions
    ]

class AnswerSubmission(BaseModel):
    question_id: int
    selected: str

class QuizSubmission(BaseModel):
    answers: List[AnswerSubmission]
@app.post("/submit-quiz")
def submit_quiz(submission: QuizSubmission, db: Session = Depends(get_db)):
    score = 0
    total = len(submission.answers)

    for ans in submission.answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        if question and question.correct_answer == ans.selected:
            score += 1

    return {    
        "score": score,
        "total": total,
        "percentage": round((score / total) * 100, 2)
    }

