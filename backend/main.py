from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import dashboard, translation
import logging

logging.basicConfig(level=logging.INFO)

# Create tables
Base.metadata.create_all(bind=engine)

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

@app.get("/")
def read_root():
    return {"message": "Parent Dashboard API is running"}
