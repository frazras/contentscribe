from flask import Blueprint, request, jsonify
import json
from .keygen import get_keyword_data, combine_headings, title_gen_ai_analysis
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
    input_keyword = data.get('input_keyword')
    if not input_keyword:
        return jsonify({"error": "Bad Request", "message": "Keyword is required."}), 400
    
    country = data.get('country', 'US')
    
    # Attempt to load additional_keywords safely
    additional_keywords_str = data.get('additional_keywords', '[]')
    try:
        additional_keywords = json.loads(additional_keywords_str)
    except json.JSONDecodeError:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON format for additional_keywords."}), 400
    
    try:
        keyword_data = await get_keyword_data(input_keyword, country,additional_keywords)
    except Exception as e:
        return jsonify({"error": "Server Error", "message": str(e)}), 500
    
    return jsonify(keyword_data)

@main.route('/serpscrape', methods=['POST'])
async def generate_title():
    
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    
    data = request.json
    print(data)
    input_keyword = data.get('input_keyword')
    # additional_keywords = data.get('additional_keywords', []);
    # ai_report = data.get('ai_report', '');
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

