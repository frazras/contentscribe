import json
import requests
import httpx
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from .prompts import *
from .llm import *
import os
from dotenv import load_dotenv
import json_repair

# Load environment variables from .env file
load_dotenv()

# Access variables securely
LLM_MODEL = os.getenv('LLM_MODEL', 'gpt-4o')  # Smart AI
LLM_MODEL_B = os.getenv('LLM_MODEL_B', 'gpt-3.5-turbo')  # Fast AI
API_KEY = os.getenv('API_KEY')
API_KEY_B = os.getenv('API_KEY_B',API_KEY)
BASE_URL = os.getenv('BASE_URL', 'https://api.openai.com/v1')
BASE_URL_B = os.getenv('BASE_URL_B', BASE_URL)

PERPLEXITY_MODEL = os.getenv('PERPLEXITY_MODEL', 'llama-3-sonar-large-32k-chat')
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY', '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')
PERPLEXITY_BASE_URL = os.getenv('PERPLEXITY_BASE_URL', 'https://api.perplexity.ai')

async def get_keyword_data(input_keyword, input_country):
    # Get results
    print("GETTTING KEY WORDS")

    keyword_data = await get_suggestion_keywords_google_optimized(
        input_keyword, input_country
     )
    
    #size of keyword_data
    print("Got " + str(len(keyword_data)) + " keywords")
    #remove duplicates
    keyword_data = list(set(keyword_data))
    keyword_data.sort()
    
    #remove duplicate keywords that have all the same words but in a different order
    #by splitting the keyword into words and sorting them
    keyword_data = remove_similar_keywords(keyword_data)

    print("Got " + str(len(keyword_data)) + " cleaned keywords")
    print(json.dumps(keyword_data, indent=4))
    
    max_attempts = 2
    for attempt in range(max_attempts):
        try:
            ai_report = await suggestions_ai_analysis(keyword_data)
            print(ai_report)
            # convert to json
            try:
                ai_report = json_repair.loads(ai_report)
            except json.JSONDecodeError as e:
                print(f"JSON decoding failed: {str(e)} - Response was: '{ai_report}'")
                ai_report = {}
            break
        except Exception as e:
            print(f"Exception occurred: {str(e)}. Attempt {attempt + 1} of {max_attempts}")
            if attempt == max_attempts - 1:
                ai_report = {}

    # Preparing the result
    result = {
        "success": True,
        "results": ai_report,
    }

    return result

def remove_similar_keywords(keyword_data):
    keyword_data = [keyword for keyword in keyword_data if len(set(keyword.split())) > 1]
    keyword_data.sort()
    return keyword_data

async def suggestions_ai_analysis(keyword_data: str):
    max_retries = 5
    print("ANALYZING KEY WORDS")
    
    for _ in range(max_retries):
        try:
            # Get Json Structure
            prompt = keyword_aggregation.format(
                KEYWORD_DATA=keyword_data
            )
            print("awaiting Ai KEY WORDS")

            return await generate_response(prompt, LLM_MODEL_B, API_KEY_B,BASE_URL_B, 0)

        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion keywords. Exception type: {type(e).__name__}, Message: {str(e)}"
            )

    return ""

async def suggestions_ai_analysis_headings(heading_data: str):
    max_retries = 5
    print("ANALYZING HEADINGS")

    for _ in range(max_retries):
        try:
            # Prepare the prompt with heading data
            prompt = heading_aggregation.format(
                HEADING_DATA=heading_data
            )
            print("awaiting Ai HEADINGS")

            # Generate response and directly parse JSON to avoid escaped text
            response = await generate_response(prompt, LLM_MODEL_B, API_KEY_B, BASE_URL_B, 0)
            if response:
                try:
                    return json_repair.loads(response)  # Directly parse the JSON response to remove escaped text
                except json.JSONDecodeError as e:
                    print(f"JSON decoding failed: {str(e)} - Response was: '{response}'")
                    return {}
        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion headings. Exception type: {type(e).__name__}, Message: {str(e)}"
            )

    return {}

async def title_gen_ai_analysis(context_data: dict):
    max_retries = 5
    #convert json to dict
    print("ANALYZING data for title gen")
    input_keyword = context_data.get('input_keyword')
    #selected_articles is a list of objects with keys: url and  title, extract to a list of titles
    selected_articles = [article['title'] for article in context_data.get('selected_articles')]
    selected_headings = context_data.get('selected_headings')
    selected_keywords = context_data.get('selected_keywords')

    for _ in range(max_retries):
        try:
            # Prepare the prompt with heading data
            prompt = title_gen.format(
                INPUT_KEYWORD=input_keyword,
                SELECTED_ARTICLES=selected_articles,
                SELECTED_HEADINGS=selected_headings,
                SELECTED_KEYWORDS=selected_keywords
            )
            print("awaiting Ai TITLES")

            # Generate response and directly parse JSON to avoid escaped text
            print("PROMPT")
            print(prompt)
            #pint newline
            print("\n")
            response = await generate_response(prompt, LLM_MODEL_B, API_KEY_B, BASE_URL_B, 0)
            if response:
                print("RESPONSE")
                print(response)
                try:
                    return json_repair.loads(response)  # Directly parse the JSON response to remove escaped text
                except json.JSONDecodeError as e:
                    print(f"JSON decoding failed: {str(e)} - Response was: '{response}'")
                    return {}
        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion ai titles. Exception type: {type(e).__name__}, Message: {str(e)}"
            )

    return {}

