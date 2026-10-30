import re

FILLER_WORDS = {
    "um", "uh", "like", "basically", "actually", "literally",
    "you know", "i mean", "sort of", "kind of", "stuff", "things",
}


def compute_metrics(answer: str) -> dict:
    text = answer.lower()
    words = re.findall(r"[a-zA-Z']+", text)
    word_count = len(words)

    filler_count = 0
    for filler in FILLER_WORDS:
        filler_count += len(re.findall(rf"\b{re.escape(filler)}\b", text))

    ratio = round(filler_count / word_count, 3) if word_count else 0.0
    return {"word_count": word_count, "filler_words": filler_count, "filler_ratio": ratio}


def clamp_score(value, low: float = 0.0, high: float = 10.0) -> float:
    try:
        return round(max(low, min(high, float(value))), 1)
    except (TypeError, ValueError):
        return 0.0


def clean_list(items, limit: int = 6) -> list[str]:
    """Normalize an LLM-produced list: strings only, trimmed, deduped, capped."""
    if not isinstance(items, list):
        return []
    seen, out = set(), []
    for item in items:
        s = str(item).strip()
        if s and s.lower() not in seen:
            seen.add(s.lower())
            out.append(s)
    return out[:limit]














