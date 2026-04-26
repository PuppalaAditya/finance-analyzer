from __future__ import annotations

import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

from ..utils.helpers import to_float
from ..utils.logger import get_logger


logger = get_logger(__name__)

# Labels and the metric key they map to (order matters - more specific first)
_TEXT_LABEL_PATTERNS: List[Tuple[str, str]] = [
    ("total income", "revenue"),
    ("revenue from operations", "revenue"),
    ("revenue from operation", "revenue"),
    ("total revenue", "revenue"),
    ("sales", "revenue"),
    ("turnover", "revenue"),
    ("loss for the year from continuing operations after tax", "net_income"),
    ("profit for the year", "net_income"),
    ("profit after tax", "net_income"),
    ("net profit", "net_income"),
    ("pat", "net_income"),
    ("total equity", "total_equity"),
    ("total assets", "assets"),
    ("total liabilities", "liabilities"),
    ("net cash", "cash_flow"),
    ("cash flow from operating activities", "cash_flow"),
    ("operating cash flow", "cash_flow"),
    ("borrowings (other than debt securities)", "borrowings"),
    ("\ndebt securities", "debt_securities"),  # standalone row only
    ("borrowings", "total_debt"),
    ("total borrowings", "total_debt"),
    ("total debt", "total_debt"),
    ("debt to equity", "debt_to_equity"),
    ("debt/equity", "debt_to_equity"),
    ("current ratio", "current_ratio"),
    ("quick ratio", "quick_ratio"),
    ("ebitda", "ebitda"),
    ("return on equity", "roe"),
    ("return on assets", "roa"),
]


@dataclass
class FinancialMetrics:
    revenue: Optional[float] = None
    revenue_growth_pct: Optional[float] = None
    ebitda: Optional[float] = None
    ebitda_margin_pct: Optional[float] = None
    net_income: Optional[float] = None
    net_profit_margin_pct: Optional[float] = None
    assets: Optional[float] = None
    liabilities: Optional[float] = None
    cash_flow: Optional[float] = None
    total_debt: Optional[float] = None
    total_equity: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    roe_pct: Optional[float] = None
    roa_pct: Optional[float] = None


def _match_row_label(label: str) -> str:
    lower = label.lower().strip()
    if "total income" in lower or ("revenue" in lower and "from operation" in lower):
        return "revenue"
    if "revenue" in lower or "sales" in lower or "turnover" in lower:
        return "revenue"
    if "ebitda" in lower:
        return "ebitda"
    if "loss for the year" in lower and "after tax" in lower:
        return "net_income"
    if "profit for the year" in lower or "net profit" in lower or "pat" in lower:
        return "net_income"
    if "profit after tax" in lower:
        return "net_income"
    if "total equity" in lower:
        return "total_equity"
    if "total assets" in lower:
        return "assets"
    if "total liabilities" in lower:
        return "liabilities"
    if "cash flow" in lower or "net cash" in lower:
        return "cash_flow"
    if "borrowings" in lower or "total debt" in lower:
        return "total_debt"
    if "debt to equity" in lower or "debt/equity" in lower:
        return "debt_to_equity"
    if "current ratio" in lower:
        return "current_ratio"
    if "quick ratio" in lower or "acid-test" in lower:
        return "quick_ratio"
    if "roe" in lower or "return on equity" in lower:
        return "roe"
    if "roa" in lower or "return on assets" in lower:
        return "roa"
    if "ebitda margin" in lower:
        return "ebitda_margin"
    if "net margin" in lower or "net profit margin" in lower:
        return "net_profit_margin"
    if "growth" in lower and "revenue" in lower:
        return "revenue_growth"
    return ""


def _parse_first_number_after(text: str, start: int) -> Optional[float]:
    """Find the first substantial number (skip note refs like 16, 17) in text."""
    rest = text[start : start + 300]
    for m in re.finditer(r"\(?([\d,]+(?:\.\d+)?)\)?", rest):
        raw = m.group(0)
        neg = raw.startswith("(")
        cleaned = raw.replace(",", "").strip("()")
        try:
            v = float(cleaned)
            if 0 < v < 50 and "." not in cleaned and int(v) == v:
                continue  # Skip note refs (e.g. 16, 17)
            return -v if neg else v
        except ValueError:
            continue
    return None


