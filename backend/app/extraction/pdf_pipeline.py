from __future__ import annotations

from io import BytesIO
from typing import Any, Dict, List, Tuple


import pdfplumber
import pandas as pd

from ..utils.logger import get_logger
from .table_cleaner import clean_extracted_tables


logger = get_logger(__name__)


def extract_text_pdfplumber(file_bytes: bytes) -> str:
    """Extract raw text using pdfplumber."""
    text_parts: List[str] = []
    try:
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
    except Exception as exc:  # noqa: BLE001
        logger.error("pdfplumber text extraction failed: %s", exc)
    return "\n".join(text_parts).strip()


def extract_tables_pdfplumber(file_bytes: bytes) -> List[pd.DataFrame]:
    tables: List[pd.DataFrame] = []
    try:
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_tables = page.extract_tables()
                for tbl in page_tables:
                    df = pd.DataFrame(tbl)
                    if not df.empty:
                        tables.append(df)
    except Exception as exc:  # noqa: BLE001
        logger.warning("pdfplumber extraction failed: %s", exc)
    return tables


def extract_all(file_bytes: bytes) -> Tuple[str, List[pd.DataFrame]]:
    """High-accuracy extraction using pdfplumber."""
    raw_text = extract_text_pdfplumber(file_bytes)

    tables: List[pd.DataFrame] = []
    tables.extend(extract_tables_pdfplumber(file_bytes))

    cleaned_tables = clean_extracted_tables(tables)
    logger.info(
        "PDF extraction completed: %d tables, text length=%d",
        len(cleaned_tables),
        len(raw_text),
    )
    return raw_text, cleaned_tables


def serialize_tables(tables: List[pd.DataFrame]) -> List[Dict[str, Any]]:
    return [tbl.to_dict(orient="records") for tbl in tables]

