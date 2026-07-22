from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db

from models import (
    WHProduct,
    WHProductImage,
    WHSupplier,
    WHInventory,
    WHInventoryTransaction,
    WHPurchaseOrder,
    WHInventoryForecast,
    WHReplenishmentRecommendation,
    WHInventoryAlert,
    WHAIModelLog,
    WHAIModelMetric,
    WHInventoryThreshold,
    WHReplenishmentTicket,
    WHReplenishmentItem,
    WHPicking,
    WHGatePass,
    WHReceipt,
    WHCanteenLedger,
    WHFoodToken,
    WHNextDayRequirement
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Replenishment Intelligence API",
    version="2.0.0",
    description="Warehouse Grocery Inventory Management System"
)

# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# HOME
# ==========================================================

@app.get("/")
def home():
    return {
        "status": "Running",
        "application": "Warehouse Grocery Inventory",
        "version": "2.0"
    }


# ==========================================================
# DASHBOARD KPI
# ==========================================================

@app.get("/dashboard/kpis")
def dashboard(db: Session = Depends(get_db)):

    total_products = db.query(WHProduct).count()

    total_suppliers = db.query(WHSupplier).count()

    inventory_items = db.query(WHInventory).count()

    below_reorder_level = (
        db.query(WHInventory)
        .filter(
            WHInventory.available_quantity <
            WHInventory.reorder_level
        )
        .count()
    )

    pending_recommendations = (
        db.query(WHReplenishmentRecommendation)
        .filter(
            WHReplenishmentRecommendation.status == "Pending"
        )
        .count()
    )

    approved_purchase_orders = (
        db.query(WHPurchaseOrder)
        .filter(
            WHPurchaseOrder.status == "Approved"
        )
        .count()
    )

    alerts = db.query(WHInventoryAlert).count()

    metrics = db.query(WHAIModelMetric).all()

    forecast_accuracy = 0

    if metrics:
        accuracy_list = [
            metric.accuracy
            for metric in metrics
            if metric.accuracy is not None
        ]

        if accuracy_list:
            forecast_accuracy = round(
                sum(accuracy_list) / len(accuracy_list),
                2
            )

    return {

        "total_products": total_products,

        "total_suppliers": total_suppliers,

        "inventory_items": inventory_items,

        "below_reorder_level": below_reorder_level,

        "pending_recommendations": pending_recommendations,

        "approved_purchase_orders": approved_purchase_orders,

        "forecast_accuracy": forecast_accuracy,

        "alerts": alerts
    }
# ==========================================================
# PRODUCTS
# ==========================================================

