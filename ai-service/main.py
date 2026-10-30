import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.llm.client import LLMError
from app.routers import questions, evaluation

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title="Interview Prep AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(LLMError)
async def llm_error_handler(request: Request, exc: LLMError):
    return JSONResponse(status_code=502, content={"detail": str(exc)})


app.include_router(questions.router)
app.include_router(evaluation.router)


@app.get("/health")
async def health():
    return {"status": "ok", "model": settings.llm_model}