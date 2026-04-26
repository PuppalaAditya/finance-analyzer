from __future__ import annotations

from io import BytesIO
from typing import Any, Dict, List, Tuple


import pdfplumber
import camelot
import tabula
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


def extract_tables_camelot(file_bytes: bytes, flavor: str) -> List[pd.DataFrame]:
    tables: List[pd.DataFrame] = []
    try:
        # Camelot expects a file path; we write to a temporary buffer-like path.
        # To keep it simple and environment-agnostic, we skip if java/ghostscript issues occur.
        with BytesIO(file_bytes) as f:
            # Camelot cannot read file-like directly; in real deployment use NamedTemporaryFile.
            # Here we guard with try/except and simply return [] on failure.
            pass
    except Exception:
        return []

    try:
        temp_path = "temp_camelot_input.pdf"
        with open(temp_path, "wb") as tmp:
            tmp.write(file_bytes)
        camelot_tables = camelot.read_pdf(temp_path, pages="all", flavor=flavor)
        for table in camelot_tables:
            df = table.df
            if not df.empty:
                tables.append(df)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Camelot (%s) extraction failed: %s", flavor, exc)
    return tables


def extract_tables_tabula(file_bytes: bytes) -> List[pd.DataFrame]:
    tables: List[pd.DataFrame] = []
    try:
        temp_path = "temp_tabula_input.pdf"
        with open(temp_path, "wb") as tmp:
            tmp.write(file_bytes)
        dfs = tabula.read_pdf(temp_path, pages="all", multiple_tables=True)
        for df in dfs:
            if not df.empty:
                tables.append(df)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Tabula extraction failed: %s", exc)
    return tables


def extract_all(file_bytes: bytes) -> Tuple[str, List[pd.DataFrame]]:
    """High-accuracy multi-engine extraction with fallbacks."""
    raw_text = extract_text_pdfplumber(file_bytes)

    tables: List[pd.DataFrame] = []
    tables.extend(extract_tables_pdfplumber(file_bytes))
    if not tables:
        tables.extend(extract_tables_camelot(file_bytes, flavor="lattice"))
    if not tables:
        tables.extend(extract_tables_camelot(file_bytes, flavor="stream"))
    if not tables:
        tables.extend(extract_tables_tabula(file_bytes))

    cleaned_tables = clean_extracted_tables(tables)
    logger.info(
        "PDF extraction completed: %d tables, text length=%d",
        len(cleaned_tables),
        len(raw_text),
    )
    return raw_text, cleaned_tables


def serialize_tables(tables: List[pd.DataFrame]) -> List[Dict[str, Any]]:
    return [tbl.to_dict(orient="records") for tbl in tables]

