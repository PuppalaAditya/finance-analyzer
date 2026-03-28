from __future__ import annotations

from typing import List

import pandas as pd

from ..utils.logger import get_logger


logger = get_logger(__name__)


def _fix_headers(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    # Use first non-empty row as header if current headers look generic (0,1,2,...)
    if all(isinstance(col, int) for col in df.columns):
        first_row = df.iloc[0]
        if first_row.notna().sum() >= 1:
            df = df[1:]
            df.columns = first_row
            df = df.reset_index(drop=True)
    df.columns = [str(c).strip() for c in df.columns]
    return df


def _drop_empty_rows_and_cols(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(how="all")
    df = df.dropna(axis=1, how="all")
    return df


def _deduplicate_columns(df: pd.DataFrame) -> pd.DataFrame:
    seen = {}
    new_cols = []
    for col in df.columns:
        base = col
        if base not in seen:
            seen[base] = 0
            new_cols.append(base)
        else:
            seen[base] += 1
            new_cols.append(f"{base}_{seen[base]}")
    df.columns = new_cols
    return df


def _fix_numeric_formatting(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.columns:
        series = df[col]
        if series.dtype == object:
            cleaned = series.astype(str).str.replace(",", "", regex=False).str.strip()
            # Convert obvious numeric columns
            if cleaned.str.fullmatch(r"-?\d+(\.\d+)?").mean() > 0.5:  # type: ignore[arg-type]
                df[col] = pd.to_numeric(cleaned, errors="coerce")
    return df


def _merge_broken_rows(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    # Heuristic: if a row has all NaNs except first column, and next row has NaNs in first column, merge them.
    rows_to_drop = []
    for i in range(len(df) - 1):
        row = df.iloc[i]
        next_row = df.iloc[i + 1]
        if (
            row.notna().sum() == 1
            and not pd.isna(row.iloc[0])
            and pd.isna(next_row.iloc[0])
        ):
            merged = next_row.copy()
            merged.iloc[0] = f"{row.iloc[0]} {next_row.iloc[0]}".strip()
            df.iloc[i + 1] = merged
            rows_to_drop.append(i)
    if rows_to_drop:
        df = df.drop(index=rows_to_drop)
        df = df.reset_index(drop=True)
    return df


def clean_extracted_tables(tables: List[pd.DataFrame]) -> List[pd.DataFrame]:
    cleaned: List[pd.DataFrame] = []
    for idx, table in enumerate(tables):
        try:
            df = table.copy()
            df = _fix_headers(df)
            df = _drop_empty_rows_and_cols(df)
            df = _merge_broken_rows(df)
            df = _deduplicate_columns(df)
            df = _fix_numeric_formatting(df)
            if not df.empty:
                cleaned.append(df)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to clean table %d: %s", idx, exc)
    return cleaned

