import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from sqlalchemy import text
from app.database import Base, engine
from app import models  # noqa: F401  (ensures models are registered before create_all)
from app.routes import participants, teams

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smart_team_builder")

# Create database tables (if they don't already exist)
Base.metadata.create_all(bind=engine)

# Ensure save_type column exists if table was previously created
try:
    with engine.connect() as conn:
        cols = [c[1] for c in conn.execute(text("PRAGMA table_info(saved_teams)")).fetchall()]
        if cols and "save_type" not in cols:
            conn.execute(text("ALTER TABLE saved_teams ADD COLUMN save_type VARCHAR DEFAULT 'formation'"))
            conn.commit()
except Exception:
    pass

app = FastAPI(title="Smart Team Builder API")

# CORS - allow the frontend (Vite default port) to talk to this backend


allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

frontend_origin = os.environ.get("FRONTEND_ORIGIN", "")
if frontend_origin:
    allowed_origins.extend(
        origin.strip()
        for origin in frontend_origin.split(",")
        if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(participants.router)
app.include_router(teams.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}