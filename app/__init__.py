from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all domains

    from .routes import main
    app.register_blueprint(main)

    return app
