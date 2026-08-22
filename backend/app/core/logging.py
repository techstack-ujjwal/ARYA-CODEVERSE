import sys
from loguru import logger
from backend.app.core.config import settings


def setup_logging():
    logger.remove()
    log_level = "DEBUG" if settings.DEBUG else "INFO"
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=log_level,
    )
    return logger
