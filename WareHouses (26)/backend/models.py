from sqlalchemy import Column, Integer, String, Time, Text
from database import Base


class WHTruckSchedule(Base):
    __tablename__ = "wh_truck_schedule"

    schedule_id = Column(String(20), primary_key=True, index=True)
    dock_no = Column(String(20))
    truck_id = Column(String(20))
    carrier = Column(String(100))
    arrival_time = Column(Time)
    departure_time = Column(Time)
    status = Column(String(30))
    priority = Column(String(30))


class WHAIRecommendations(Base):
    __tablename__ = "wh_ai_recommendations"

    recommendation_id = Column(String(20), primary_key=True, index=True)
    truck_id = Column(String(20))
    current_dock = Column(String(20))
    suggested_dock = Column(String(20))
    current_dock_time = Column(Time)
    suggested_dock_time = Column(Time)
    reason = Column(Text)
    time_saved = Column(String(30))


class WHTruckArrivalPrediction(Base):
    __tablename__ = "wh_truck_arrival_prediction"

    prediction_id = Column(Integer, primary_key=True, index=True)
    truck_id = Column(String(20))
    carrier = Column(String(100))
    scheduled_arrival = Column(Time)
    predicted_arrival = Column(Time)
    delay_probability = Column(String(20))
    predicted_delay = Column(String(30))
    status = Column(String(30))


class WHDockUtilization(Base):
    __tablename__ = "wh_dock_utilization"

    utilization_id = Column(Integer, primary_key=True, index=True)
    dock_no = Column(String(20))
    current_truck = Column(String(20))
    status = Column(String(30))
    utilization = Column(String(20))
    next_available = Column(String(30))


class WHCongestionPredictions(Base):
    __tablename__ = "wh_congestion_predictions"

    prediction_id = Column(Integer, primary_key=True, index=True)
    time_slot = Column(String(30))
    expected_trucks = Column(Integer)
    available_docks = Column(Integer)
    congestion_level = Column(String(30))
    risk_score = Column(Integer)


class WHDockAlerts(Base):
    __tablename__ = "wh_dock_alerts"

    alert_id = Column(String(20), primary_key=True, index=True)
    alert_type = Column(String(50))
    severity = Column(String(30))
    description = Column(Text)
    created_time = Column(Time)
    status = Column(String(30))
