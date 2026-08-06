"""
services/llm/llm_client.py

HunterAI LLM Client
-------------------

Part 1
-------
✔ Configuration
✔ Models
✔ Exceptions
✔ Singleton
✔ Cache
✔ Base Client

Part 2
-------
- Groq implementation
- Gemini implementation
- Retry
- Timeout

Part 3
-------
- Batch
- Streaming
- Metrics
- Logging
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type

from dotenv import load_dotenv
from groq import AsyncGroq
from google import genai
from pydantic import BaseModel, ValidationError

load_dotenv()

# ==========================================================
# Logging
# ==========================================================

logger = logging.getLogger("hunter.llm")

if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )

# ==========================================================
# Environment
# ==========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

DEFAULT_GROQ_MODEL = os.getenv(
    "DEFAULT_GROQ_MODEL",
    "llama-3.3-70b-versatile",
)

DEFAULT_GEMINI_MODEL = os.getenv(
    "DEFAULT_GEMINI_MODEL",
    "gemini-2.5-flash",
)

DEFAULT_TIMEOUT = 20

DEFAULT_TEMPERATURE = 0

DEFAULT_MAX_TOKENS = 2048

CACHE_LIMIT = 1000

# ==========================================================
# Exceptions
# ==========================================================


class LLMException(Exception):
    pass


class GroqException(LLMException):
    pass


class GeminiException(LLMException):
    pass


class JSONValidationException(LLMException):
    pass


class TimeoutException(LLMException):
    pass


# ==========================================================
# Cache
# ==========================================================


class MemoryCache:

    def __init__(self):

        self.data: Dict[str, Any] = {}

        self.timestamps: Dict[str, float] = {}

    def _cleanup(self):

        if len(self.data) < CACHE_LIMIT:
            return

        oldest = sorted(
            self.timestamps.items(),
            key=lambda x: x[1]
        )[:100]

        for key, _ in oldest:
            self.data.pop(key, None)
            self.timestamps.pop(key, None)

    def get(self, key: str):

        return self.data.get(key)

    def set(self, key: str, value: Any):

        self._cleanup()

        self.data[key] = value

        self.timestamps[key] = time.time()


cache = MemoryCache()

# ==========================================================
# Base LLM Client
# ==========================================================


class BaseLLMClient(ABC):

    @staticmethod
    def create_hash(text: str) -> str:

        return hashlib.sha256(
            text.encode("utf-8")
        ).hexdigest()

    @staticmethod
    def validate_json(
        payload: dict,
        schema: Type[BaseModel],
    ) -> dict:

        try:

            return schema(
                **payload
            ).model_dump()

        except ValidationError as e:

            raise JSONValidationException(str(e))

    @abstractmethod
    async def invoke(
        self,
        prompt: str,
        **kwargs,
    ):
        ...

    @abstractmethod
    async def extract_json(
        self,
        prompt: str,
        schema: Type[BaseModel],
        **kwargs,
    ):
        ...

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        **kwargs,
    ):
        ...

    @abstractmethod
    async def batch(
        self,
        prompts: List[str],
        **kwargs,
    ):
        ...


# ==========================================================
# Main Client
# ==========================================================


class LLMClient(BaseLLMClient):

    def __init__(self):

        self.groq = None

        self.gemini = None

        if GROQ_API_KEY:

            self.groq = AsyncGroq(
                api_key=GROQ_API_KEY
            )

            logger.info("Groq initialized")

        else:

            logger.warning(
                "No GROQ_API_KEY found."
            )

        if GOOGLE_API_KEY:

            self.gemini = genai.Client(
                api_key=GOOGLE_API_KEY
            )

            logger.info("Gemini initialized")

        else:

            logger.warning(
                "No GOOGLE_API_KEY found."
            )

    async def invoke(
        self,
        prompt: str,
        **kwargs,
    ):
        raise NotImplementedError

    async def extract_json(
        self,
        prompt: str,
        schema: Type[BaseModel],
        **kwargs,
    ):
        raise NotImplementedError

    async def chat(
        self,
        messages: List[Dict[str, str]],
        **kwargs,
    ):
        raise NotImplementedError

    async def batch(
        self,
        prompts: List[str],
        **kwargs,
    ):
        raise NotImplementedError


# ==========================================================
# Singleton
# ==========================================================

llm = LLMClient()
