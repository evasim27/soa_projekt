from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from routes.log_routes import log_bp
import os

app = Flask(__name__)
CORS(app)

# Swagger configuration
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api-docs"
}

swagger_template = {
    "info": {
        "title": "Logging Service API",
        "description": "API za upravljanje in shranjevanje sistemskih logov",
        "version": "1.0.0"
    }
}

Swagger(app, config=swagger_config, template=swagger_template)

app.register_blueprint(log_bp)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5007))
    app.run(host='0.0.0.0', port=port, debug=True)