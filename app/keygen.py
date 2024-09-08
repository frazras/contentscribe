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

def set_llm_variables(selected_llm):
    """
    Set the LLM_MODEL variables based on the selected_llm value.
    
    Args:
    selected_llm (str): The LLM selected in the UI.
    
    Returns:
    dict: A dictionary containing the LLM_MODEL, LLM_MODEL_B, API_KEY, and BASE_URL.
    """
    if selected_llm == "gemini":
        return {
            "LLM_MODEL": os.getenv('GOOGLE_GEMINI_MODEL'),
            "LLM_MODEL_B": os.getenv('GOOGLE_GEMINI_MODEL_B'),
            "API_KEY": os.getenv('GOOGLE_GEMINI_API_KEY'),
            "BASE_URL": os.getenv('GOOGLE_GEMINI_BASE_URL')
        }
    elif selected_llm == "openai":
        return {
            "LLM_MODEL": os.getenv('OPENAI_LLM_MODEL'),
            "LLM_MODEL_B": os.getenv('OPENAI_LLM_MODEL_B'),
            "API_KEY": os.getenv('OPENAI_API_KEY'),
            "BASE_URL": os.getenv('OPENAI_BASE_URL')
        }
    elif selected_llm == "anthropic":
        return {
            "LLM_MODEL": os.getenv('ANTHROPIC_MODEL'),
            "LLM_MODEL_B": os.getenv('ANTHROPIC_MODEL_B'),
            "API_KEY": os.getenv('ANTHROPIC_API_KEY'),
            "BASE_URL": os.getenv('ANTHROPIC_BASE_URL')
        }
    else:
        # Default to OpenAI if no match is found
        return {
            "LLM_MODEL": os.getenv('OPENAI_LLM_MODEL'),
            "LLM_MODEL_B": os.getenv('OPENAI_LLM_MODEL_B'),
            "API_KEY": os.getenv('OPENAI_API_KEY'),
            "BASE_URL": os.getenv('OPENAI_BASE_URL')
        }

async def get_keyword_data(input_keyword, input_country):
    # Get results
    print("GETTING KEY WORDS")

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
    return keyword_data

def remove_similar_keywords(keyword_data):
    keyword_data = [keyword for keyword in keyword_data if len(set(keyword.split())) > 1]
    keyword_data.sort()
    return keyword_data

async def suggestions_ai_analysis(keyword_data: str, selected_llm: str):
    max_retries = 5
    print("ANALYZING KEY WORDS")
    
    llm_vars = set_llm_variables(selected_llm)
    
    for _ in range(max_retries):
        try:
            # Get Json Structure
            prompt = keyword_aggregation.format(
                KEYWORD_DATA=keyword_data
            )
            print("awaiting Ai KEY WORDS")

            return await generate_response(prompt, llm_vars["LLM_MODEL_B"], llm_vars["API_KEY"], llm_vars["BASE_URL"], 0)

        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion keywords. Exception type: {type(e).__name__}, Message: {str(e)}"
            )

    return ""

async def suggestions_ai_analysis_headings(heading_data: str, selected_llm: str):
    max_retries = 5
    print("ANALYZING HEADINGS")

    llm_vars = set_llm_variables(selected_llm)

    for _ in range(max_retries):
        try:
            # Prepare the prompt with heading data
            prompt = heading_aggregation.format(
                HEADING_DATA=heading_data
            )
            print("awaiting Ai HEADINGS")

            # Generate response without parsing JSON
            response = await generate_response(prompt, llm_vars["LLM_MODEL_B"], llm_vars["API_KEY"], llm_vars["BASE_URL"], 0)
            return response
        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion headings. Exception type: {type(e).__name__}, Message: {str(e)}"
            )

    return ""

async def title_gen_ai_analysis(context_data: dict, selected_llm: str):
    max_retries = 5
    print("ANALYZING data for title gen")
    input_keyword = context_data.get('input_keyword')
    selected_articles = [article['title'] for article in context_data.get('selected_articles')]
    selected_headings = context_data.get('selected_headings')
    selected_keywords = context_data.get('selected_keywords')

    llm_vars = set_llm_variables(selected_llm)

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
            print("PROMPT")
            print(prompt)
            print("\n")
            
            # Generate response without parsing JSON
            response = await generate_response(prompt, llm_vars["LLM_MODEL_B"], llm_vars["API_KEY"], llm_vars["BASE_URL"], 0)
            print("RESPONSE")
            print(response)
            return response
        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion ai titles. Exception type: {type(e).__name__}, Message: {str(e)}"
            )

    return ""

async def outline_gen_ai_analysis(context_data: dict, selected_llm: str):
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

    llm_vars = set_llm_variables(selected_llm)

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
            print("\n")
            
            # Generate response without parsing JSON
            response = await generate_response(prompt, llm_vars["LLM_MODEL"], llm_vars["API_KEY"], llm_vars["BASE_URL"], 0)
            print("RESPONSE")
            print(response)
            return response
        except Exception as e:
            print(
                f"Failed to generate analysis for suggestion ai outline. Exception type: {type(e).__name__}, Message: {str(e)}"
            )
    return ""

async def article_gen_ai_analysis(context_data: dict, selected_llm: str):
    print("ANALYZING data for article gen")
    if not context_data:
        raise ValueError("context_data is None or empty")
    
    data = context_data
    selected_headings = data.get('selected_headings', [])
    selected_articles = [article['title'] for article in data.get('selected_articles', [])]
    selected_keywords = data.get('selected_keywords', [])
    title = data.get('customTitle') or data.get('selectedTitle', '')
    input_keyword = data.get('input_keyword', '')
    article_outline = data.get('outline', [])
    context = data.get('context', '')
    article_brief = data.get('articleBrief', {}).get('content_brief', '')
    user_prompt = data.get('userPrompt', '')
   
    print("context_data keys")
    print(data.keys())

    llm_vars = set_llm_variables(selected_llm)
    
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
                async for chunk in generate_response_stream(prompt, llm_vars["LLM_MODEL"], llm_vars["API_KEY"], llm_vars["BASE_URL"], 0):
                    print(chunk)
                    yield chunk
            except Exception as e:
                print(f"Failed to generate analysis for suggestion ai article. Exception type: {type(e).__name__}, Message: {str(e)}")
                yield f"Error: {str(e)}"
             
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
        model=os.getenv('PERPLEXITY_MODEL'),
        api_key=os.getenv('PERPLEXITY_API_KEY'),
        base_url=os.getenv('PERPLEXITY_BASE_URL')
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
                return response
        except Exception as e:
            print(f"Failed to generate analysis for suggestion ai outline. Exception type: {type(e).__name__}, Message: {str(e)}")
        
    return {}