def _extract_from_text(text: str, metrics: FinancialMetrics) -> None:
    """Parse metrics from raw extracted text (Indian P&L, balance sheet format)."""
    text_lower = text.lower()
    debt_components: List[float] = []

    for pattern, key in _TEXT_LABEL_PATTERNS:
        idx = text_lower.find(pattern)
        if idx < 0:
            continue
        # Skip "total equity" when it's part of "total liabilities and equity"
        if key == "total_equity":
            ctx = text_lower[max(0, idx - 5) : idx + len(pattern) + 20]
            if "liabilities" in ctx and "equity" in ctx:
                continue
        if key == "revenue" and metrics.revenue is not None:
            continue
        if key == "net_income" and metrics.net_income is not None:
            continue
        if key == "total_debt" and metrics.total_debt is not None:
            continue
        if key == "total_equity" and metrics.total_equity is not None:
            continue
        if key == "assets" and metrics.assets is not None:
            continue
        if key == "liabilities" and metrics.liabilities is not None:
            continue
        if key == "cash_flow" and metrics.cash_flow is not None:
            continue
        if key == "ebitda" and metrics.ebitda is not None:
            continue

        value = _parse_first_number_after(text, idx + len(pattern))
        if value is None:
            continue

        if key == "revenue":
            metrics.revenue = value
        elif key == "net_income":
            metrics.net_income = value
        elif key == "total_debt":
            metrics.total_debt = value
        elif key == "borrowings" or key == "debt_securities":
            debt_components.append(abs(value))
        elif key == "total_equity":
            metrics.total_equity = value
        elif key == "assets":
            metrics.assets = value
        elif key == "liabilities":
            metrics.liabilities = value
        elif key == "cash_flow":
            metrics.cash_flow = value
        elif key == "debt_to_equity":
            metrics.debt_to_equity = value
        elif key == "current_ratio":
            metrics.current_ratio = value
        elif key == "quick_ratio":
            metrics.quick_ratio = value
        elif key == "roe":
            metrics.roe_pct = value
        elif key == "roa":
            metrics.roa_pct = value
        elif key == "ebitda":
            metrics.ebitda = value

    if debt_components:
        debt_sum = sum(debt_components)
        if metrics.total_debt is None or (len(debt_components) > 1 and debt_sum > metrics.total_debt):
            metrics.total_debt = debt_sum


def _extract_from_table(df: pd.DataFrame, metrics: FinancialMetrics) -> None:
    if df.empty:
        return
    # Assume first column is label, last numeric column is latest period.
    label_col = df.columns[0]
    numeric_cols = df.columns[1:]
    if not numeric_cols.any():
        return
    latest_col = numeric_cols[-1]

    for _, row in df.iterrows():
        label_raw = str(row[label_col])
        key = _match_row_label(label_raw)
        if not key:
            continue
        value = to_float(row[latest_col])
        if key == "revenue" and metrics.revenue is None:
            metrics.revenue = value
        elif key == "revenue_growth" and metrics.revenue_growth_pct is None:
            metrics.revenue_growth_pct = value
        elif key == "ebitda" and metrics.ebitda is None:
            metrics.ebitda = value
        elif key == "ebitda_margin" and metrics.ebitda_margin_pct is None:
            metrics.ebitda_margin_pct = value
        elif key == "net_income" and metrics.net_income is None:
            metrics.net_income = value
        elif key == "net_profit_margin" and metrics.net_profit_margin_pct is None:
            metrics.net_profit_margin_pct = value
        elif key == "total_debt" and metrics.total_debt is None:
            metrics.total_debt = value
        elif key == "total_equity" and metrics.total_equity is None:
            metrics.total_equity = value
        elif key == "assets" and metrics.assets is None:
            metrics.assets = value
        elif key == "liabilities" and metrics.liabilities is None:
            metrics.liabilities = value
        elif key == "cash_flow" and metrics.cash_flow is None:
            metrics.cash_flow = value
        elif key == "debt_to_equity" and metrics.debt_to_equity is None:
            metrics.debt_to_equity = value
        elif key == "current_ratio" and metrics.current_ratio is None:
            metrics.current_ratio = value
        elif key == "quick_ratio" and metrics.quick_ratio is None:
            metrics.quick_ratio = value
        elif key == "roe" and metrics.roe_pct is None:
            metrics.roe_pct = value
        elif key == "roa" and metrics.roa_pct is None:
            metrics.roa_pct = value


def parse_financial_metrics(
    text: str, tables: List[pd.DataFrame]
) -> Dict[str, Any]:
    """Parse key financial metrics from tables and raw text (Indian P&L/BS format)."""
    metrics = FinancialMetrics()

    for table in tables:
        try:
            _extract_from_table(table, metrics)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to parse metrics from table: %s", exc)

    if text:
        try:
            _extract_from_text(text, metrics)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to parse metrics from text: %s", exc)

    # Calculate derived metrics at the end to ensure all components are available
    if metrics.revenue and metrics.revenue != 0:
        if metrics.ebitda is not None and metrics.ebitda_margin_pct is None:
            metrics.ebitda_margin_pct = (metrics.ebitda / abs(metrics.revenue)) * 100
        if metrics.net_income is not None and metrics.net_profit_margin_pct is None:
            metrics.net_profit_margin_pct = (metrics.net_income / abs(metrics.revenue)) * 100

    if (
        metrics.debt_to_equity is None
        and metrics.total_debt is not None
        and metrics.total_equity is not None
        and metrics.total_equity != 0
    ):
        metrics.debt_to_equity = metrics.total_debt / metrics.total_equity

    logger.info("Parsed financial metrics: %s", metrics)
    return asdict(metrics)

