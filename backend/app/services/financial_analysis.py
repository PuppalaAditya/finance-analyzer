from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from ..ai.gemini_service import generate_structured_financial_analysis
from ..utils.logger import get_logger


logger = get_logger(__name__)


def _tables_to_markdown(tables: List[pd.DataFrame]) -> str:
    parts: List[str] = []
    for idx, df in enumerate(tables[:6]):
        parts.append(f"Table {idx + 1}:\n")
        try:
            parts.append(df.to_markdown(index=False))
        except Exception:
            parts.append(df.to_string(index=False))
        parts.append("\n\n")
    return "".join(parts)


def generate_ai_financial_analysis(
    raw_text: str,
    tables: List[pd.DataFrame],
    parsed_metrics: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Single Gemini call that:
    - Optionally fills missing core metrics (if clearly present)
    - Produces a concise financial analysis.

    Returns:
      {
        "metrics": merged_metrics_dict,
        "analysis": analysis_dict
      }
    """
    import json

    fallback_analysis = {
        "summary": "AI analysis unavailable due to model error or quota.",
        "key_insights": [],
        "risks": [],
        "recommendations": [],
    }

    base_context = (
        "You are a senior equity research analyst focused on Indian markets "
        "(NSE/BSE, RBI policy, Ind-AS / Indian GAAP).\n\n"
        "You receive: (1) parsed but possibly incomplete numeric metrics, and "
        "(2) raw text + tables extracted from the company's financial PDF.\n\n"
        "Tasks:\n"
        "1) Fill missing core metrics if they are clearly present in the report "
        "(otherwise leave them null).\n"
        "2) Produce a concise, data‑driven financial analysis suitable for a "
        "professional investor.\n\n"
    )

    metrics_json = json.dumps(parsed_metrics)
    tables_md = _tables_to_markdown(tables)

    structure = (
        "Respond in STRICT JSON (no markdown, no commentary) with this schema:\n"
        "{\n"
        '  "metrics": {\n'
        '    "revenue": number | null,\n'
        '    "net_income": number | null,\n'
        '    "assets": number | null,\n'
        '    "liabilities": number | null,\n'
        '    "cash_flow": number | null\n'
        "  },\n"
        '  "analysis": {\n'
        '    "summary": string,\n'
        '    "key_insights": [string],\n'
        '    "risks": [string],\n'
        '    "recommendations": [string]\n'
        "  }\n"
        "}\n\n"
        "Rules:\n"
        "- Use only numbers that are explicitly present or clearly derivable "
        "from the report.\n"
        "- If a metric is not clearly present, set it to null.\n"
        "- Use numeric values (no % symbols) in the metrics object.\n"
    )

    prompt = (
        f"{base_context}"
        f"Existing parsed metrics (may contain nulls):\n{metrics_json}\n\n"
        f"Key tables (markdown format):\n{tables_md}\n\n"
        "Key textual excerpts from the report (may be truncated):\n"
        f"{raw_text[:7000]}\n\n"
        f"{structure}"
    )

    try:
        logger.info("Calling Gemini once for metrics + analysis")
        result_text = generate_structured_financial_analysis(prompt)
        ai_obj = json.loads(result_text or "{}")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Gemini AI financial analysis failed: %s", exc)
        return {"metrics": parsed_metrics, "analysis": fallback_analysis}

    ai_metrics = (ai_obj or {}).get("metrics") or {}
    merged_metrics = dict(parsed_metrics)
    for key, value in ai_metrics.items():
        if merged_metrics.get(key) is None and isinstance(value, (int, float)):
            merged_metrics[key] = float(value)

    analysis = (ai_obj or {}).get("analysis") or fallback_analysis

    return {"metrics": merged_metrics, "analysis": analysis}


