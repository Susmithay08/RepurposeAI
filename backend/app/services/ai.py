import httpx
import json
import re
from app.core.config import settings

SYSTEM_PROMPT = """You are an expert content strategist and copywriter who repurposes long-form content into multiple formats.

Given a blog post or article, generate all 4 outputs simultaneously.

Return ONLY valid JSON — no markdown, no backticks, no preamble:
{
  "title": "Extracted or inferred title of the original content (max 80 chars)",
  "tldr": "3-4 sentence plain English summary. What is this about, why does it matter, what's the key takeaway.",
  "twitter_thread": [
    "Tweet 1 — Hook. Must stop the scroll. Bold claim, surprising fact, or strong opinion. Max 280 chars. No hashtags yet.",
    "Tweet 2 — Context or backstory. Why this matters.",
    "Tweet 3 — First key insight or point.",
    "Tweet 4 — Second key insight.",
    "Tweet 5 — Third key insight or example.",
    "Tweet 6 — Fourth point or data/quote.",
    "Tweet 7 — Practical takeaway or how-to.",
    "Tweet 8 — CTA. Follow for more, link to full post, or call to action. Add 2-3 relevant hashtags here only."
  ],
  "linkedin_post": "Full LinkedIn post. 150-300 words. Start with a strong hook line (no 'I' opener). Use short paragraphs (2-3 lines max). Include a personal insight or opinion. End with a question to drive comments. Add 3-5 hashtags at the end.",
  "email_newsletter": "Full email newsletter. Include: Subject line on first line prefixed with 'Subject: ', then blank line, then greeting, then 3-4 short paragraphs expanding on the content with examples, then a clear CTA, then sign-off. Conversational but professional tone. 250-400 words total."
}

Rules:
- Twitter thread: each tweet must be self-contained and under 280 chars. Number them naturally (1/, 2/ etc at start).
- LinkedIn: professional but human. Not corporate-speak. Real opinions welcome.
- Email: actually useful content, not just a summary link. Give value in the email itself.
- TL;DR: ruthlessly concise. If someone reads nothing else, this tells them everything.
- Keep the voice and key facts from the original — don't invent stats or claims not in the source.
"""


async def repurpose_content(content: str, groq_api_key: str = None) -> dict:
    api_key = groq_api_key or settings.GROQ_API_KEY
    if not api_key:
        return {"error": "No Groq API key provided."}

    content = content[:10000]

    try:
        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Repurpose this content into all 4 formats:\n\n{content}"},
                    ],
                    "temperature": 0.6,
                    "max_tokens": 4096,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"]

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                match = re.search(r'\{.*\}', raw, re.DOTALL)
                if match:
                    data = json.loads(match.group())
                else:
                    return {"error": "Model returned invalid JSON. Please try again."}

            # Ensure twitter_thread is a list
            thread = data.get("twitter_thread", [])
            if isinstance(thread, str):
                thread = [t.strip() for t in thread.split('\n') if t.strip()]

            return {
                "title": data.get("title", "Untitled")[:80],
                "tldr": data.get("tldr", ""),
                "twitter_thread": thread[:12],
                "linkedin_post": data.get("linkedin_post", ""),
                "email_newsletter": data.get("email_newsletter", ""),
                "error": None,
            }

    except httpx.HTTPStatusError as e:
        return {"error": f"Groq API error {e.response.status_code}: {e.response.text[:200]}"}
    except Exception as e:
        return {"error": str(e)}
