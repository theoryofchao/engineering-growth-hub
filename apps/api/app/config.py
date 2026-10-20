"""Configuration classes, selected by FLASK_ENV / APP_ENV."""

from __future__ import annotations

import os


def _env_flag(name: str, default: str = "false") -> bool:
    return os.environ.get(name, default).strip().lower() in ("1", "true", "yes")


class BaseConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg://egh:egh@localhost:5432/engineering_growth_hub",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    TESTING = False
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

    # Dev-only backdoor around section prerequisite locking (see routes/sections.py).
    # Hard-pinned False here and never read from the environment except by
    # DevelopmentConfig below, so setting the env var in a testing or
    # production environment -- even by an .env file leaking between
    # environments -- has no effect. There is no "staging" config to forget
    # to lock this down in.
    DEV_UNLOCK_ALL_SECTIONS = False


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "DEBUG")

    # Set DEV_UNLOCK_ALL_SECTIONS=1 (locally only) to see every section as
    # unlocked regardless of prerequisites, e.g. to preview/test content
    # behind sections you haven't practiced yet. Never enable this anywhere
    # but your own machine.
    DEV_UNLOCK_ALL_SECTIONS = _env_flag("DEV_UNLOCK_ALL_SECTIONS")


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL", "sqlite:///:memory:")


class ProductionConfig(BaseConfig):
    DEBUG = False


_CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name: str | None = None):
    name = name or os.environ.get("APP_ENV", "development")
    return _CONFIGS.get(name, DevelopmentConfig)
