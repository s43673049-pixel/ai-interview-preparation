from fastapi import APIRouter, Depends

from app.routers.questions import verify_internal_key
from app.schemas import EvaluateRequest, EvaluateResponse
from app.services.evaluation_service import evaluate_answer

router = APIRouter(dependencies=[Depends(verify_internal_key)])


@router.post("/evaluate-answer", response_model=EvaluateResponse)
async def evaluate(req: EvaluateRequest):
    return await evaluate_answer(req)