@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(WHProduct).all()


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):

    product = (
        db.query(WHProduct)
        .filter(
            WHProduct.product_id == product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# ==========================================================
# PRODUCT IMAGES
# ==========================================================

@app.get("/products/{product_id}/images")
def get_product_images(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = (
        db.query(WHProduct)
        .filter(
            WHProduct.product_id == product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    images = (
        db.query(WHProductImage)
        .filter(
            WHProductImage.product_id == product_id
        )
        .order_by(
            WHProductImage.display_order
        )
        .all()
    )

    return images


# ==========================================================
# SUPPLIERS
# ==========================================================

@app.get("/suppliers")
def get_suppliers(
    db: Session = Depends(get_db)
):
    return db.query(WHSupplier).all()


@app.get("/suppliers/{supplier_id}")
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    supplier = (
        db.query(WHSupplier)
        .filter(
            WHSupplier.supplier_id == supplier_id
        )
        .first()
    )

    if supplier is None:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return supplier
# ==========================================================
# INVENTORY
# ==========================================================

@app.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(WHInventory).all()


@app.get("/inventory/{inventory_id}")
def get_inventory_by_id(
    inventory_id: int,
    db: Session = Depends(get_db)
):

    inventory = (
        db.query(WHInventory)
        .filter(
            WHInventory.inventory_id == inventory_id
        )
        .first()
    )

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found"
        )

    return inventory


# ==========================================================
# INVENTORY TRANSACTIONS
# ==========================================================

@app.get("/inventory-transactions")
def get_inventory_transactions(
    db: Session = Depends(get_db)
):
    return db.query(WHInventoryTransaction).all()


@app.get("/inventory-transactions/{transaction_id}")
def get_inventory_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):

    transaction = (
        db.query(WHInventoryTransaction)
        .filter(
            WHInventoryTransaction.transaction_id == transaction_id
        )
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction


# ==========================================================
# PURCHASE ORDERS
# ==========================================================

@app.get("/purchase-orders")
def get_purchase_orders(
    db: Session = Depends(get_db)
):
    return db.query(WHPurchaseOrder).all()


@app.get("/purchase-orders/{po_id}")
def get_purchase_order(
    po_id: int,
    db: Session = Depends(get_db)
):

    purchase_order = (
        db.query(WHPurchaseOrder)
        .filter(
            WHPurchaseOrder.po_id == po_id
        )
        .first()
    )

    if purchase_order is None:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return purchase_order
# ==========================================================
# FORECAST
# ==========================================================

@app.get("/forecast")
def get_forecast(db: Session = Depends(get_db)):
    return db.query(WHInventoryForecast).all()


@app.get("/forecast/{forecast_id}")
def get_forecast_by_id(
    forecast_id: int,
    db: Session = Depends(get_db)
):

    forecast = (
        db.query(WHInventoryForecast)
        .filter(
            WHInventoryForecast.forecast_id == forecast_id
        )
        .first()
    )

    if forecast is None:
        raise HTTPException(
            status_code=404,
            detail="Forecast not found"
        )

    return forecast


# ==========================================================
# RECOMMENDATIONS
# ==========================================================

@app.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db)
):
    return db.query(
        WHReplenishmentRecommendation
    ).all()


@app.get("/recommendations/{recommendation_id}")
def get_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db)
):

    recommendation = (
        db.query(WHReplenishmentRecommendation)
        .filter(
            WHReplenishmentRecommendation.recommendation_id ==
            recommendation_id
        )
        .first()
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found"
        )

    return recommendation


# ==========================================================
# ALERTS
# ==========================================================

@app.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db)
):
    return db.query(
        WHInventoryAlert
    ).all()


@app.get("/alerts/{alert_id}")
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):

    alert = (
        db.query(WHInventoryAlert)
        .filter(
            WHInventoryAlert.alert_id == alert_id
        )
        .first()
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert


# ==========================================================
# AI MODEL LOGS
# ==========================================================

@app.get("/model-logs")
def get_model_logs(
    db: Session = Depends(get_db)
):
    return db.query(
        WHAIModelLog
    ).all()


@app.get("/model-logs/{log_id}")
def get_model_log(
    log_id: int,
    db: Session = Depends(get_db)
):

    log = (
        db.query(WHAIModelLog)
        .filter(
            WHAIModelLog.log_id == log_id
        )
        .first()
    )

    if log is None:
        raise HTTPException(
            status_code=404,
            detail="Model Log not found"
        )

    return log


# ==========================================================
# AI MODEL METRICS
# ==========================================================

@app.get("/model-metrics")
def get_model_metrics(
    db: Session = Depends(get_db)
):
    return db.query(
        WHAIModelMetric
    ).all()


@app.get("/model-metrics/{metric_id}")
def get_model_metric(
    metric_id: int,
    db: Session = Depends(get_db)
):

    metric = (
        db.query(WHAIModelMetric)
        .filter(
            WHAIModelMetric.metric_id == metric_id
        )
        .first()
    )

    if metric is None:
        raise HTTPException(
            status_code=404,
            detail="Metric not found"
        )

    return metric


# ==========================================================
# INVENTORY THRESHOLDS
# ==========================================================

@app.get("/thresholds")
def get_thresholds(
    db: Session = Depends(get_db)
):
    return db.query(
        WHInventoryThreshold
    ).all()


@app.get("/thresholds/{threshold_id}")
def get_threshold(
    threshold_id: int,
    db: Session = Depends(get_db)
):

    threshold = (
        db.query(WHInventoryThreshold)
        .filter(
            WHInventoryThreshold.threshold_id ==
            threshold_id
        )
        .first()
    )

    if threshold is None:
        raise HTTPException(
            status_code=404,
            detail="Threshold not found"
        )

    return threshold
# ==========================================================
# REPLENISHMENT TICKETS
# ==========================================================

@app.get("/replenishment-ticket")
def get_replenishment_ticket(
    db: Session = Depends(get_db)
):
    return db.query(
        WHReplenishmentTicket
    ).all()


@app.get("/replenishment-ticket/{ticket_id}")
def get_replenishment_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    ticket = (
        db.query(WHReplenishmentTicket)
        .filter(
            WHReplenishmentTicket.ticket_id == ticket_id
        )
        .first()
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


# ==========================================================
# REPLENISHMENT ITEMS
# ==========================================================

@app.get("/replenishment-items")
def get_replenishment_items(
    db: Session = Depends(get_db)
):
    return db.query(
        WHReplenishmentItem
    ).all()


@app.get("/replenishment-items/{ticket_id}")
def get_replenishment_items_by_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(WHReplenishmentItem)
        .filter(
            WHReplenishmentItem.ticket_id == ticket_id
        )
        .all()
    )


# ==========================================================
# PICKING
# ==========================================================

@app.get("/picking")
def get_picking(
    db: Session = Depends(get_db)
):
    return db.query(
        WHPicking
    ).all()


@app.get("/picking/{ticket_id}")
def get_picking_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(WHPicking)
        .filter(
            WHPicking.ticket_id == ticket_id
        )
        .all()
    )


