from typing import Any, Dict

from fastapi import APIRouter, Body

from ..utils.logger import get_logger


router = APIRouter()
logger = get_logger(__name__)


@router.post("/analyze")
async def analyze_report(
    payload: Dict[str, Any] = Body(
        ...,
        example={
            "raw_text": "...",
            "tables": [[{"col1": "v1"}]],
            "metrics": {"revenue": 1000.0},
        },
    )
):
    """
    Deprecated: AI analysis is now performed during /upload to keep Gemini calls
    to a single request per PDF. This endpoint is kept for backwards
    compatibility but returns a simple placeholder.
    """
    logger.info("Deprecated /analyze called; returning placeholder response")
    return {"analysis": {"summary": "Use /upload for AI analysis.", "key_insights": [], "risks": [], "recommendations": []}}

