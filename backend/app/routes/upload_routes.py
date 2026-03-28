from fastapi import APIRouter, File, UploadFile, HTTPException

from ..extraction.pdf_pipeline import extract_all, serialize_tables
from ..extraction.financial_parser import parse_financial_metrics
from ..services.financial_analysis import generate_ai_financial_analysis
from ..utils.dashboard_store import append as store_append
from ..utils.helpers import sanitize_for_json
from ..utils.logger import get_logger


router = APIRouter()
logger = get_logger(__name__)


@router.post("/upload")
async def upload_financial_report(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
        raw_text, tables = extract_all(content)
        parsed_metrics = parse_financial_metrics(raw_text, tables)

        ai_result = generate_ai_financial_analysis(raw_text, tables, parsed_metrics)
        merged_metrics = ai_result.get("metrics", parsed_metrics)
        analysis = ai_result.get("analysis")

        store_append(file.filename or "report.pdf", merged_metrics, analysis)
        payload = {
            "filename": file.filename,
            "raw_text": raw_text,
            "tables": serialize_tables(tables),
            "metrics": merged_metrics,
            "analysis": analysis,
        }
        return sanitize_for_json(payload)
    except Exception as exc:  # noqa: BLE001
        logger.error("Upload processing failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to process PDF.") from exc

