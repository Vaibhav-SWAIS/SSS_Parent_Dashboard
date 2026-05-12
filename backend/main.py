from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base
import models
from routers import dashboard, translation, communication
import logging

logging.basicConfig(level=logging.INFO)

# Create tables
Base.metadata.create_all(bind=engine)

# Add any columns that create_all won't backfill on existing tables
with engine.connect() as _conn:
    _conn.execute(text(
        "ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS recipient_name VARCHAR"
    ))
    _conn.commit()

app = FastAPI(title="Parent Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(translation.router, tags=["Translation"])
app.include_router(communication.router)

@app.get("/")
def read_root():
    return {"message": "Parent Dashboard API is running"}
