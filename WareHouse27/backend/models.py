from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    Boolean,
    ForeignKey,
    Text
)
from sqlalchemy.sql import func
from database import Base

# ==========================================================
# PRODUCTS
# ==========================================================

class WHProduct(Base):
    __tablename__ = "wh_products"

    product_id = Column(Integer, primary_key=True, index=True)
    sku_code = Column(String(100), unique=True)
    product_name = Column(String(255))
    category = Column(String(100))

    unit = Column(String(30))
    brand = Column(String(100))
    price = Column(Float)

    weight = Column(Float)
    length_cm = Column(Float)
    width_cm = Column(Float)
    height_cm = Column(Float)


# ==========================================================
# PRODUCT IMAGES
# ==========================================================

class WHProductImage(Base):
    __tablename__ = "wh_product_images"

    image_id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("wh_products.product_id")
    )

    image_url = Column(Text)

    display_order = Column(Integer, default=1)

    is_primary = Column(Boolean, default=False)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


# ==========================================================
# SUPPLIERS
# ==========================================================

class WHSupplier(Base):
    __tablename__ = "wh_suppliers"

    supplier_id = Column(Integer, primary_key=True, index=True)

    supplier_name = Column(String(200))

    contact_person = Column(String(100))

    phone = Column(String(30))

    email = Column(String(100))

    lead_time_days = Column(Integer)

    status = Column(String(30))


# ==========================================================
# INVENTORY
# ==========================================================

class WHInventory(Base):
    __tablename__ = "wh_inventory"

    inventory_id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("wh_products.product_id")
    )

    location_id = Column(Integer)

    quantity = Column(Integer)

    reserved_quantity = Column(Integer)

    available_quantity = Column(Integer)

    reorder_level = Column(Integer)

    last_updated = Column(
        DateTime,
        server_default=func.now()
    )


# ==========================================================
# INVENTORY TRANSACTIONS
# ==========================================================

class WHInventoryTransaction(Base):
    __tablename__ = "wh_inventory_transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer)

    transaction_type = Column(String(30))

    quantity = Column(Float)

    transaction_date = Column(Date)

    remarks = Column(Text)


# ==========================================================
# PURCHASE ORDERS
# ==========================================================

class WHPurchaseOrder(Base):
    __tablename__ = "wh_purchase_orders"

    po_id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer)

    product_id = Column(Integer)

    quantity = Column(Float)

    expected_delivery = Column(Date)

    status = Column(String(30))

    approved_by = Column(String(100))

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
# ==========================================================
# FORECAST
# ==========================================================

class WHInventoryForecast(Base):
    __tablename__ = "wh_inventory_forecast"

    forecast_id = Column(Integer, primary_key=True)

    product_id = Column(Integer)

    forecast_period = Column(String(30))

    predicted_demand = Column(Float)

    confidence_score = Column(Float)

    forecast_date = Column(Date)


# ==========================================================
# REPLENISHMENT RECOMMENDATIONS
# ==========================================================

class WHReplenishmentRecommendation(Base):
    __tablename__ = "wh_replenishment_recommendations"

    recommendation_id = Column(Integer, primary_key=True)

    product_id = Column(Integer)

    suggested_quantity = Column(Float)

    suggested_order_date = Column(Date)

    estimated_cost = Column(Float)

    priority = Column(String(20))

    ai_confidence = Column(Float)

    status = Column(String(30))


# ==========================================================
# INVENTORY ALERTS
# ==========================================================

class WHInventoryAlert(Base):
    __tablename__ = "wh_inventory_alerts"

    alert_id = Column(Integer, primary_key=True)

    product_id = Column(Integer)

    alert_type = Column(String(50))

    message = Column(Text)

    severity = Column(String(20))

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


# ==========================================================
# AI MODEL LOGS
# ==========================================================

class WHAIModelLog(Base):
    __tablename__ = "wh_ai_model_logs"

    log_id = Column(Integer, primary_key=True)

    model_version = Column(String(50))

    training_date = Column(Date)

    prediction_count = Column(Integer)

    status = Column(String(30))


# ==========================================================
# AI MODEL METRICS
# ==========================================================

class WHAIModelMetric(Base):
    __tablename__ = "wh_ai_model_metrics"

    metric_id = Column(Integer, primary_key=True)

    model_version = Column(String(50))

    accuracy = Column(Float)

    precision = Column(Float)

    recall = Column(Float)

    f1_score = Column(Float)

    evaluation_date = Column(Date)


