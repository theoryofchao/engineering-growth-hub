"""Flask application factory for the Engineering Growth Hub API."""
from __future__ import annotations

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate

from app.config import get_config
from app.extensions import db

migrate = Migrate()


def create_app(config_name: str | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    db.init_app(app)
    migrate.init_app(app, db)

    from app import models  # noqa: F401  (registers tables with SQLAlchemy metadata)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    )

    from app.routes.dashboard import dashboard_bp
    from app.routes.exercises import exercises_bp
    from app.routes.health import health_bp
    from app.routes.learning_sessions import learning_sessions_bp
    from app.routes.notes import notes_bp
    from app.routes.study_sessions import study_sessions_bp
    from app.routes.topics import topics_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(learning_sessions_bp)
    app.register_blueprint(study_sessions_bp)
    app.register_blueprint(exercises_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(topics_bp)
    app.register_blueprint(notes_bp)

    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({"error": error.description or "Not found"}), 404

    @app.errorhandler(400)
    def handle_bad_request(error):
        return jsonify({"error": error.description or "Bad request"}), 400

    @app.cli.command("seed")
    def seed_command():
        """Load curriculum content from content/curriculum into the database."""
        from app.seed import seed_all

        seed_all()
        print("Seed complete.")

    return app
