from app.llm.client import complete_json
from app.prompts import EVALUATION_SYSTEM, EVALUATION_USER
from app.schemas import EvaluateRequest, EvaluateResponse, Metrics
from app.services.nlp_utils import clamp_score, clean_list, compute_metrics


async def evaluate_answer(req: EvaluateRequest) -> EvaluateResponse:
    user_prompt = EVALUATION_USER.format(role=req.role, question=req.question, answer=req.answer)

    # Low temperature: scoring should be consistent between runs
    data = await complete_json(EVALUATION_SYSTEM, user_prompt, max_tokens=900, temperature=0.2)

    metrics = compute_metrics(req.answer)

    return EvaluateResponse(
        score=clamp_score(data.get("score")),
        feedback=str(data.get("feedback", "")).strip(),
        strengths=clean_list(data.get("strengths")),
        improvements=clean_list(data.get("improvements")),
        keywords_matched=clean_list(data.get("keywords_matched"), limit=10),
        metrics=Metrics(**metrics),
    )
