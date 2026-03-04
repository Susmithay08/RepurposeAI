import re
import httpx


async def extract_from_url(url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            headers = {"User-Agent": "Mozilla/5.0 (compatible; RepurposeAI/1.0)"}
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            html = resp.text

        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<(br|p|div|li|h[1-6])[^>]*>', '\n', html, flags=re.IGNORECASE)
        html = re.sub(r'<[^>]+>', '', html)
        html = html.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>') \
                   .replace('&nbsp;', ' ').replace('&#39;', "'").replace('&quot;', '"')
        lines = [l.strip() for l in html.splitlines() if l.strip()]
        text = '\n'.join(lines)

        if len(text) < 100:
            raise ValueError("Could not extract meaningful text from URL.")
        return text[:10000]
    except httpx.HTTPError as e:
        raise ValueError(f"Could not fetch URL: {e}")
