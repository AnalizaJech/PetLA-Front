from flask import Flask
import os
from flask_cors import CORS
from .db import init_db
from .routes.auth import auth_bp
from .routes.users import users_bp
from .routes.pets import pets_bp
from .routes.appointments import appts_bp
from .routes.health import health_bp
from .routes.historial import historial_bp
from .routes.precitas import precitas_bp
from .routes.notifications import notifications_bp
from .routes.newsletter import newsletter_bp


def create_app():
    app = Flask(__name__)

    # Config
    app.config.from_mapping(
        MONGO_URI=os.getenv("MONGO_URI", "mongodb://petla:petla123@mongo:27017/petla?authSource=admin"),
        MONGO_DB=os.getenv("MONGO_DB", "petla"),
        JWT_SECRET=os.getenv("JWT_SECRET", "change_me_in_env"),
        UPLOAD_DIR=os.getenv("UPLOAD_DIR", "/app/uploads"),
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB
    )

    # CORS (permitir frontend en 8080 y nginx 80)
    CORS(app, 
         resources={r"/*": {"origins": "*"}},
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
         supports_credentials=True
    )

    # Manejar preflight OPTIONS para todas las rutas
    @app.before_request
    def handle_preflight():
        from flask import request
        if request.method == "OPTIONS":
            from flask import Response
            response = Response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response

    # DB
    init_db(app)

    # Blueprints - registrar todos los módulos
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(pets_bp, url_prefix="/api/mascotas")
    app.register_blueprint(appts_bp, url_prefix="/api/citas")
    app.register_blueprint(historial_bp, url_prefix="/api/historial")
    app.register_blueprint(precitas_bp, url_prefix="/api/pre-citas")
    app.register_blueprint(notifications_bp, url_prefix="/api/notificaciones")
    app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")

    return app


if __name__ == "__main__":
    import os
    app = create_app()
    app.run(host="0.0.0.0", port=5000)
