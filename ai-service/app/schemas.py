from typing import List, Literal
from pydantic import BaseModel, Field


class QuestionRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=100)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    count: int = Field(5, ge=1, le=15)
    topics: List[str] = Field(default_factory=list, max_length=10)


class QuestionResponse(BaseModel):
    questions: List[str]


class EvaluateRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=1000)
    answer: str = Field(..., min_length=1, max_length=5000)
    role: str = Field(..., min_length=2, max_length=100)


class Metrics(BaseModel):
    word_count: int
    filler_words: int
    filler_ratio: float


class EvaluateResponse(BaseModel):
    score: float = Field(..., ge=0, le=10)
    feedback: str
    strengths: List[str]
    improvements: List[str]
    keywords_matched: List[str]
    metrics: Metrics