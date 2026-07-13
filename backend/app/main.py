from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.api import repurpose
import logging

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="RepurposeAI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repurpose.router, prefix="/api", tags=["repurpose"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "RepurposeAI"}

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")