import logging
from flask import Blueprint, request, jsonify, Response, stream_with_context
import json
from .keygen import get_keyword_data, combine_headings, title_gen_ai_analysis, outline_gen_ai_analysis, article_gen_ai_analysis, perplexity_ai_analysis, invoke_perplexity
import requests
from tavily import TavilyClient
import asyncio

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


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
    

    try:
        keyword_data = await get_keyword_data(input_keyword, country)
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
        'X-API-KEY': os.getenv('SERPER_API_KEY'),
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    
    if response.status_code == 200:
        results_data = response.json()
        organic_results = results_data.get('organic', [])
        extracted_data = []
        # ignore non article domains without headings
        ignored_domains = ['youtube.com', 'pinterest.com', 'quora.com', 'reddit.com', 'tiktok.com', 'instagram.com', 'facebook.com', 'play.google.com', 'apps.apple.com', 'amazon.com', 'tripadvisor.com', 'etsy.com']
        for result in organic_results:
            urllink = result.get('link')
            domain = urllink.split('/')[2]  # Extract the domain from the URL
            if any(ignored_domain in domain for ignored_domain in ignored_domains):
                continue
            title = result.get('title')
            position = result.get('position')
            extracted_data.append({'title': title, 'position': position, 'url': urllink})
        results = extracted_data
    else:
        results = {'error': 'Failed to fetch data', 'status_code': response.status_code}

    tavily = TavilyClient(api_key=os.getenv('TAVILY_API_KEY'))
    
    try:
        response = tavily.search(query=input_keyword, search_depth="advanced")
    except requests.exceptions.HTTPError as e:
        logging.error(f"HTTPError: {e.response.status_code} - {e.response.text}")
        return jsonify({"error": "Failed to fetch data from Tavily", "details": e.response.text}), 500
    
    # Log the response object to debug its structure
    logging.debug(f"Response object: {response}")
    
    # Ensure response has 'results' attribute
    if 'results' not in response:
        logging.error("Response object does not contain 'results'")
        return jsonify({"error": "Invalid response structure"}), 500

    context = response['results']
    # context = [{"url": obj["url"], "content": obj["content"]} for obj in response['results']]

    result = {
        "success": True,
        "results": {
            "serp": results,
            "context": context
        }
    }
    return jsonify(result)

@main.route('/headerscrape', methods=['POST'])
async def serp_scan():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    print("GOT REQUESTed")
    data = request.json
    print("GOT DATA")
    print(data)
    links = data.get('selected_articles')
    print("GOT LINKS")
    print(links)
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
    print("GOT REQUEST...")
    data = request.json
    print("GOT DATA")
    #print(data)
    titles = await title_gen_ai_analysis(data)
    print("GOT TITLES")
    print(titles)
    return jsonify({"success": True, "results": titles})

@main.route('/outlinegen', methods=['POST'])
async def outline_gen():
    print("GOT REQUEST-----")
    data = request.json
    print("GOT DATA", data)
    outline = await outline_gen_ai_analysis(data)
    print("GOT OUTLINE", outline)
    return jsonify({"success": True, "results": outline})

@main.route('/articlegen', methods=['POST'])
def article_gen():
    print("Preparing article generation")
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    print("GOT DATA")
    data = request.json

    async def generate():
        print("Starting generate")
        async for chunk in article_gen_ai_analysis(data):
            print(f"Received chunk: {chunk}")
            words = chunk.split()
            for i in range(0, len(words), 5):
                mini_chunk = ' '.join(words[i:i+5])
                print(f"Yielding mini_chunk: {mini_chunk}")
                yield mini_chunk + ' '
                yield '\n'

    def stream():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            async_gen = generate()
            while True:
                try:
                    chunk = loop.run_until_complete(async_gen.__anext__())
                    print(f"Yielding to Flask!: {chunk}")
                    yield chunk
                    yield ''  # This empty string forces a flush
                except StopAsyncIteration:
                    print("StopAsyncIteration")
                    break
        finally:
            print("Closing loop")
            loop.close()

    print("Returning Response")
    return Response(stream_with_context(stream()), mimetype='text/plain')

@main.route('/articlebrief', methods=['POST'])
async def article_brief():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The browser (or proxy) sent a request that this server could not understand."}), 400
    print("GOT REQUEST")
    data = request.json
    print("GOT DATA")
    print(data)
    brief = await perplexity_ai_analysis(data)
    print("GOT BRIEF")
    print(brief)
    return jsonify({"success": True, "results": brief})

@main.route('/test-perplexity', methods=['POST'])
async def test_perplexity():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "The request must be JSON"}), 400
    
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"error": "Bad Request", "message": "Prompt is required"}), 400
    
    try:
        response = await invoke_perplexity(prompt)
        return jsonify({"success": True, "response": response})
    except Exception as e:
        return jsonify({"error": "Server Error", "message": str(e)}), 500