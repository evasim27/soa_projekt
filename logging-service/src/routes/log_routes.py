from flask import Blueprint
from flasgger import swag_from
from controllers.log_controller import LogController

log_bp = Blueprint('logs', __name__)

@log_bp.route('/logs', methods=['POST'])
def fetch_logs():
    """
    Prenesi loge iz RabbitMQ v bazo
    ---
    tags:
      - Logs
    responses:
      200:
        description: Logi uspešno preneseni in shranjeni
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Successfully processed 5 logs"
            logs_processed:
              type: integer
              example: 5
      500:
        description: Napaka pri prenosu logov
    """
    return LogController.fetch_and_save_logs()

@log_bp.route('/logs/<date_from>/<date_to>', methods=['GET'])
def get_logs(date_from, date_to):
    """
    Pridobi loge za določeno časovno obdobje
    ---
    tags:
      - Logs
    parameters:
      - name: date_from
        in: path
        type: string
        required: true
        description: Začetni datum (YYYY-MM-DD)
        example: "2026-01-01"
      - name: date_to
        in: path
        type: string
        required: true
        description: Končni datum (YYYY-MM-DD)
        example: "2026-01-31"
    responses:
      200:
        description: Seznam logov
        schema:
          type: object
          properties:
            count:
              type: integer
              example: 10
            date_from:
              type: string
              example: "2026-01-01"
            date_to:
              type: string
              example: "2026-01-31"
            logs:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  timestamp:
                    type: string
                  log_type:
                    type: string
                  url:
                    type: string
                  correlation_id:
                    type: string
                  service_name:
                    type: string
                  message:
                    type: string
      500:
        description: Napaka pri pridobivanju logov
    """
    return LogController.get_logs_by_date_range(date_from, date_to)

@log_bp.route('/logs', methods=['DELETE'])
def delete_logs():
    """
    Izbriši vse loge iz baze
    ---
    tags:
      - Logs
    responses:
      200:
        description: Vsi logi uspešno izbrisani
        schema:
          type: object
          properties:
            message:
              type: string
              example: "All logs deleted successfully"
      500:
        description: Napaka pri brisanju logov
    """
    return LogController.delete_all_logs()