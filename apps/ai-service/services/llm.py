"""LLM abstraction supporting OpenAI (cloud) and Ollama (local/private).

The abstraction lets sensitive deployments (e.g. government data that must
stay on-premise) switch to a local Ollama model without code changes.
"""
from __future__ import annotations

import json
import httpx

from config import get_settings


class LLMService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def complete(self, system: str, user: str, temperature: float = 0.2) -> str:
        """Returns a text completion from the configured backend."""
        if self.settings.use_ollama or not self.settings.openai_api_key:
            return await self._ollama_complete(system, user, temperature)
        return await self._openai_complete(system, user, temperature)

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
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()

    async def _ollama_complete(self, system: str, user: str, temperature: float) -> str:
        payload = {
            "model": self.settings.ollama_model,
            "prompt": f"{system}\n\n{user}",
            "stream": False,
            "options": {"temperature": temperature},
        }
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    f"{self.settings.ollama_base_url}/api/generate", json=payload
                )
                resp.raise_for_status()
                return resp.json().get("response", "").strip()
        except Exception:
            # Deterministic fallback keeps the assistant responsive offline.
            return (
                "I'm currently operating in offline mode. For eligibility, "
                "requirements, and status questions, please check your dashboard "
                "or contact your program administrator."
            )

    async def complete_json(self, system: str, user: str) -> dict:
        """Requests a JSON object response and parses it defensively."""
        raw = await self.complete(
            system + " Respond ONLY with valid minified JSON.", user, temperature=0.0
        )
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            return json.loads(raw[start:end])
        except (ValueError, json.JSONDecodeError):
            return {}