# ==========================================================
# GATE PASS
# ==========================================================

@app.get("/gate-pass")
def get_gate_pass(
    db: Session = Depends(get_db)
):
    return db.query(
        WHGatePass
    ).all()


@app.get("/gate-pass/{ticket_id}")
def get_gate_pass_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(WHGatePass)
        .filter(
            WHGatePass.ticket_id == ticket_id
        )
        .all()
    )


# ==========================================================
# RECEIPTS
# ==========================================================

@app.get("/receipt")
def get_receipts(
    db: Session = Depends(get_db)
):
    return db.query(
        WHReceipt
    ).all()


@app.get("/receipt/{ticket_id}")
def get_receipt(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(WHReceipt)
        .filter(
            WHReceipt.ticket_id == ticket_id
        )
        .all()
    )


# ==========================================================
# CANTEEN LEDGER
# ==========================================================

@app.get("/canteen-ledger")
def get_canteen_ledger(
    db: Session = Depends(get_db)
):
    return db.query(
        WHCanteenLedger
    ).all()


@app.get("/canteen-ledger/{product_id}")
def get_canteen_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(WHCanteenLedger)
        .filter(
            WHCanteenLedger.product_id == product_id
        )
        .all()
    )


# ==========================================================
# FOOD TOKENS
# ==========================================================

@app.get("/food-token")
def get_food_tokens(
    db: Session = Depends(get_db)
):
    return db.query(
        WHFoodToken
    ).all()


@app.get("/food-token/{canteen_name}")
def get_food_token(
    canteen_name: str,
    db: Session = Depends(get_db)
):

    return (
        db.query(WHFoodToken)
        .filter(
            WHFoodToken.canteen_name == canteen_name
        )
        .all()
    )


# ==========================================================
# NEXT DAY REQUIREMENTS
# ==========================================================

@app.get("/next-day-requirement")
def get_next_day_requirements(
    db: Session = Depends(get_db)
):
    return db.query(
        WHNextDayRequirement
    ).all()


@app.get("/next-day-requirement/{canteen_name}")
def get_next_day_requirement(
    canteen_name: str,
    db: Session = Depends(get_db)
):

    return (
        db.query(WHNextDayRequirement)
        .filter(
            WHNextDayRequirement.canteen_name == canteen_name
        )
        .all()
    )


# ==========================================================
# DASHBOARD SUMMARY
# ==========================================================

@app.get("/dashboard/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    return {

        "products": db.query(WHProduct).count(),

        "suppliers": db.query(WHSupplier).count(),

        "inventory": db.query(WHInventory).count(),

        "tickets": db.query(
            WHReplenishmentTicket
        ).count(),

        "gate_pass": db.query(
            WHGatePass
        ).count(),

        "receipts": db.query(
            WHReceipt
        ).count(),

        "food_tokens": db.query(
            WHFoodToken
        ).count(),

        "next_day_requirements": db.query(
            WHNextDayRequirement
        ).count(),

        "alerts": db.query(
            WHInventoryAlert
        ).count()
    }