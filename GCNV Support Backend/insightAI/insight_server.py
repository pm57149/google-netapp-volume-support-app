from flask import Flask, request, jsonify
from insight_ai import find_insight
from cli_stats_collect import fetch_metrics_data
import uuid

app = Flask(__name__)

# In-memory storage for insights
insight_store = {}

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
        insight_store[request_id] = {"status": "processing", "response": None}

        # Process the request asynchronously
        def process_request():
            try:
                metric_data_path = fetch_metrics_data(vol_names)["metrics_file_path"]
                response = find_insight(metric_data_path)
                insight_store[request_id] = {"status": "completed", "response": response}
            except Exception as e:
                insight_store[request_id] = {"status": "error", "response": str(e)}

        from threading import Thread
        Thread(target=process_request).start()

        return jsonify({"request_id": request_id}), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Poll response:
# curl -X GET http://localhost:5000/poll_response/<request_id>
@app.route('/poll_response/<request_id>', methods=['GET'])
def poll_response(request_id):
    try:
        if request_id not in insight_store:
            return jsonify({"error": "Invalid request ID"}), 404

        if insight_store[request_id]["status"] == "processing":
            return jsonify({"status": "processing"}), 202

        if insight_store[request_id]["status"] == "error":
            return jsonify({"status": "error", "message": insight_store[request_id]["response"]}), 500

        return jsonify(insight_store[request_id]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)