"""Health check endpoint used for local verification and future uptime checks."""
from __future__ import annotations

from flask import Blueprint, jsonify
from sqlalchemy import text

from app.extensions import db

health_bp = Blueprint("health", __name__, url_prefix="/api/v1")


@health_bp.get("/health")
def health():
    db_status = "ok"
    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"

    return jsonify(
        {
            "status": "ok",
            "service": "engineering-growth-hub-api",
            "database": db_status,
        }
    )
