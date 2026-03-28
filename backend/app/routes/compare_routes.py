from typing import Any, Dict, List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
import pandas as pd

from ..extraction.pdf_pipeline import extract_all
from ..extraction.financial_parser import parse_financial_metrics
from ..services.document_compare import compare_reports
from ..utils.logger import get_logger


router = APIRouter()
logger = get_logger(__name__)


@router.post("/compare")
async def compare_financial_reports(
    company_a: str = Form(...),
    company_b: str = Form(...),
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
):
    for f in (file_a, file_b):
        if f.content_type not in ("application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content_a = await file_a.read()
        content_b = await file_b.read()

        a_text, a_tables_df = extract_all(content_a)
        b_text, b_tables_df = extract_all(content_b)

        a_metrics = parse_financial_metrics(a_text, a_tables_df)
        b_metrics = parse_financial_metrics(b_text, b_tables_df)

        result = compare_reports(
            company_a_name=company_a,
            a_text=a_text,
            a_tables=a_tables_df,
            a_metrics=a_metrics,
            company_b_name=company_b,
            b_text=b_text,
            b_tables=b_tables_df,
            b_metrics=b_metrics,
        )
        return result
    except Exception as exc:  # noqa: BLE001
        logger.error("Comparison failed: %s", exc)
        raise HTTPException(status_code=500, detail="Comparison failed.") from exc

