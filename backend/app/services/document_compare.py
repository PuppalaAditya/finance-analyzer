from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from ..ai.gemini_service import generate_structured_financial_analysis
from ..utils.logger import get_logger


logger = get_logger(__name__)


def _summarize_metrics_for_prompt(metrics: Dict[str, Any]) -> str:
    return "\n".join(f"- {k}: {v}" for k, v in metrics.items() if v is not None)


def _tables_head(tables: List[pd.DataFrame]) -> str:
    parts: List[str] = []
    for idx, df in enumerate(tables[:6]):
        parts.append(f"Company table {idx + 1}:\n")
        try:
            parts.append(df.head(10).to_markdown(index=False))
        except Exception:
            parts.append(df.head(10).to_string(index=False))
        parts.append("\n\n")
    return "".join(parts)


def compare_reports(
    company_a_name: str,
    a_text: str,
    a_tables: List[pd.DataFrame],
    a_metrics: Dict[str, Any],
    company_b_name: str,
    b_text: str,
    b_tables: List[pd.DataFrame],
    b_metrics: Dict[str, Any],
) -> Dict[str, Any]:
    prompt = f"""
You are a senior equity research analyst focused on Indian listed companies (NSE/BSE).
Compare two companies based on their financial reports.

Company A: {company_a_name}
Key metrics A:
{_summarize_metrics_for_prompt(a_metrics)}

Company B: {company_b_name}
Key metrics B:
{_summarize_metrics_for_prompt(b_metrics)}

Selected tables for A:
{_tables_head(a_tables)}

Selected tables for B:
{_tables_head(b_tables)}

Key excerpts from A report:
{a_text[:5000]}

Key excerpts from B report:
{b_text[:5000]}

Respond in STRICT JSON only, no extra commentary:
{{
  "comparison_table": [
    {{
      "aspect": string,
      "company_a": string,
      "company_b": string,
      "insight": string
    }}
  ],
  "investment_recommendation": string,
  "financial_strengths": {{
    "company_a": [string],
    "company_b": [string]
  }},
  "risk_comparison": {{
    "company_a_risk": "Low | Moderate | High",
    "company_b_risk": "Low | Moderate | High",
    "comments": string
  }},
  "overall_summary": string
}}

Focus on revenue growth, profitability (including EBITDA margins), leverage/debt,
liquidity, efficiency ratios, and alignment with Indian macro conditions
(RBI policy, inflation, GDP growth).
"""
    logger.info("Sending comparison prompt for %s vs %s", company_a_name, company_b_name)
    result_text = generate_structured_financial_analysis(prompt)
    return {"comparison_raw": result_text}

