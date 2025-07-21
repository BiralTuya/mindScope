from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    options = Column(String, nullable=False)  # JSON string of options
    correct_answer = Column(String, nullable=False)