async def outline_gen_ai_analysis(context_data: dict):
    max_retries = 5
    print("ANALYZING data for outline gen")
    selected_articles = [article['title'] for article in context_data.get('selected_articles')]
    selected_headings = context_data.get('selected_headings')
    selected_keywords = context_data.get('selected_keywords')
    title = context_data.get('customTitle') or context_data.get('selectedTitle')
    input_keyword = context_data.get('input_keyword')
    context = context_data.get('context')
    article_brief = context_data.get('articleBrief', {}).get('content_brief')
    user_prompt = context_data.get('userPrompt')
    print("retrieved variables")
    for _ in range(max_retries):
        try:
            print("formatting prompt")
            # Prepare the prompt with heading data
            prompt = outline_gen.format(
                INPUT_KEYWORD=input_keyword,
                SELECTED_ARTICLES=selected_articles,
                SELECTED_HEADINGS=selected_headings,
                SELECTED_KEYWORDS=selected_keywords,
                TITLE=title,
                CONTEXT=context,
                ARTICLE_BRIEF=article_brief,
                USER_PROMPT=user_prompt
            )
            print("awaiting Ai OUTLINE")
            print(prompt)
            #pint newline
            print("\n")
            response = await generate_response(prompt, LLM_MODEL, API_KEY, BASE_URL, 0)
            if response:
                print("RESPONSE")
                print(response)
                try:
                    return json_repair.loads(response)  # Directly parse the JSON response to remove escaped text
                except json.JSONDecodeError as e:
                    print(f"JSON decoding failed: {str(e)} - Response was: '{response}'")
                    return {}
        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion ai outline. Exception type: {type(e).__name__}, Message: {str(e)}"
            )
    return {}

async def article_gen_ai_analysis(context_data: dict):
    print("ANALYZING data for article gen")
    context_data = context_data.get('data')
    selected_headings = context_data.get('selected_headings', [])
    selected_articles = [article['title'] for article in context_data.get('selected_articles', [])]
    selected_keywords = context_data.get('selected_keywords', [])
    title = context_data.get('customTitle') or context_data.get('selectedTitle', '')
    input_keyword = context_data.get('input_keyword', '')
    article_outline = context_data.get('outline', [])
    context = context_data.get('context', '')
    article_brief = context_data.get('articleBrief', {}).get('content_brief', '')
    user_prompt = context_data.get('userPrompt', '')
   #print all keys in context_data
    print("context_data keys")
    print(context_data.keys())
    for section in article_outline:
        print("section", section)
        for header, sub_headers in section.items():
            print("header", header)
            try:
                print("formatting prompt")
                prompt = article_gen.format(
                    INPUT_KEYWORD=input_keyword,
                    SELECTED_ARTICLES=selected_articles,
                    SELECTED_HEADINGS=selected_headings,
                    SELECTED_KEYWORDS=selected_keywords,
                    TITLE=title,
                    HEADER=header,
                    SUB_HEADERS=sub_headers,
                    OUTLINE=article_outline,
                    CONTEXT=context,
                    ARTICLE_BRIEF=article_brief,
                    USER_PROMPT=user_prompt
                )
                print("awaiting Ai ARTICLE")
                print(prompt)
                print("\n")
                async for chunk in generate_response_stream(prompt, LLM_MODEL, API_KEY, BASE_URL, 0):
                    yield chunk
            except Exception as e:
                print(f"Failed to generate analysis for suggestion ai article. Exception type: {type(e).__name__}, Message: {str(e)}")

async def get_suggestion_keywords_google_optimized(query, countryCode):
    # Define categorization keywords for all categories
            categories = {
                "Questions": ["who", "what", "where", "when", "why", "how", "are"],
                # "Prepositions": ["can", "with", "for", "of", "about", "before", "after"],
                "Alphabet": list("abcdefghijklmnopqrstuvwxyz"),
                "Numbers": list("1234567890"),
                # "Comparisons": ["vs", "versus", "or", "comparison", "alternative"],
                # "Intent-Based": ["buy", "review", "price", "best", "top", "how to", "why to"],
                # "Time-Related": ["when", "schedule", "deadline", "today", "now", "latest"],
                # "Audience-Specific": ["for beginners", "for small businesses", "for students", "for professionals"],
                # "Problem-Solving": ["solution", "issue", "error", "troubleshoot", "fix"],
                # "Feature-Specific": ["with video", "with images", "analytics", "tools", "with example"],
                # "Opinions/Reviews": ["review", "opinion", "rating", "feedback", "testimonial"],
                # "Cost-Related": ["price", "cost", "budget", "cheap", "expensive", "value"],
                # "Trend-Based": ["trends", "new", "upcoming"],
                # "Location-Based": ["near me", "local", "in my area", "in my city", "in my country", "near"],
                # "Year-Based": ["2022", "2023", "2024", "2025"]
            }

            categorized_suggestions = {key: {} for key in categories.keys()}
            flat_suggestions = []

            for category in categories:
                for keyword in categories[category]:
                    try:
                        if category in ["Questions", "Prepositions", "Intent-Based", "Time-Related",
                                    "Audience-Specific", "Problem-Solving", "Opinions/Reviews", "Cost-Related", "Trend-Based"]:
                            modified_query = f"{keyword} {query}"
                        elif category in ["Alphabet", "Feature-Specific", "Industry-Specific"]:
                            modified_query = f"{query} {keyword}"
                        else:
                            # Default pattern if not specified above
                            modified_query = f"{keyword} {query}"

                        category_suggestions = await get_suggestions_for_query_async(modified_query,countryCode)
                        categorized_suggestions[category][keyword] = category_suggestions
                        flat_suggestions.extend(category_suggestions)
                    except Exception as e:
                        print (f"Error in get_suggestion_keywords_google_optimized, {e}")
            return flat_suggestions

