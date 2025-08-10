# InsightAI

InsightAI is an agentic AI system for ONTAP storage analytics, leveraging OpenAI's GPT-4 and ONTAP CLI data. It provides actionable insights from storage metrics and exposes a server for querying insights.

## Environment Variables
Create a `.env` or `dev.env` file in the project root with the following variables:

```
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_USER=your_openai_api_user_here
PEM_PATH=/path/to/cert.pem

# ONTAP CLI credentials
ONTAP_HOST=your_ontap_host
ONTAP_USERNAME=your_ontap_username
ONTAP_PASSWORD=your_ontap_password
```

## Install Requirements
```
pip install -r requirements.txt
```

## Start the Server
```
python insight_server.py
```

## Usage

## API Endpoints

### 1. Requesting Insights
Send a POST request to `/find_insight` with a JSON body containing the volume names:

```
curl -X POST http://localhost:5000/find_insight -H "Content-Type: application/json" -d '{"volNames": ["vol1", "vol2", "vol3"]}'
```
Response:
```
{
  "request_id": "<uuid>"
}
```

### 2. Requesting Metrics Data
Send a POST request to `/get_metrics_data` with a JSON body containing the volume names:

```
curl -X POST http://localhost:5000/get_metrics_data -H "Content-Type: application/json" -d '{"volNames": ["vol1", "vol2", "vol3"]}'
```
Response:
```
{
  "request_id": "<uuid>"
}
```

### 3. Polling for Any Response
Poll the response for any request (insight or metrics) using the common endpoint:

```
curl -X GET http://localhost:5000/poll/<request_id>
```
Response (processing):
```
{
  "status": "processing"
}
```
Response (completed):
```
{
  "status": "completed",
  "response": <result>
}
```
Response (error):
```
{
  "status": "error",
  "message": "<error message>"
}
```

### Notes
- All request tracking is now handled in-memory using TinyDB.
- See `insight_server.py` for implementation details.
- Ensure your ONTAP system is reachable from the host running this project.
- The PEM certificate is required for secure OpenAI API access.

---
For more details, see the code and comments in `insight_ai.py` and `insight_server.py`.
