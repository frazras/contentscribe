from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import asyncio
import json
from .keygen import get_keyword_data, combine_headings, title_gen_ai_analysis, outline_gen_ai_analysis, article_gen_ai_analysis, perplexity_ai_analysis, invoke_perplexity
from .llm import generate_response_stream
import requests
from tavily import TavilyClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access variables securely
LLM_MODEL = os.getenv('LLM_MODEL', 'gpt-4o')  # Smart AI
LLM_MODEL_B = os.getenv('LLM_MODEL_B', 'gpt-3.5-turbo')  # Fast AI
API_KEY = os.getenv('API_KEY')
API_KEY_B = os.getenv('API_KEY_B',API_KEY)
BASE_URL = os.getenv('BASE_URL', 'https://api.openai.com/v1')
BASE_URL_B = os.getenv('BASE_URL_B', BASE_URL)

router = APIRouter()

url = "https://google.serper.dev/search"

@router.get('/')
async def index():
    return {"message": "Welcome to the API"}

@router.get('/api')
async def api_root():
    return {"message": "API Root"}

@router.post('/keygen')
async def generate_keywords(request: Request):
    data = await request.json()
    input_keyword = data.get('input_keyword')
    if not input_keyword:
        raise HTTPException(status_code=400, detail="Keyword is required.")
    
    country = data.get('country', 'US')
    
    try:
        keyword_data = await get_keyword_data(input_keyword, country)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return keyword_data

@router.post('/serpscrape')
async def generate_title(request: Request):
    data = await request.json()
    input_keyword = data.get('input_keyword')
    if not input_keyword:
        raise HTTPException(status_code=400, detail="Keyword is required.")
    
    country = data.get('country', 'US')
    
    payload = json.dumps({
        "q": input_keyword,
        "gl": country
    })
    headers = {
        'X-API-KEY': os.getenv('SERPER_API_KEY'),
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    
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
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch data")

    tavily = TavilyClient(api_key=os.getenv('TAVILY_API_KEY'))
    
    try:
        tavily_response = tavily.search(query=input_keyword, search_depth="advanced")
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data from Tavily: {e.response.text}")
    
    context = tavily_response['results']

    return {
        "success": True,
        "results": {
            "serp": results,
            "context": context
        }
    }

@router.post('/headerscrape')
async def serp_scan(request: Request):
    data = await request.json()
    links = data.get('selected_articles')
    if not links:
        raise HTTPException(status_code=400, detail="Links are required.")
    
    results = {
        "headings": await combine_headings(links)
    }

    return {"success": True, "results": results}

@router.post('/newtitlegen')
async def new_title_gen(request: Request):
    data = await request.json()
    titles = await title_gen_ai_analysis(data)
    return {"success": True, "results": titles}

@router.post('/outlinegen')
async def outline_gen(request: Request):
    data = await request.json()
    outline = await outline_gen_ai_analysis(data)
    return {"success": True, "results": outline}

@router.post('/articlegen')
async def article_gen(request: Request):
    print("Received articlegen request")
    try:
        data = await request.json()
        print("Request data:", data)
    except Exception as e:
        print("Error parsing request JSON:", str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON in request body")

    if not data:
        raise HTTPException(status_code=400, detail="Request body is empty")

    async def generate():
        try:
            print("Starting article generation")
            async for chunk in article_gen_ai_analysis(data):
                print("Yielding chunk:", chunk)
                yield chunk.encode('utf-8')
            print("Article generation complete")
        except Exception as e:
            print(f"Error in article generation: {str(e)}")
            yield f"Error: {str(e)}".encode('utf-8')

    print("Returning StreamingResponse")
    return StreamingResponse(generate(), media_type='text/plain')

@router.post('/articlebrief')
async def article_brief(request: Request):
    data = await request.json()
    brief = await perplexity_ai_analysis(data)
    return {"success": True, "results": brief}