async def get_suggestions_for_query_async(query,country):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"http://google.com/complete/search?output=toolbar&gl={country}&q={query}")
            suggestions = []
            if response.status_code == 200:
                root = ET.fromstring(response.content)
                for complete_suggestion in root.findall('CompleteSuggestion'):
                    suggestion_element = complete_suggestion.find('suggestion')
                    if suggestion_element is not None:
                        data = suggestion_element.get('data').lower()
                        suggestions.append(data)
        except Exception as e:
            #nothing
            error = e

        return suggestions

def get_suggestions_for_query(query):
    response = requests.get(f"http://google.com/complete/search?output=toolbar&q={query}")
    suggestions = []
    try:
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            for complete_suggestion in root.findall('CompleteSuggestion'):
                suggestion_element = complete_suggestion.find('suggestion')
                if suggestion_element is not None:
                    data = suggestion_element.get('data').lower()
                    suggestions.append(data)
    except Exception as e:
        print(
                f"keyword_research: get_suggestions_for_query. Exception type: {type(e).__name__}, Message: {str(e)}"
            )
    return suggestions

def scrape_headings(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            headings = set()  # Use a set to store unique headings
            for tag in soup.find_all(['h2', 'h3', 'h4']):
                heading_text = tag.get_text().strip()
                if heading_text not in headings:  # Check for duplicates
                    headings.add(heading_text)
            # Convert and sort set to list before returning
            headings = list(headings)
            headings.sort()
            return headings
        else:
            print(f"Received non-200 status code {response.status_code} for URL: {url}")
    except requests.RequestException as e:
        print(f"Failed to get a response for URL: {url}. Error: {e}")
    return []  # Return an empty list on failure

async def combine_headings(urls):
    all_headings = []  # Use a list to store unique headings
    for url_info in urls:
        url = url_info.get('url')  # Assuming url_info is a dict with a 'url' key
        if url:
            print(f"Scraping URL: {url}")
            headings = scrape_headings(url)
            for heading in headings:
                if heading not in all_headings:
                    all_headings.append(heading)
    # Convert set to list if necessary, or process as needed
    print(f"Combined headings: {all_headings}")
    return all_headings

async def invoke_perplexity(prompt):
    response = await generate_response(
        user_prompt=prompt,
        model=PERPLEXITY_MODEL,
        api_key=PERPLEXITY_API_KEY,
        base_url=PERPLEXITY_BASE_URL
    )
    return response

async def perplexity_ai_analysis(context_data: dict):
    print("PERPLEXITY")
    max_retries = 5
    selected_headings = context_data.get('selected_headings', [])
    selected_articles = [article['title'] for article in context_data.get('selected_articles', [])]
    selected_keywords = context_data.get('selected_keywords', [])
    title = context_data.get('customTitle') or context_data.get('selectedTitle', '')
    input_keyword = context_data.get('input_keyword', '')
    context = context_data.get('context', '')
    article_brief = context_data.get('articleBrief', {}).get('content_brief')
    user_prompt = context_data.get('userPrompt')

    print("Context Data:", context_data)  # Log the context data

    for _ in range(max_retries):
        try:
            print("FORMATTING PROMPT")
            prompt = perplexity_gen.format(
                INPUT_KEYWORD=input_keyword,
                SELECTED_ARTICLES=selected_articles,
                SELECTED_HEADINGS=selected_headings,
                SELECTED_KEYWORDS=selected_keywords,
                TITLE=title,
                CONTEXT=context,
                ARTICLE_BRIEF=article_brief,
                USER_PROMPT=user_prompt
            )
            print("PROMPT")
            print(prompt)
            response = await invoke_perplexity(prompt)
            if response:
                try:
                    return json_repair.loads(response)
                except json.JSONDecodeError as e:
                    print(f"JSON decoding failed: {str(e)} - Response was: '{response}'")
                    return {}
        except Exception as e:
            print(f"Failed to generate analysis for suggestion ai outline. Exception type: {type(e).__name__}, Message: {str(e)}")
        
    return {}

if __name__ == "__main__":
    asyncio.run(invoke_perplexity("What is the capital of France?"))
