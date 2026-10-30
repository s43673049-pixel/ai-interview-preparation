from fastapi import APIRouter, Depends, Header, HTTPException

from app.config import settings
from app.schemas import QuestionRequest, QuestionResponse
from app.services.question_service import generate_questions


def verify_internal_key(x_api_key: str = Header(default="")):
    """Optional shared-secret check so only the Node backend can call this service."""
    if settings.internal_api_key and x_api_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


router = APIRouter(dependencies=[Depends(verify_internal_key)])


@router.post("/generate-questions", response_model=QuestionResponse)
async def generate(req: QuestionRequest):
    questions = await generate_questions(req)
    return QuestionResponse(questions=questions)