from flask import Blueprint, request, jsonify
import json
from .keygen import get_keyword_data, combine_headings, title_gen_ai_analysis
import requests
from dramatiq.brokers.redis import RedisBroker
from dramatiq import actor
from dramatiq.results import Results
from dramatiq.results.backends import RedisBackend
import dramatiq
from dramatiq.middleware import Middleware, AsyncIO
import time

# Setup Redis broker
redis_broker = RedisBroker(host="localhost", port=6379)

# Add AsyncIO middleware
redis_broker.add_middleware(AsyncIO())

# Set the broker for Dramatiq
dramatiq.set_broker(redis_broker)

url = "https://google.serper.dev/search"
main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def index():
    task = wait_and_return_hello.send()
    return jsonify({"task_id_d": task.message_id}), 202

@main.route('/api', methods=['GET'])
def api_root():
    return jsonify({"message": "API Root"}), 200

@main.route('/keygen', methods=['POST'])
async def generate_keywords():
    print("GOT REQUEST")
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    print("GOT JSON")
    data = request.json
    input_keyword = data.get('input_keyword')
    if not input_keyword:
        return jsonify({"error": "Bad Request", "message": "Keyword is required."}), 400
    print("GOT KEYWORD")
    country = data.get('country', 'US')
    
    # Attempt to load additional_keywords safely
    additional_keywords_str = data.get('additional_keywords', '[]')
    try:
        print("GOT ADDITIONAL KEYWORDS")
        additional_keywords = json.loads(additional_keywords_str)
    except json.JSONDecodeError:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON format for additional_keywords."}), 400
    
    print("SENDING TASK")
    task = get_keyword_data.send(input_keyword, country, additional_keywords)
    print("TASK SENT")
    return jsonify({"task_id": task.message_id}), 202

@main.route('/serpscrape', methods=['POST'])
async def generate_title():
    
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    
    data = request.json
    print(data)
    input_keyword = data.get('input_keyword')
    if not input_keyword:
        print("No input_keyword")
        return jsonify({"error": "Bad Request", "message": "Keyword is required."}), 400
    
    country = data.get('country', 'US')
    if not country:
        return jsonify({"error": "Bad Request", "message": "Country is required."}), 400
    
    payload = json.dumps({
    "q": input_keyword,
    "gl": country
    })
    headers = {
    'X-API-KEY': 'a844e5c414e5254be8909375d552269b3b4bd8db',
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    
    if response.status_code == 200:
        results_data = response.json()
        organic_results = results_data.get('organic', [])
        extracted_data = []
        for result in organic_results:
            title = result.get('title')
            position = result.get('position')
            urllink = result.get('link')
            extracted_data.append({'title': title, 'position': position, 'url': urllink})
        results = extracted_data
    else:
        results = {'error': 'Failed to fetch data', 'status_code': response.status_code}

    result = {
        "success": True,
        "results": {
            "serp": results
        }
    }
    return result

@main.route('/headerscrape', methods=['POST'])
async def serp_scan():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    print("GOT REQUEST")
    data = request.json
    print("GOT DATA")
    print(data);
    links = data.get('selected_articles')
    print("GOT LINKS")
    print(links);
    if not links:
        return jsonify({"error": "Bad Request", "message": "Links are required."}), 400
    # create data structure suggestions.data.suggestions.headings to store headings
    results = {
            "headings": await combine_headings(links)
    }

    return jsonify({"success": True, "results": results})

@main.route('/newtitlegen', methods=['POST'])
async def new_title_gen():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    print("GOT REQUEST")
    data = request.json
    print("GOT DATA")
    #print(data);
    titles = await title_gen_ai_analysis(data)
    print("GOT TITLES")
    print(titles)
    return jsonify({"success": True, "results": titles})

@main.route('/keygen_status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    task_result = results.get_result(task_id)
    result = {
        'state': task_result.state,
        'result': task_result.result
    }
    return jsonify(result), 200

@dramatiq.actor
def wait_and_return_hello():
    time.sleep(5)
    print("IT WORKS!! Hello world after 5 seconds!")
    return "hello world"