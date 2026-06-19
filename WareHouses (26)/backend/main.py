from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import (
    WHTruckSchedule,
    WHAIRecommendations,
    WHTruckArrivalPrediction,
    WHDockUtilization,
    WHCongestionPredictions,
    WHDockAlerts,
)

app = FastAPI(
    title="Dock Scheduling Optimization API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Dock Scheduling Optimization API Running Successfully"
    }


@app.get("/dashboard/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_trucks = db.query(WHTruckSchedule).count()

    delayed_trucks = db.query(WHTruckSchedule).filter(
        WHTruckSchedule.status == "Delayed"
    ).count()

    trucks_arrived = db.query(WHTruckSchedule).filter(
        WHTruckSchedule.status.in_(["Loading", "Completed", "Delayed"])
    ).count()

    return {
        "total_trucks": total_trucks,
        "trucks_arrived": "2",
        "trucks_scheduled":"4",
        "trucks_loading": "2",
        "average_waiting_time": "12 mins",
        "dock_utilization": "60.5%",
        "delayed_trucks": delayed_trucks,
        "ai_savings": "2.25 hrs"
    }


@app.get("/WH_TRUCK_SCHEDULE")
def get_wh_truck_schedule(db: Session = Depends(get_db)):
    return db.query(WHTruckSchedule).all()


@app.get("/WH_AI_RECOMMENDATIONS")
def get_wh_ai_recommendations(db: Session = Depends(get_db)):
    return db.query(WHAIRecommendations).all()


@app.get("/WH_TRUCK_ARRIVAL_PREDICTION")
def get_wh_truck_arrival_prediction(db: Session = Depends(get_db)):
    return db.query(WHTruckArrivalPrediction).all()


@app.get("/WH_DOCK_UTILIZATION")
def get_wh_dock_utilization(db: Session = Depends(get_db)):
    return db.query(WHDockUtilization).all()


@app.get("/WH_CONGESTION_PREDICTIONS")
def get_wh_congestion_predictions(db: Session = Depends(get_db)):
    return db.query(WHCongestionPredictions).all()


@app.get("/WH_DOCK_ALERTS")
def get_wh_dock_alerts(db: Session = Depends(get_db)):
    return db.query(WHDockAlerts).all()