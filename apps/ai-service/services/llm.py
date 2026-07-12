"""LLM abstraction supporting OpenAI, Gemini, and Ollama backends.

Switch via environment variables:
  USE_OLLAMA=true          → local Ollama
  GEMINI_API_KEY=...       → Google Gemini (free tier)
  OPENAI_API_KEY=...       → OpenAI
"""
from __future__ import annotations

import json
import httpx

from config import get_settings


class LLMService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _backend(self) -> str:
        if self.settings.use_ollama:
            return "ollama"
        if self.settings.gemini_api_key:
            return "gemini"
        if self.settings.openai_api_key:
            return "openai"
        return "fallback"

    async def complete(self, system: str, user: str, temperature: float = 0.3) -> str:
        backend = self._backend()
        if backend == "ollama":
            return await self._ollama_complete(system, user, temperature)
        if backend == "gemini":
            return await self._gemini_complete(system, user, temperature)
        if backend == "openai":
            return await self._openai_complete(system, user, temperature)
        return self._fallback()

    # ── Gemini ────────────────────────────────────────────────────────
    async def _gemini_complete(self, system: str, user: str, temperature: float) -> str:
        """
        Calls the Google Gemini API (free tier).
        Uses gemini-1.5-flash — fastest and cheapest on the free tier.
        """
        model = self.settings.gemini_model
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}"
            f":generateContent?key={self.settings.gemini_api_key}"
        )
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system}\n\nUser: {user}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 512,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                return (
                    data["candidates"][0]["content"]["parts"][0]["text"].strip()
                )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                return "The assistant is busy right now. Please try again in a moment."
            return self._fallback()
        except Exception:
            return self._fallback()

    # ── OpenAI ────────────────────────────────────────────────────────
    async def _openai_complete(self, system: str, user: str, temperature: float) -> str:
        headers = {
            "Authorization": f"Bearer {self.settings.openai_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.settings.openai_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": temperature,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()

    # ── Ollama ────────────────────────────────────────────────────────
    async def _ollama_complete(self, system: str, user: str, temperature: float) -> str:
        payload = {
            "model": self.settings.ollama_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "options": {"temperature": temperature},
        }
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(
                    f"{self.settings.ollama_base_url}/api/chat",
                    json=payload,
                )
                resp.raise_for_status()
                return resp.json().get("message", {}).get("content", "").strip()
        except httpx.ConnectError:
            return "Ollama is not running. Start it with: ollama serve"
        except Exception:
            return self._fallback()

    # ── Fallback ──────────────────────────────────────────────────────
    def _fallback(self) -> str:
        return (
            "I can help you with eligibility questions, requirements, and application "
            "status. Please contact your program administrator for specific details."
        )

    async def complete_json(self, system: str, user: str) -> dict:
        raw = await self.complete(
            system + " Respond ONLY with valid minified JSON, no markdown.",
            user,
            temperature=0.0,
        )
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            return json.loads(raw[start:end])
        except (ValueError, json.JSONDecodeError):
            return {}
