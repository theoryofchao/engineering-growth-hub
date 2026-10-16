"""Shared Flask extension instances, created outside the app factory to avoid circular imports."""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
