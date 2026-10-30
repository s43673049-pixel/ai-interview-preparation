import asyncio
import json
import logging
import re
from typing import Any

from google import genai
from google.genai import types as genai_types
from google.genai.errors import APIError as GeminiAPIError
from groq import AsyncGroq
from groq import APIError as GroqAPIError

from app.config import settings

logger = logging.getLogger(__name__)

_gemini = genai.Client(api_key=settings.google_api_key)
_groq = AsyncGroq(api_key=settings.groq_api_key) if settings.groq_api_key else None


class LLMError(Exception):
    """Raised when all providers fail."""


async def _call_gemini(system: str, user: str, max_tokens: int, temperature: float) -> str:
    resp = await _gemini.aio.models.generate_content(
        model=settings.gemini_model,
        contents=user,
        config=genai_types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            max_output_tokens=max_tokens,
        ),
    )
    text = resp.text
    if not text:
        reason = getattr(resp.candidates[0], "finish_reason", "unknown") if resp.candidates else "unknown"
        raise LLMError(f"Gemini returned empty response (finish_reason={reason})")
    return text


async def _call_groq(system: str, user: str, max_tokens: int, temperature: float) -> str:
    if not _groq:
        raise LLMError("Groq not configured (missing GROQ_API_KEY)")
    resp = await _groq.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    content = resp.choices[0].message.content
    if not content:
        raise LLMError("Groq returned empty response")
    return content


# Providers tried in order; each is (name, function, retryable exception types)
_PROVIDERS = [
    ("gemini", _call_gemini, (GeminiAPIError, LLMError)),
    ("groq", _call_groq, (GroqAPIError, LLMError)),
]


async def complete(system: str, user: str, max_tokens: int = 1200, temperature: float = 0.7) -> str:
    errors = []
    for name, fn, exc_types in _PROVIDERS:
        try:
            text = await fn(system, user, max_tokens, temperature)
            if name != "gemini":
                logger.warning("Served by fallback provider: %s", name)
            return text
        except exc_types as e:
            logger.warning("%s failed, trying next provider: %s", name, e)
            errors.append(f"{name}: {e}")
        except Exception as e:
            # Unexpected error type — log and still try the next provider
            logger.error("%s unexpected error: %s", name, e)
            errors.append(f"{name}: {e}")

    raise LLMError(f"All providers failed — {'; '.join(errors)}")


def extract_json(raw: str) -> Any:
    """Parse JSON even if the model wrapped it in fences or added stray text."""
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError:
                pass
    raise LLMError("Model returned invalid JSON")


async def complete_json(system: str, user: str, max_tokens: int = 1200,
                        temperature: float = 0.7, retries: int = 1) -> dict:
    """Call the provider chain and parse JSON, retrying once if the output is malformed."""
    last_err: Exception | None = None
    for attempt in range(retries + 1):
        raw = await complete(system, user, max_tokens, temperature)
        try:
            data = extract_json(raw)
            if isinstance(data, dict):
                return data
            raise LLMError("Expected a JSON object")
        except LLMError as e:
            last_err = e
            logger.warning("JSON parse failed (attempt %d): %s", attempt + 1, e)
    raise LLMError(str(last_err))