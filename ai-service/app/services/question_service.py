from app.llm.client import complete_json, LLMError
from app.prompts import QUESTION_SYSTEM, QUESTION_USER
from app.schemas import QuestionRequest
from app.services.nlp_utils import clean_list


async def generate_questions(req: QuestionRequest) -> list[str]:
    user_prompt = QUESTION_USER.format(
        count=req.count,
        role=req.role,
        difficulty=req.difficulty,
        topics=", ".join(req.topics) if req.topics else "none specified (general for the role)",
    )

    data = await complete_json(QUESTION_SYSTEM, user_prompt, max_tokens=1500, temperature=0.8)
    questions = clean_list(data.get("questions"), limit=req.count)

    if not questions:
        raise LLMError("Model returned no questions")
    return questions