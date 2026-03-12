from groq import AsyncGroq

from app.core.config import settings
from app.models.ai import AIPromptRequest, AIExpandRequest, AISuggestRequest, AIResponse


class AIService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    async def chat(self, request: AIPromptRequest) -> AIResponse:
        messages = []
        if request.context:
            messages.append({"role": "system", "content": request.context})
        messages.append({"role": "user", "content": request.prompt})
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=request.max_tokens,
        )
        return AIResponse(
            content=response.choices[0].message.content,
            model=self.model,
            tokens_used=response.usage.total_tokens if response.usage else None,
        )

    async def expand_idea(self, request: AIExpandRequest) -> AIResponse:
        prompt = (
            f"Expand on this idea and provide 3-5 concrete sub-ideas or next steps:\n\n"
            f"Title: {request.idea_title}\nContent: {request.idea_content}"
        )
        if request.context:
            prompt += f"\n\nSession context: {request.context}"
        return await self.chat(AIPromptRequest(prompt=prompt))

    async def suggest_ideas(self, request: AISuggestRequest) -> AIResponse:
        existing = "\n".join(f"- {idea}" for idea in request.existing_ideas)
        prompt = (
            f"Based on these existing brainstorming ideas:\n{existing}\n\n"
            f"Suggest 5 new complementary ideas that haven't been mentioned yet."
        )
        return await self.chat(AIPromptRequest(prompt=prompt))
