"""
FastAPI server for autoresearch-xhs frontend
Connects React frontend with Python backend
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Import backend modules
try:
    from scorer import ContentScorer
    from content_engine import ContentEngine
    SCORER_AVAILABLE = True
except ImportError:
    SCORER_AVAILABLE = False

app = FastAPI(title="autoresearch-xhs API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scorer
scorer = ContentScorer() if SCORER_AVAILABLE else None

# Initialize content engine
def get_engine():
    if not SCORER_AVAILABLE:
        return None

    api_key = (
        os.environ.get("MINIMAX_API_KEY") or
        os.environ.get("OPENAI_API_KEY") or
        os.environ.get("ANTHROPIC_API_KEY")
    )

    if not api_key:
        return None

    if os.environ.get("MINIMAX_API_KEY"):
        return ContentEngine(
            model="MiniMax-M2.7",
            api_key=os.environ.get("MINIMAX_API_KEY"),
            model_provider="minimax"
        )
    elif os.environ.get("ANTHROPIC_API_KEY"):
        return ContentEngine(
            model="claude-sonnet-4-20250514",
            api_key=os.environ.get("ANTHROPIC_API_KEY"),
            model_provider="anthropic"
        )
    else:
        return ContentEngine(
            model="gpt-4o",
            api_key=api_key,
            model_provider="openai"
        )


class ScoreRequest(BaseModel):
    title: str
    content: str


class GenerateRequest(BaseModel):
    topic: str
    niche: str = "美妆/穿搭/生活"
    goal: str = "提升点赞和收藏"
    num_candidates: int = 3


@app.get("/")
async def root():
    return {"status": "ok", "message": "autoresearch-xhs API"}


@app.post("/api/score")
async def score_content(req: ScoreRequest):
    """Score content using the 6-dimension scorer"""
    if not scorer:
        return {"error": "Backend not available"}

    result = scorer.score(req.title, req.content)

    return {
        "total_score": result.total_score,
        "dimension_scores": result.dimension_scores,
        "dimension_details": result.dimension_details,
        "feedback": result.feedback,
    }


@app.post("/api/generate")
async def generate_content(req: GenerateRequest):
    """Generate content using AI"""
    import traceback

    engine = get_engine()

    if not engine:
        return {"error": "No API key configured. Set MINIMAX_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY"}

    try:
        result = engine.generate(
            topic=req.topic,
            niche=req.niche,
            num_candidates=req.num_candidates,
            target_goal=req.goal
        )

        return {
            "candidates": [
                {
                    "title": c.title,
                    "cover_text": c.cover_text,
                    "content": c.content,
                    "tags": c.tags,
                    "score": c.score_result.total_score,
                    "dimension_scores": c.score_result.dimension_scores,
                    "feedback": c.score_result.feedback,
                }
                for c in result.candidates
            ],
            "best_candidate": {
                "title": result.best_candidate.title,
                "cover_text": result.best_candidate.cover_text,
                "content": result.best_candidate.content,
                "tags": result.best_candidate.tags,
                "score": result.best_candidate.score_result.total_score,
                "dimension_scores": result.best_candidate.score_result.dimension_scores,
                "feedback": result.best_candidate.score_result.feedback,
            } if result.best_candidate else None,
        }
    except Exception as e:
        return {"error": str(e), "trace": traceback.format_exc()}


@app.get("/api/history")
async def get_history():
    """Get experiment history"""
    results_file = Path("data/experiments/results.tsv")

    if not results_file.exists():
        return {"experiments": []}

    experiments = []
    with open(results_file, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) >= 4:
                experiments.append({
                    "date": parts[0],
                    "topic": parts[1],
                    "title": parts[2],
                    "score": float(parts[3]) if parts[3] else 0,
                })

    return {"experiments": experiments}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
