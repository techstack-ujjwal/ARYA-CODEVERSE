import io
from typing import Dict, Any, List
from pypdf import PdfReader
from loguru import logger


class PDFParser:
    """
    Lightweight, high-performance PDF text and metadata extractor using pypdf.
    Zero C++ / Poppler / Tesseract dependencies.
    """

    @staticmethod
    def extract_text_from_bytes(file_bytes: bytes) -> Dict[str, Any]:
        """Extracts text content per page and metadata from PDF bytes."""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            total_pages = len(reader.pages)
            pages_text: List[str] = []

            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                pages_text.append(page_text.strip())

            full_text = "\n\n--- Slide / Page Break ---\n\n".join(pages_text)
            metadata = reader.metadata or {}

            return {
                "total_pages": total_pages,
                "full_text": full_text,
                "pages": pages_text,
                "metadata": {k: str(v) for k, v in metadata.items()} if metadata else {},
            }
        except Exception as e:
            logger.error(f"[PDFParser] Error extracting PDF text: {e}")
            return {
                "total_pages": 0,
                "full_text": "",
                "pages": [],
                "metadata": {},
                "error": str(e),
            }