# ==========================================================
# INVENTORY THRESHOLDS
# ==========================================================

class WHInventoryThreshold(Base):
    __tablename__ = "wh_inventory_thresholds"

    threshold_id = Column(Integer, primary_key=True)

    product_id = Column(Integer)

    safety_stock = Column(Float)

    reorder_point = Column(Float)

    maximum_stock = Column(Float)

    confidence_threshold = Column(Float)

# ==========================================================
# REPLENISHMENT TICKET
# ==========================================================

class WHReplenishmentTicket(Base):
    __tablename__ = "wh_replenishment_ticket"

    ticket_id = Column(Integer, primary_key=True)

    ticket_number = Column(String(50), unique=True)

    canteen_name = Column(String(150))

    request_date = Column(Date)

    required_date = Column(Date)

    requested_by = Column(String(100))

    approved_by = Column(String(100))

    status = Column(String(30))

    remarks = Column(Text)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


# ==========================================================
# REPLENISHMENT ITEMS
# ==========================================================

class WHReplenishmentItem(Base):
    __tablename__ = "wh_replenishment_items"

    item_id = Column(Integer, primary_key=True)

    ticket_id = Column(
        Integer,
        ForeignKey("wh_replenishment_tickets.ticket_id")
    )

    product_id = Column(
        Integer,
        ForeignKey("wh_products.product_id")
    )

    requested_qty = Column(Float)

    approved_qty = Column(Float)

    issued_qty = Column(Float)


# ==========================================================
# PICKING
# ==========================================================

class WHPicking(Base):
    __tablename__ = "wh_picking"

    picking_id = Column(Integer, primary_key=True)

    ticket_id = Column(
        Integer,
        ForeignKey("wh_replenishment_tickets.ticket_id")
    )

    picker_name = Column(String(100))

    picked_date = Column(DateTime)

    status = Column(String(30))


# ==========================================================
# GATE PASS
# ==========================================================

class WHGatePass(Base):
    __tablename__ = "wh_gate_pass"

    gate_pass_id = Column(Integer, primary_key=True)

    gate_pass_number = Column(String(50))

    ticket_id = Column(
        Integer,
        ForeignKey("wh_replenishment_tickets.ticket_id")
    )

    vehicle_number = Column(String(50))

    driver_name = Column(String(100))

    security_name = Column(String(100))

    dispatch_time = Column(DateTime)

    status = Column(String(30))


# ==========================================================
# RECEIPT
# ==========================================================

class WHReceipt(Base):
    __tablename__ = "wh_receipt"

    receipt_id = Column(Integer, primary_key=True)

    ticket_id = Column(
        Integer,
        ForeignKey("wh_replenishment_tickets.ticket_id")
    )

    received_date = Column(DateTime)

    received_by = Column(String(100))

    received_status = Column(String(30))

    remarks = Column(Text)


# ==========================================================
# CANTEEN LEDGER
# ==========================================================

class WHCanteenLedger(Base):
    __tablename__ = "wh_canteen_ledger"

    ledger_id = Column(Integer, primary_key=True)

    product_id = Column(
        Integer,
        ForeignKey("wh_products.product_id")
    )

    opening_stock = Column(Float)

    received_qty = Column(Float)

    consumed_qty = Column(Float)

    closing_stock = Column(Float)

    transaction_date = Column(Date)


# ==========================================================
# FOOD TOKENS
# ==========================================================

class WHFoodToken(Base):
    __tablename__ = "wh_food_token"

    token_id = Column(Integer, primary_key=True)

    canteen_name = Column(String(100))

    token_date = Column(Date)

    breakfast_tokens = Column(Integer)

    lunch_tokens = Column(Integer)

    dinner_tokens = Column(Integer)

    total_tokens = Column(Integer)


# ==========================================================
# NEXT DAY REQUIREMENTS
# ==========================================================

class WHNextDayRequirement(Base):
    __tablename__ = "wh_next_day_requirement"

    requirement_id = Column(Integer, primary_key=True)

    canteen_name = Column(String(100))

    product_id = Column(
        Integer,
        ForeignKey("wh_products.product_id")
    )

    required_qty = Column(Float)

    requirement_date = Column(Date)

    generated_by = Column(String(100))

    status = Column(String(30))
