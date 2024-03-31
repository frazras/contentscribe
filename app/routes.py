from flask import Blueprint, request, jsonify
import json
from .keygen import get_keyword_data
import requests

url = "https://google.serper.dev/search"
main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to the API"}), 200

@main.route('/api', methods=['GET'])
def api_root():
    return jsonify({"message": "API Root"}), 200

@main.route('/keygen', methods=['POST'])
async def generate_keywords():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    
    data = request.json
    keyword = data.get('keyword')
    if not keyword:
        return jsonify({"error": "Bad Request", "message": "Keyword is required."}), 400
    
    country = data.get('country', 'US')
    
    # Attempt to load additional_keywords safely
    additional_keywords_str = data.get('additional_keywords', '[]')
    try:
        additional_keywords = json.loads(additional_keywords_str)
    except json.JSONDecodeError:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON format for additional_keywords."}), 400
    
    try:
        keyword_data = await get_keyword_data(keyword, country, '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',additional_keywords)
    except Exception as e:
        return jsonify({"error": "Server Error", "message": str(e)}), 500
    
    return jsonify(keyword_data)

@main.route('/titlegen', methods=['POST'])
async def generate_title():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    
    data = request.json
    keyword = data.get('keyword')
    if not keyword:
        return jsonify({"error": "Bad Request", "message": "Keyword is required."}), 400
    
    country = data.get('country', 'US')
    if not country:
        return jsonify({"error": "Bad Request", "message": "Country is required."}), 400
    
    payload = json.dumps({
    "q": keyword,
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
        results = {'results': extracted_data}
    else:
        results = {'error': 'Failed to fetch data', 'status_code': response.status_code}
    return results; 

@main.route('/serpscan', methods=['POST'])
async def serp_scan():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    
    data = request.json
    keyword = data.get('keyword')
    if not keyword:
        return jsonify({"error": "Bad Request", "message": "Keyword is required."}), 400

    country = data.get('country', 'US')
    suggestions = await get_suggestions_for_query_async(keyword, country)

    return jsonify({"success": True, "suggestions": suggestions})

