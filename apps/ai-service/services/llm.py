"""LLM abstraction supporting OpenAI (cloud) and Ollama (local/private).

For government deployments where data must stay on-premise, set USE_OLLAMA=true.
BayanFi supports both backends with zero code changes — just a config toggle.
"""
from __future__ import annotations

import json
import httpx

from config import get_settings


class LLMService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _use_ollama(self) -> bool:
        """Use Ollama if explicitly set, or if no OpenAI key is configured."""
        return self.settings.use_ollama or not self.settings.openai_api_key

    async def complete(self, system: str, user: str, temperature: float = 0.3) -> str:
        """Returns a text completion from the configured backend."""
        if self._use_ollama():
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
            return resp.json()["choices"][0]["message"]["content"].strip()

    async def _ollama_complete(self, system: str, user: str, temperature: float) -> str:
        """
        Calls the local Ollama API using the /api/chat endpoint (better
        for multi-turn conversations than /api/generate).
        """
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
                data = resp.json()
                # /api/chat returns { message: { content: "..." } }
                return data.get("message", {}).get("content", "").strip()
        except httpx.ConnectError:
            return (
                "The AI assistant is starting up. "
                "Please make sure Ollama is running ('ollama serve') and the model is pulled ('ollama pull mistral')."
            )
        except Exception as e:
            return (
                f"The assistant is temporarily unavailable ({type(e).__name__}). "
                "Please try again in a moment."
            )

    async def complete_json(self, system: str, user: str) -> dict:
        """Requests a JSON object response and parses it defensively."""
        raw = await self.complete(
            system + " Respond ONLY with valid minified JSON, no markdown, no explanation.",
            user,
            temperature=0.0,
        )
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            return json.loads(raw[start:end])
        except (ValueError, json.JSONDecodeError):
            return {}
