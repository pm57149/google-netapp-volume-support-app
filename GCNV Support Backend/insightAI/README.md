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

### 1. Requesting Insights
Send a POST request to the server endpoint `/find_insight` with a JSON body containing the volume names:

```
curl -X POST http://localhost:5000/find_insight -H "Content-Type: application/json" -d '{"volNames": ["vol1", "vol2", "vol3"]}'
```

#### Example Response
```
{
  "request_id": "b1e2c3d4-5678-90ab-cdef-1234567890ab"
}
```

- The server will process the request and return a request ID.

### 2. Polling for Response
Poll the response using the request ID:

```
curl -X GET http://localhost:5000/poll_response/<request_id>
```

- Replace `<request_id>` with the actual request ID returned.
- The endpoint will return the insight or the current status.

#### Example Response (processing)
```
{
  "status": "processing"
}
```

#### Example Response (completed)
```
{
  "status": "completed",
  "response": "<customer-friendly insight>"
}
```

#### Example Response (error)
```
{
  "status": "error",
  "message": "<error message>"
}
```

## Notes
- Ensure your ONTAP system is reachable from the host running this project.
- The PEM certificate is required for secure OpenAI API access.

---
For more details, see the code and comments in `insight_ai.py` and `insight_server.py`.
