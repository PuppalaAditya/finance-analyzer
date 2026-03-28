from typing import Any, Dict, List, Optional
import math


def safe_get(d: Dict[str, Any], path: List[str], default: Optional[Any] = None) -> Any:
    value: Any = d
    for key in path:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return default
    return value


def to_float(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)
        cleaned = str(value).replace(",", "").strip()
        if cleaned in {"", "-", "NA", "N/A"}:
            return None
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def _sanitize_scalar(value: Any) -> Any:
    if isinstance(value, float) and not math.isfinite(value):
        return None
    return value


def sanitize_for_json(payload: Any) -> Any:
    """
    Recursively replace NaN/Inf floats with None so responses are JSON serialisable.
    """
    if isinstance(payload, dict):
        return {k: sanitize_for_json(v) for k, v in payload.items()}
    if isinstance(payload, list):
        return [sanitize_for_json(v) for v in payload]
    return _sanitize_scalar(payload)

