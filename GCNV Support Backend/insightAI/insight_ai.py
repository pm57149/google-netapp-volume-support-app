import json

import psycopg2
import openai
from openai import OpenAI
import os

pem_path = os.getenv("PEM_PATH")
os.environ['REQUESTS_CA_BUNDLE'] = pem_path
os.environ['SSL_CERT_FILE']      = pem_path

# Set your OpenAI API key
OPENAPI_KEY = os.getenv('OPENAI_API_KEY')
OPENAPI_USER = os.getenv('OPENAI_API_USER')

resp_json = {
    "performance": "",      # Fill with performance insights
    "bottlenecks": "",      # Fill with identified bottlenecks
    "recommendations": "",  # Fill with actionable recommendations
    "usage_trends": ""      # Fill with usage trends
}

# noinspection PyTypeChecker
def agentic_decision(prompt):
    client = OpenAI(
        base_url = "https://llm-proxy-api.ai.openeng.netapp.com/",
        api_key  = OPENAPI_KEY,
    )
    msg = {
        "role": "user",
        "content": prompt,
        "name": "insightful_decision"
    }
    try:
        response = client.chat.completions.create(
            model    = "gpt-4.1",
            messages = [msg],
            user     = OPENAPI_USER,
        )
        return response.choices[0].message.content
    except Exception as e:
        import traceback
        print("OpenAI API error:", e)
        traceback.print_exc()
        return None

def find_insight(metrics_data_path):
    data = ""
    with open(metrics_data_path, "r") as f:
        data = f.read()

    insights = agentic_decision(
        "You are a ontap storage admin."
        f"Analyze the following data and provide insights on: {data}. "
        "Keep the response concise and focused on storage performance metrics, trends, and any bottlenecks."
        "Provide actionable recommendations based on the analysis."
    )

    # print("AI Insights:\n", insights)

    customer_friendly_response = agentic_decision(
        f"Convert the following insights into a customer-friendly response: {insights}. "
        "The response should be clear, concise, and must not contain an ontap internal jargon. "
        "It should be suitable for a customer who is not familiar with technical terms. "
        "Don't suggest any hardware changes or upgrades. "
        "Don't suggest any feature changes or upgrades. "
        "Don't suggest any software changes or upgrades."
        "Don't use Best regards and similar phrases. Keep the response professional and focused on the customer's needs."
        "Don't use backups or data protection terms for snapshots. "
        "Use the volume & pool name wherever possible to support your analysis, but do not include the raw data in the response."
        f"transform the response into a JSON format with keys: {', '.join(resp_json.keys())}."
        "The response should only contain the JSON object without any additional text or newlines. Don't use escape characters."
    )

    customer_friendly_response = json.loads(customer_friendly_response)

    # print("Customer-friendly response:\n", customer_friendly_response)

    return customer_friendly_response


if __name__ == "__main__":
    find_insight("/Users/ac84652/netapp/hackathon/insightAI/metrics_data/stats_output.txt")
