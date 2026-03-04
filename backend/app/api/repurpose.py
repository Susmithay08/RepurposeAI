import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db, Repurpose
from app.services.ai import repurpose_content
from app.services.extractor import extract_from_url

router = APIRouter()


class RepurposeRequest(BaseModel):
    content: str
    source_type: str = "text"   # text | url
    groq_api_key: Optional[str] = None
    save: bool = True


def _dict(r: Repurpose) -> dict:
    return {
        "id": r.id, "title": r.title, "source_type": r.source_type,
        "source_url": r.source_url, "word_count": r.word_count,
        "tldr": r.tldr,
        "twitter_thread": json.loads(r.twitter_thread) if r.twitter_thread else [],
        "linkedin_post": r.linkedin_post,
        "email_newsletter": r.email_newsletter,
        "created_at": r.created_at,
    }


@router.post("/repurpose")
async def repurpose(req: RepurposeRequest, db: AsyncSession = Depends(get_db)):
    if not req.content.strip():
        raise HTTPException(400, "Content is required")

    source_url = None
    if req.source_type == "url":
        try:
            source_url = req.content.strip()
            content = await extract_from_url(source_url)
        except ValueError as e:
            raise HTTPException(422, str(e))
    else:
        content = req.content

    result = await repurpose_content(content, req.groq_api_key)
    if result.get("error"):
        raise HTTPException(422, result["error"])

    word_count = len(content.split())

    if req.save:
        r = Repurpose(
            title=result["title"],
            source_text=content[:3000],
            source_type=req.source_type,
            source_url=source_url,
            twitter_thread=json.dumps(result["twitter_thread"]),
            linkedin_post=result["linkedin_post"],
            email_newsletter=result["email_newsletter"],
            tldr=result["tldr"],
            word_count=word_count,
        )
        db.add(r)
        await db.commit()
        await db.refresh(r)
        return _dict(r)

    return {**result, "id": None, "word_count": word_count, "source_url": source_url}


@router.get("/history")
async def history(limit: int = 30, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Repurpose).order_by(desc(Repurpose.created_at)).limit(limit))
    return [_dict(r) for r in res.scalars().all()]


@router.get("/history/{item_id}")
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    r = await db.get(Repurpose, item_id)
    if not r:
        raise HTTPException(404)
    return _dict(r)


@router.delete("/history/{item_id}")
async def delete_item(item_id: str, db: AsyncSession = Depends(get_db)):
    r = await db.get(Repurpose, item_id)
    if not r:
        raise HTTPException(404)
    await db.delete(r)
    await db.commit()
    return {"deleted": True}
