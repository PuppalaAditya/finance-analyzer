from __future__ import annotations

from typing import List, Tuple

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

from ..ai.gemini_service import GeminiEmbeddings, chat_with_context
from ..utils.logger import get_logger


logger = get_logger(__name__)


def build_vector_store(text: str) -> Tuple[FAISS, List[str]]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " "],
    )
    chunks = splitter.split_text(text or "")
    if not chunks:
        chunks = [text]

    embeddings = GeminiEmbeddings()
    vector_store = FAISS.from_texts(chunks, embedding=embeddings)
    logger.info("Built FAISS index with %d chunks", len(chunks))
    return vector_store, chunks


def answer_with_rag(question: str, text: str, top_k: int = 6) -> str:
    vector_store, _ = build_vector_store(text)
    docs = vector_store.similarity_search(question, k=top_k)
    context_chunks = [d.page_content for d in docs]
    logger.info("RAG retrieved %d relevant chunks", len(context_chunks))
    return chat_with_context(question, context_chunks)

