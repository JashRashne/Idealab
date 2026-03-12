from datetime import datetime, timezone
from uuid import uuid4

from groq import AsyncGroq

from app.core.config import settings
from app.models.ai import AIPromptRequest, AIJobResponse, AIResponse


class AIService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    async def _generate(self, prompt: str, context: str = None) -> str:
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": prompt})
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=1024,
        )
        return response.choices[0].message.content

    def _job(
        self, session_id: str, job_type: str, idea_ids: list, output: str
    ) -> AIJobResponse:
        return AIJobResponse(
            id=str(uuid4()),
            session_id=session_id,
            type=job_type,
            input_idea_ids=idea_ids,
            output=output,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    async def expand_idea(self, idea: dict) -> AIJobResponse:
        prompt = (
            f"Expand on this idea and provide 3–5 concrete sub-ideas or next steps:\n\n"
            f"Title: {idea['title']}\nContent: {idea.get('content', '')}"
        )
        output = await self._generate(prompt)
        return self._job(idea["session_id"], "expand", [idea["id"]], output)

    async def summarize_session(self, session_id: str, ideas: list) -> AIJobResponse:
        titles = "\n".join(
            f"- {i['title']}: {i.get('content', '')[:100]}" for i in ideas
        )
        prompt = (
            f"Summarize the key themes and top ideas from this brainstorming session:\n\n"
            f"{titles or 'No ideas yet'}"
        )
        output = await self._generate(prompt)
        return self._job(
            session_id, "summarize", [i["id"] for i in ideas], output
        )

    async def merge_ideas(self, idea1: dict, idea2: dict) -> dict:
        """Generates a merged idea and returns it as a new Idea dict."""
        prompt = (
            f"Merge these two ideas into one coherent, improved concept. "
            f"Return ONLY the merged idea text — no preamble.\n\n"
            f"Idea 1 — {idea1['title']}: {idea1.get('content', '')}\n\n"
            f"Idea 2 — {idea2['title']}: {idea2.get('content', '')}"
        )
        output = await self._generate(prompt)
        return {
            "title": f"Merged: {idea1['title']} + {idea2['title']}",
            "content": output,
            "branch_name": idea1.get("branch_name", "main"),
            "parent_idea_id": None,
            "tags": list(set((idea1.get("tags") or []) + (idea2.get("tags") or []))),
            "session_id": idea1["session_id"],
            "created_by": "ai",
            "votes": [],
            "status": "merged",
        }

    async def chat(self, request: AIPromptRequest) -> AIResponse:
        content = await self._generate(request.prompt, request.context)
        return AIResponse(content=content, model=self.model)
