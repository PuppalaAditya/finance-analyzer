import logging
import sys

from ..config import settings


LOG_FORMAT = (
    "%(asctime)s | %(levelname)s | %(name)s | %(funcName)s | %(lineno)d | %(message)s"
)


def _configure_root_logger() -> None:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(LOG_FORMAT)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    if not root.handlers:
        root.addHandler(handler)
    root.setLevel(settings.LOG_LEVEL.upper())


def get_logger(name: str) -> logging.Logger:
    _configure_root_logger()
    return logging.getLogger(name)

