from fastapi import APIRouter

from ..utils.dashboard_store import get_recent
from ..utils.logger import get_logger


router = APIRouter()
logger = get_logger(__name__)


def _label_from_filename(filename: str, index: int) -> str:
    if not filename or filename == "report.pdf":
        return f"Report {index + 1}"
    stem = filename.replace(".pdf", "").strip()
    return stem[:40] if len(stem) > 40 else stem


def _build_dashboard_from_store(entries: list) -> dict:
    if not entries:
        return _static_fallback()

    # KPI + statements use latest report; trends use all reports
    latest = entries[-1]
    latest_metrics = latest.get("metrics") or {}
    latest_analysis = latest.get("analysis") or {}

    # 1. KPI cards (latest)
    revenue = float(latest_metrics.get("revenue") or 0)
    net_income = float(latest_metrics.get("net_income") or 0)
    assets = float(latest_metrics.get("assets") or 0)
    liabilities = float(latest_metrics.get("liabilities") or 0)
    equity = float(latest_metrics.get("total_equity") or (assets - liabilities))

    profit_margin = (net_income / revenue * 100) if revenue else None

    kpis = {
        "revenue": revenue or None,
        "net_profit": net_income or None,
        "total_assets": assets or None,
        "total_liabilities": liabilities or None,
        "equity": equity or None,
        "earnings_per_share": None,  # not parsed yet
        "profit_margin": profit_margin,
    }

    # 2. Profit & Loss trends across uploads
    pl_series = []
    margin_trend = []
    for idx, e in enumerate(entries):
        m = e.get("metrics") or {}
        label = _label_from_filename(e.get("filename") or "", idx)
        rev = float(m.get("revenue") or 0)
        ni = float(m.get("net_income") or 0)
        expenses = rev - ni if (rev and ni) else None
        margin = (ni / rev * 100) if rev else None
        pl_series.append(
            {
                "label": label,
                "revenue": rev or None,
                "expenses": expenses,
                "net_profit": ni or None,
            }
        )
        margin_trend.append(
            {
                "label": label,
                "profit_margin": margin,
            }
        )

    # 3. Balance sheet analysis (latest)
    assets_comp = []
    if assets:
        debt_val = float(latest_metrics.get("total_debt") or 0)
        # Other liabilities = total liabilities minus debt, or fallback from assets-equity-debt
        if liabilities:
            other_liab = max(liabilities - debt_val, 0)
        else:
            other_liab = max(assets - equity - debt_val, 0)
        assets_comp = [
            {"segment": "Equity", "value": max(equity, 0)},
            {"segment": "Debt", "value": max(debt_val, 0)},
            {"segment": "Other Liabilities", "value": other_liab},
        ]

    liabilities_struct = []
    total_liab = liabilities or (equity + float(latest_metrics.get("total_debt") or 0))
    if total_liab:
        debt = float(latest_metrics.get("total_debt") or 0)
        other = max(total_liab - debt, 0)
        liabilities_struct = [
            {"category": "Debt", "value": debt},
            {"category": "Other Liabilities", "value": other},
        ]

    # 4. Ratios (latest)
    roe = latest_metrics.get("roe_pct")
    if roe is None and equity:
        roe = net_income / equity * 100 if equity else None
    roa = latest_metrics.get("roa_pct")
    if roa is None and assets:
        roa = net_income / assets * 100 if assets else None
    debt_to_equity = latest_metrics.get("debt_to_equity")
    if debt_to_equity is None and equity:
        debt_to_equity = (latest_metrics.get("total_debt") or 0) / equity
    current_ratio = latest_metrics.get("current_ratio")
    net_margin_ratio = profit_margin

    ratios = {
        "roe": roe,
        "roa": roa,
        "debt_to_equity": debt_to_equity,
        "current_ratio": current_ratio,
        "net_profit_margin": net_margin_ratio,
    }

    # 5. Cash flow (latest) – we only have total cash_flow, treat as operating for now
    total_cf = float(latest_metrics.get("cash_flow") or 0)
    cashflow = {
        "label": _label_from_filename(latest.get("filename") or "", len(entries) - 1),
        "operating": total_cf or None,
        "investing": None,
        "financing": None,
    }

    # 6. AI insights (latest)
    ai_insights = {
        "summary": latest_analysis.get("summary"),
        "key_insights": latest_analysis.get("key_insights") or [],
        "risks": latest_analysis.get("risks") or [],
        "recommendations": latest_analysis.get("recommendations") or [],
    }

    return {
        "has_data": True,
        "kpis": kpis,
        "profit_and_loss": {
            "series": pl_series,
            "margin_trend": margin_trend,
        },
        "balance_sheet": {
            "assets_composition": assets_comp,
            "liabilities_structure": liabilities_struct,
        },
        "ratios": ratios,
        "cashflow": cashflow,
        "ai_insights": ai_insights,
    }


@router.get("/dashboard")
async def get_dashboard_data():
    """
    Financial statement analytics dashboard.
    Returns has_data: false when no uploads exist (frontend shows blank).
    """
    entries = get_recent(limit=20)
    if not entries:
        logger.info("Serving dashboard (no uploads, blank)")
        return {"has_data": False}
    data = _build_dashboard_from_store(entries)
    logger.info("Serving dashboard from %d uploads", len(entries))
    return data
