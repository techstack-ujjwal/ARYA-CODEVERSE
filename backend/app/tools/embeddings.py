import math
from typing import List, Dict, Any, Optional
import httpx
from loguru import logger
from backend.app.core.config import settings


class EmbeddingsTool:
    """
    Vector Embedding & Similarity Computation Tool:
    - Generates semantic embeddings via OpenAI or Gemini API
    - Computes cosine similarity between texts (claims vs code, submissions vs public repos)
    - Supports fast local fallback vector math
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Calculates cosine similarity between two float vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot_product / (norm_a * norm_b)

    async def get_embedding(self, text: str, model: str = "text-embedding-3-small") -> List[float]:
        """Fetches embedding vector from OpenAI API."""
        if not self.api_key:
            # Deterministic hash pseudo-embedding fallback
            return self._generate_hash_embedding(text)

        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "input": text[:8000],
            "model": model,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["data"][0]["embedding"]
                else:
                    logger.warning(f"[EmbeddingsTool] OpenAI API returned {resp.status_code}: {resp.text}")
                    return self._generate_hash_embedding(text)
            except Exception as e:
                logger.warning(f"[EmbeddingsTool] Embedding error: {e}")
                return self._generate_hash_embedding(text)

    def _generate_hash_embedding(self, text: str, dim: int = 128) -> List[float]:
        """Generates normalized deterministic n-gram vector for dev fallback."""
        vec = [0.0] * dim
        for i, char in enumerate(text):
            vec[ord(char) % dim] += 1.0 / (i + 1)
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]

    async def compute_text_similarity(self, text_a: str, text_b: str) -> float:
        """Computes semantic similarity score (0.0 to 1.0) between two text strings."""
        if not text_a or not text_b:
            return 0.0
        vec_a = await self.get_embedding(text_a)
        vec_b = await self.get_embedding(text_b)
        sim = self.cosine_similarity(vec_a, vec_b)
        return max(0.0, min(1.0, round(sim, 4)))
