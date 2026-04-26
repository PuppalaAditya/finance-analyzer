from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..extraction.pdf_pipeline import extract_text_pdfplumber
from ..services.rag_engine import answer_with_rag
from ..utils.logger import get_logger


router = APIRouter()
logger = get_logger(__name__)


@router.post("/chat")
async def chat_with_document(
    question: str = Form(...),
    file: UploadFile = File(...),
):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
        raw_text = extract_text_pdfplumber(content)
        if not raw_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF.",
            )
        answer = answer_with_rag(question, raw_text)
        return {"answer": answer}
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.error("Chat with document failed: %s", exc)
        raise HTTPException(status_code=500, detail="Chat failed.") from exc

