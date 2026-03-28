from typing import List, Optional

import google.generativeai as genai
from langchain_core.embeddings import Embeddings

from ..config import settings
from ..utils.logger import get_logger


logger = get_logger(__name__)


def _configure_client() -> None:
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Gemini calls will fail at runtime.")
    genai.configure(api_key=settings.GEMINI_API_KEY)


_configure_client()


def _normalize_model_name(name: str) -> str:
    # generate_content: use bare model name
    if name.startswith("models/") or name.startswith("tunedModels/"):
        return name.split("/", 1)[1]
    return name


def _embedding_model_name(name: str) -> str:
    # embed_content requires "models/" or "tunedModels/" prefix
    if name.startswith("models/") or name.startswith("tunedModels/"):
        return name
    return "models/" + name


def get_gemini_model():
    return genai.GenerativeModel(model_name=_normalize_model_name(settings.GEMINI_MODEL))


class GeminiEmbeddings(Embeddings):
    """LangChain-compatible embeddings wrapper around Gemini embedding API."""

    def __init__(self, model_name: Optional[str] = None):
        chosen = model_name or settings.GEMINI_EMBEDDING_MODEL
        self.model_name = _embedding_model_name(chosen)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_text(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_text(text)

    def _embed_text(self, text: str) -> List[float]:
        text = text or ""
        try:
            result = genai.embed_content(
                model=self.model_name,
                content=text,
            )
            return result["embedding"]
        except Exception as exc:  # noqa: BLE001
            logger.error("Gemini embedding failed: %s", exc)
            raise


def generate_structured_financial_analysis(prompt: str) -> str:
    """Call Gemini with a strongly structured financial-analysis prompt."""
    model = get_gemini_model()
    try:
        response = model.generate_content(prompt)
        return response.text or ""
    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini generate_content failed: %s", exc)
        raise


def chat_with_context(prompt: str, context_chunks: List[str]) -> str:
    """Use RAG-style context with Gemini to answer professionally."""
    system_prompt = (
        "You are a senior equity research analyst focused on Indian markets "
        "(NSE, BSE, RBI policy, Indian GAAP / Ind-AS). "
        "Answer ONLY using the provided document context. "
        "Be concise, data-driven, and professional. "
        "If something is not present in context, explicitly say so.\n\n"
        "Document context:\n"
    )
    joined_context = "\n\n---\n\n".join(context_chunks[:20])
    full_prompt = f"{system_prompt}{joined_context}\n\nUser question:\n{prompt}"
    model = get_gemini_model()
    try:
        response = model.generate_content(full_prompt)
        return response.text or ""
    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini chat_with_context failed: %s", exc)
        raise

