"""
In-memory store for dashboard metrics. Each upload appends one entry.
Resets on process restart. Max size capped; oldest evicted.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any, Dict, List

_MAX_ENTRIES = 100

_store: List[Dict[str, Any]] = []


def _sanitize_metrics(metrics: Dict[str, Any]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for k, v in metrics.items():
        if v is None:
            continue
        if isinstance(v, float) and not math.isfinite(v):
            continue
        out[k] = v
    return out


def append(filename: str, metrics: Dict[str, Any], analysis: Dict[str, Any] | None = None) -> None:
    entry = {
        "filename": filename or "report.pdf",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "metrics": _sanitize_metrics(metrics),
        "analysis": analysis or {},
    }
    _store.append(entry)
    while len(_store) > _MAX_ENTRIES:
        _store.pop(0)


def get_recent(limit: int = 20) -> List[Dict[str, Any]]:
    return list(_store[-limit:])
