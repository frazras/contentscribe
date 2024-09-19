from openai import AsyncOpenAI
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
import asyncio
import json_repair
import httpx
import os

MAX_RETRIES = 5

async def anthropic_request(user_prompt, model, api_key, stream=False):
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }

    max_tokens = 4096
    if "claude-3-5-sonnet-20240620" in model:
        max_tokens = 8192

    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        "stream": stream
    }

    return headers, payload

async def generate_anthropic_response(user_prompt, model, api_key):
    user_prompt = user_prompt.replace('"', '')
    headers, payload = await anthropic_request(user_prompt, model, api_key)
    
    async with httpx.AsyncClient() as client:
        print(f"Sending request to Anthropic API... Model: {model}")
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload
        )
        print("Response from Anthropic API:")
        print(response.text)
        response.raise_for_status()
        result = json_repair.loads(response.text)
        return json_repair.loads(result['content'][0]['text'])

async def generate_anthropic_stream(user_prompt, model, api_key):
    headers, payload = await anthropic_request(user_prompt, model, api_key, stream=True)

    async with httpx.AsyncClient() as client:
        async with client.stream("POST", "https://api.anthropic.com/v1/messages", headers=headers, json=payload) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = json_repair.loads(line[6:])
                    if 'content' in data and len(data['content']) > 0:
                        yield data['content'][0]['text']

async def generate_response(user_prompt, model, api_key, base_url="https://api.openai.com/v1", temperature=0.7):
    """
    Generate a response from the AI model based on the user prompt.

    Parameters:
    - user_prompt (str): The prompt to send to the AI model.
    - model (str): The model to use for generating the response.
    - api_key (str): The API key for authentication.
    - base_url (str): The base URL for the API. Default is "https://api.openai.com/v1".
    - temperature (float): The temperature setting for the model. Default is 0.7.

    Returns:
    - str: The generated response from the AI model, or None if an error occurs.
    """

    for attempt in range(MAX_RETRIES):
        print(f"Attempt {attempt + 1} of {MAX_RETRIES}")
        try:
            api_params = {
                "model": model,
                "messages": [{"role": "user", "content": user_prompt}],
                "temperature": temperature
            }
            if "anthropic.com" not in base_url and "googleapis.com" not in base_url:
                print(f"Using OpenAI API. Model: {model}")
                async_openai_client = AsyncOpenAI(api_key=api_key, base_url=base_url)
                if "openai.com" in base_url:
                    api_params["response_format"] = {"type": "json_object"}

            if "googleapis.com" in base_url:
                print(f"Using Google Gemini API. Model: {model}")
                return await generate_gemini_response(user_prompt, model, api_key, temperature)
            
            if "anthropic.com" in base_url:
                print(f"Using Anthropic API. Model: {model}")
                return await generate_anthropic_response(user_prompt, model, api_key)

            completion = await async_openai_client.chat.completions.create(**api_params)

            try:
                response = json_repair.loads(completion.choices[0].message.content)
                return response
            except Exception as e:
                print(f"Response generation exception: {e}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(1 * (2 ** attempt))
                    continue
                return {}

        except Exception as e:
            print(f"Response generation exception attempt #{attempt}: {e}")
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(1 * (2 ** attempt))
            else:
                print(f"Response generation exception after max retries: {e}")
                return {}

async def generate_response_stream(user_prompt, model, api_key, base_url="https://api.openai.com/v1", temperature=0.7, json_response=False):
    """
    Generate a response from the AI model based on the user prompt.

    Parameters:
    - user_prompt (str): The prompt to send to the AI model.
    - model (str): The model to use for generating the response.
    - api_key (str): The API key for authentication.
    - base_url (str): The base URL for the API. Default is "https://api.openai.com/v1".
    - temperature (float): The temperature setting for the model. Default is 0.7.

    Yields:
    - str: The generated response from the AI model, streamed in chunks.
    """
    if "anthropic.com" not in base_url:
        async_openai_client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    for attempt in range(MAX_RETRIES):
        print(f"Attempt {attempt + 1} of {MAX_RETRIES}")
        try:
            api_params_stream = {
                "model": model,
                "messages": [{"role": "user", "content": user_prompt}],
                "temperature": temperature,
                "stream": True
            }
            
            if "openai.com" in base_url and json_response:
                api_params_stream["response_format"] = {"type": "json_object"}
            
            if "googleapis.com" in base_url:
                print(f"Using Google Gemini API (stream). Model: {model}")
                async for chunk in generate_gemini_stream(user_prompt, model, api_key, temperature):
                    yield chunk
            elif "anthropic.com" in base_url:
                print(f"Using Anthropic API (stream). Model: {model}")
                async for chunk in generate_anthropic_stream(user_prompt, model, api_key):
                    yield chunk
            else:
                print(f"Using OpenAI API (stream). Model: {model}")
                async for chunk in await async_openai_client.chat.completions.create(**api_params_stream):
                    if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
            break

        except Exception as e:
            print(f"Stream exception attempt #{attempt}: {e}")
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(1 * (2 ** attempt))
            else:
                print(f"Stream exception after max retries: {e}")
                return
    print("Stream finished")

async def generate_gemini_response(user_prompt, model, api_key, temperature=0.7):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name=model)
    
    generation_config = GenerationConfig(
        temperature=temperature,
        top_p=1,
        top_k=1,
        max_output_tokens=2048,
    )
    
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
    ]
    
    response = model.generate_content(
        user_prompt,
        generation_config=generation_config,
        safety_settings=safety_settings,
    )
    
    return json_repair.loads(response.text)

async def generate_gemini_stream(user_prompt, model, api_key, temperature=0.7):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name=model)
    
    generation_config = GenerationConfig(
        temperature=temperature,
        top_p=1,
        top_k=1,
        max_output_tokens=2048,
    )
    
    response = model.generate_content(
        user_prompt,
        generation_config=generation_config,
        stream=True
    )
    
    async for chunk in response:
        yield chunk.text