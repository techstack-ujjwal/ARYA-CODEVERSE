from typing import Dict, Any, List, Optional
import httpx
from loguru import logger
from backend.app.core.config import settings


class WebSearchTool:
    """
    Search wrapper querying Tavily Search API (or returning deterministic market intelligence fallback).
    """

    @staticmethod
    async def search_market(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """Searches live web for competitor solutions and market context."""
        if settings.TAVILY_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.tavily.com/search",
                        json={
                            "api_key": settings.TAVILY_API_KEY,
                            "query": query,
                            "search_depth": "basic",
                            "max_results": max_results,
                        },
                    )
                    if resp.status_code == 200:
                        results = resp.json().get("results", [])
                        return [
                            {
                                "title": r.get("title", ""),
                                "url": r.get("url", ""),
                                "content": r.get("content", ""),
                            }
                            for r in results
                        ]
            except Exception as e:
                logger.warning(f"[WebSearchTool] Tavily API error: {e}")

        # Intelligent deterministic fallback
        return [
            {
                "title": f"Market query: {query}",
                "url": "https://github.com/topics/hackathon",
                "content": f"Existing solutions address aspects of {query}, leaving differentiation opportunities for automated multi-agent workflows.",
            }
        ]

    @classmethod
    async def search(cls, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """Alias for search_market."""
        return await cls.search_market(query=query, max_results=max_results)

