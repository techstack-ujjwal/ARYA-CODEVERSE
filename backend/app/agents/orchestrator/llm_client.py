import json
import re
from typing import Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel, ValidationError
import httpx
from tenacity import (
    AsyncRetrying,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from loguru import logger
from backend.app.core.config import settings

T = TypeVar("T", bound=BaseModel)


class LLMClientError(Exception):
    """Base exception for LLM provider errors."""
    pass


class SchemaValidationError(LLMClientError):
    """Raised when LLM output fails schema validation after retries."""
    pass


class StructuredLLMClient:
    """
    Robust, production-grade LLM client supporting OpenAI (GPT-4o / GPT-4o-mini)
    and Google Gemini (Gemini 3.7 Flash / Gemini 3.5 Flash) with:
    - Structured Pydantic output validation and self-correction
    - Multi-provider failover (OpenAI <-> Gemini)
    - Tenacity exponential backoff retries for transient errors
    - Support for mock provider in isolated unit test suites
    """

    def __init__(
        self,
        provider: Optional[str] = None,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        google_key = settings.GOOGLE_API_KEY
        openai_key = settings.OPENAI_API_KEY
        is_valid_openai_key = bool(openai_key and openai_key.startswith("sk-"))
        is_valid_google_key = bool(google_key and (google_key.startswith("AIzaSy") or google_key.startswith("AQ.")))

        if provider:
            self.provider = provider
        elif is_valid_openai_key:
            self.provider = "openai"
        elif is_valid_google_key:
            self.provider = "gemini"
        else:
            self.provider = "mock"

        if self.provider == "openai":
            self.api_key = api_key or openai_key
            self.model_name = model_name or "gpt-4o-mini"
        elif self.provider == "gemini":
            self.api_key = api_key or google_key
            self.model_name = model_name or "gemini-3.7-flash"
        else:
            self.api_key = ""
            self.model_name = "mock-evaluator"

    def _extract_json_string(self, text: str) -> str:
        """Extracts JSON substring from raw response or markdown code blocks."""
        text = text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1].strip()
        return text

    async def _call_gemini_api(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.2) -> str:
        """Invokes Google Gemini REST API."""
        key = settings.GOOGLE_API_KEY
        model = self.model_name if self.model_name in ["gemini-3.7-flash", "gemini-3.5-flash"] else "gemini-3.7-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        headers = {"Content-Type": "application/json"}
        
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"System Instructions: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow these instructions and return only valid JSON matching the schema."}]})
        
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json",
            },
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                raise LLMClientError(f"Gemini API error ({response.status_code}): {response.text}")
            
            data = response.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as e:
                raise LLMClientError(f"Invalid Gemini API response structure: {data}") from e

    async def _call_openai_api(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.2) -> str:
        """Invokes OpenAI Chat Completions API with response_format: json_object."""
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name if self.provider == "openai" else "gpt-4o-mini",
            "messages": messages,
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise LLMClientError(f"OpenAI API error ({response.status_code}): {response.text}")
            
            data = response.json()
            return data["choices"][0]["message"]["content"]

    def _generate_mock_response(self, response_model: Type[T], prompt: str) -> Dict[str, Any]:
        """Generates realistic mock evaluation data strictly for unit tests."""
        schema_fields = response_model.model_fields
        mock_data: Dict[str, Any] = {}

        if "score" in schema_fields:
            mock_data["score"] = 86.5
        if "confidence" in schema_fields:
            mock_data["confidence"] = 0.95
        if "summary" in schema_fields:
            mock_data["summary"] = "Structured evaluation completed with high confidence and verified criteria."
        if "reasoning" in schema_fields:
            mock_data["reasoning"] = "The submission exhibits strong domain adherence and verified criteria."
        if "evidence" in schema_fields:
            mock_data["evidence"] = [
                {
                    "evidence_type": "rubric_analysis",
                    "source": "submission_payload",
                    "tool_used": "deterministic_evaluator",
                    "content": {"criterion": "feasibility", "status": "verified"},
                    "summary": "Core workflow and functional claims verified against criteria.",
                }
            ]
        if "risks" in schema_fields:
            mock_data["risks"] = ["Monitor external API rate limits."]
        if "questions" in schema_fields:
            mock_data["questions"] = ["How does the system scale under load?"]
        if "metrics" in schema_fields:
            mock_data["metrics"] = {"coverage": 0.88, "latency_ms": 145}

        # Stage specific fields
        if "uniqueness_score" in schema_fields:
            mock_data.update({
                "uniqueness_score": 88.0,
                "problem_clarity_score": 90.0,
                "feasibility_score": 85.0,
                "market_differentiation_score": 83.0,
                "identified_competitors": ["Existing Solution A", "Generic Competitor B"],
            })
        if "presentation_quality_score" in schema_fields:
            mock_data.update({
                "presentation_quality_score": 86.0,
                "architecture_clarity_score": 88.0,
                "business_impact_score": 82.0,
                "extracted_claims": [
                    {
                        "claim_type": "architecture",
                        "claim_text": "Microservices backend with async event pipeline",
                        "origin_stage": "ppt",
                        "confidence": 0.92,
                    }
                ],
            })
        if "code_quality_score" in schema_fields:
            mock_data.update({
                "code_quality_score": 89.0,
                "functionality_score": 92.0,
                "ui_ux_score": 84.0,
                "security_score": 88.0,
                "real_world_impact_score": 85.0,
                "verified_claims_count": 4,
                "total_claims_count": 5,
            })
        if "overall_health" in schema_fields:
            mock_data.update({
                "overall_health": "ok",
                "dimensions": {
                    "code_quality": {"status": "ok", "notes": ["Clean modular layout"]},
                    "deployment_health": {"status": "ok", "response_ms": 280},
                    "functional_smoke": {"status": "ok", "passed_steps": 4},
                    "security_scan": {"status": "ok", "findings": []},
                    "documentation": {"status": "ok", "readme_present": True},
                },
                "top_fixes": ["Add end-to-end integration tests for the primary auth workflow."],
            })
        if "weighted_ai_score" in schema_fields:
            mock_data.update({
                "weighted_ai_score": 87.2,
                "idea_score": 86.5,
                "ppt_score": 85.0,
                "product_score": 88.5,
                "confidence": 0.94,
                "executive_summary": "Strong submission demonstrating cohesive execution across all stages.",
                "strengths": ["Clean modular architecture", "Clear problem definition"],
                "weaknesses": ["Minor edge case error handling in external API calls"],
                "suggested_judge_questions": ["What is the primary bottleneck when scaling to 10k concurrent users?"],
            })

        return mock_data

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_repair_attempts: int = 2,
    ) -> T:
        """
        Executes prompt and returns a validated Pydantic model.
        Uses OpenAI or Gemini real APIs with automatic self-correction re-prompts on schema mismatch.
        """
        if self.provider == "mock":
            mock_dict = self._generate_mock_response(response_model, prompt)
            return response_model.model_validate(mock_dict)

        # Append schema instructions to prompt
        json_schema_str = json.dumps(response_model.model_json_schema(), indent=2)
        enhanced_prompt = (
            f"{prompt}\n\n"
            f"### REQUIRED OUTPUT FORMAT\n"
            f"You MUST return a single JSON object strictly matching this JSON Schema:\n"
            f"```json\n{json_schema_str}\n```\n"
            f"Output ONLY valid JSON. No conversational preamble or trailing commentary."
        )

        current_prompt = enhanced_prompt
        last_error = None

        for attempt in range(max_repair_attempts + 1):
            try:
                # Primary execution with Tenacity retry
                raw_response = None
                try:
                    async for attempt_step in AsyncRetrying(
                        stop=stop_after_attempt(3),
                        wait=wait_exponential(multiplier=1, min=1, max=8),
                        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
                        reraise=True,
                    ):
                        with attempt_step:
                            if self.provider == "gemini":
                                raw_response = await self._call_gemini_api(
                                    current_prompt, system_prompt=system_prompt, temperature=temperature
                                )
                            else:
                                raw_response = await self._call_openai_api(
                                    current_prompt, system_prompt=system_prompt, temperature=temperature
                                )
                except LLMClientError as primary_err:
                    # Failover to secondary provider if available
                    if self.provider == "openai" and settings.GOOGLE_API_KEY:
                        logger.warning(f"[LLMClient] OpenAI error ({primary_err}), failing over to Gemini 3.7 Flash")
                        raw_response = await self._call_gemini_api(
                            current_prompt, system_prompt=system_prompt, temperature=temperature
                        )
                    elif self.provider == "gemini" and settings.OPENAI_API_KEY:
                        logger.warning(f"[LLMClient] Gemini error ({primary_err}), failing over to OpenAI GPT-4o-mini")
                        raw_response = await self._call_openai_api(
                            current_prompt, system_prompt=system_prompt, temperature=temperature
                        )
                    else:
                        raise primary_err

                json_str = self._extract_json_string(raw_response)
                parsed_dict = json.loads(json_str)
                return response_model.model_validate(parsed_dict)

            except (json.JSONDecodeError, ValidationError) as err:
                last_error = err
                logger.warning(
                    f"[LLMClient] Schema validation failed on attempt {attempt + 1}/{max_repair_attempts + 1}: {err}"
                )
                if attempt < max_repair_attempts:
                    current_prompt = (
                        f"{enhanced_prompt}\n\n"
                        f"### ERROR IN PREVIOUS RESPONSE:\n"
                        f"Your previous output was invalid:\n{str(err)}\n\n"
                        f"Please correct the JSON output strictly conforming to the requested schema."
                    )
                else:
                    break

        raise SchemaValidationError(
            f"Failed to generate valid {response_model.__name__} after {max_repair_attempts + 1} attempts: {last_error}"
        )
