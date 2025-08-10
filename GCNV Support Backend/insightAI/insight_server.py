from flask import Flask, request, jsonify
from insight_ai import find_insight, get_json_metrics_data
from cli_stats_collect import fetch_metrics_data
import uuid
from tinydb import TinyDB, Query
from tinydb.storages import MemoryStorage

app = Flask(__name__)

db = TinyDB(storage=MemoryStorage)
requests_table = db.table('requests')
Request = Query()

def set_request(request_id, status, response=None):
    requests_table.upsert({
        'request_id': request_id,
        'status': status,
        'response': response
    }, Request.request_id == request_id)

def get_request(request_id):
    result = requests_table.get(Request.request_id == request_id)
    if result:
        return {'status': result['status'], 'response': result['response']}
    return None

# Get insight:
# curl -X POST http://localhost:5000/find_insight -H "Content-Type: application/json" -d '{"volNames": ["vol1", "vol2", "vol3"]}'
@app.route('/find_insight', methods=['POST'])
def find_insight_endpoint():
    try:
        data = request.get_json()
        vol_names = data.get('volNames', [])

        if not vol_names:
            return jsonify({"error": "no resource provided for analysis"}), 400

        # Generate a unique request ID
        request_id = str(uuid.uuid4())
        set_request(request_id, "processing")

        # Process the request asynchronously
        def process_request():
            try:
                metric_data_path = fetch_metrics_data(vol_names)["metrics_file_path"]
                response = find_insight(metric_data_path)
                set_request(request_id, "completed", response)
            except Exception as e:
                set_request(request_id, "error", str(e))

        from threading import Thread
        Thread(target=process_request).start()

        return jsonify({"request_id": request_id}), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get Metrics Data:
# curl -X POST http://localhost:5000/get_metrics_data -H "Content-Type: application/json" -d '{"volNames": ["vol1", "vol2", "vol3"]}'
@app.route('/get_metrics_data', methods=['POST'])
def get_json_metrics_data_endpoint():
    try:
        data = request.get_json()
        vol_names = data.get('volNames', [])
        if not vol_names:
            return jsonify({"error": "no resource provided for analysis"}), 400
        # Generate a unique request ID
        request_id = str(uuid.uuid4())
        set_request(request_id, "processing")
        # Process the request asynchronously
        def process_request():
            try:
                metric_data_path = fetch_metrics_data(vol_names)["metrics_file_path"]
                response = get_json_metrics_data(metric_data_path, vol_names)
                set_request(request_id, "completed", response)
            except Exception as e:
                set_request(request_id, "error", str(e))
        from threading import Thread
        Thread(target=process_request).start()
        return jsonify({"request_id": request_id}), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Poll insight response:
# curl -X GET http://localhost:5000/poll_insight/<request_id>
@app.route('/poll_insight/<request_id>', methods=['GET'])
def poll_insight_response(request_id):
    try:
        request_data = get_request(request_id)
        if request_data is None:
            return jsonify({"error": "Invalid request ID"}), 404
        status = request_data["status"]
        if status == "processing":
            return jsonify({"status": "processing"}), 202
        if status == "error":
            return jsonify({"status": "error", "message": request_data["response"]}), 500
        return jsonify(request_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Poll metrics response:
# curl -X GET http://localhost:5000/poll_metrics/<request_id>
@app.route('/poll_metrics/<request_id>', methods=['GET'])
def poll_metrics_response(request_id):
    try:
        request_data = get_request(request_id)
        if request_data is None:
            return jsonify({"error": "Invalid request ID"}), 404
        status = request_data["status"]
        if status == "processing":
            return jsonify({"status": "processing"}), 202
        if status == "error":
            return jsonify({"status": "error", "message": request_data["response"]}), 500
        return jsonify(request_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)