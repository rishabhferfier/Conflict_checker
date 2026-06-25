from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# Import DB Base + engine
from db.database import Base, engine
from routes import analyze
# Import models
from db import models

# Create tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Conflict Checker Agent"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/v1")

# Resolve path to frontend/app static folder
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "app"

# Mount static assets
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")