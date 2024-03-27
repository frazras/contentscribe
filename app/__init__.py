from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all domains

    from .routes import main
    app.register_blueprint(main)

    if __name__ == "__main__":
        app.run(port=8081)  # Run the application on port 8080

    return app
