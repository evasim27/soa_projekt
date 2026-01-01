from services.log_service import LogService
from utils.rabbitmq_setup import consume_all_logs, setup_rabbitmq
from flask import jsonify

class LogController:
    @staticmethod
    def fetch_and_save_logs():
        try:
            setup_rabbitmq()
            logs = consume_all_logs()
            
            if not logs:
                return jsonify({
                    'message': 'No logs found in queue',
                    'count': 0
                }), 200
            
            saved_count = LogService.save_logs(logs)
            
            return jsonify({
                'message': 'Logs successfully fetched and saved',
                'count': saved_count
            }), 201
        except Exception as e:
            return jsonify({
                'error': 'Failed to fetch and save logs',
                'details': str(e)
            }), 500

    @staticmethod
    def get_logs_by_date_range(date_from, date_to):
        try:
            logs = LogService.get_logs_by_date_range(date_from, date_to)
            
            logs_list = [dict(log) for log in logs]
            
            for log in logs_list:
                if log.get('timestamp'):
                    log['timestamp'] = log['timestamp'].isoformat()
                if log.get('created_at'):
                    log['created_at'] = log['created_at'].isoformat()
            
            return jsonify({
                'logs': logs_list,
                'count': len(logs_list),
                'date_from': date_from,
                'date_to': date_to
            }), 200
        except Exception as e:
            return jsonify({
                'error': 'Failed to retrieve logs',
                'details': str(e)
            }), 500

    @staticmethod
    def delete_all_logs():
        try:
            deleted_count = LogService.delete_all_logs()
            
            return jsonify({
                'message': 'All logs deleted successfully',
                'deleted_count': deleted_count
            }), 200
        except Exception as e:
            return jsonify({
                'error': 'Failed to delete logs',
                'details': str(e)
            }), 500