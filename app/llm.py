from openai import AsyncOpenAI
import asyncio

MAX_RETRIES = 5

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
    async_openai_client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    for attempt in range(MAX_RETRIES):
        try:
            # Prepare the API call parameters
            api_params = {
                "model": model,
                "messages": [{"role": "user", "content": user_prompt}],
                "temperature": temperature
            }

            # Add response_format only for OpenAI API
            if "openai.com" in base_url:
                api_params["response_format"] = {"type": "json_object"}

            completion = await async_openai_client.chat.completions.create(**api_params)
            response = completion.choices[0].message.content
            return response

        except Exception as e:
            print(f"Response generation exception: {e}")
            if attempt < MAX_RETRIES - 1:  # don't wait after the last attempt
                await asyncio.sleep(1 * (2 ** attempt))
            else:
                print(f"Response generation exception after max retries: {e}")
                return None
            

async def generate_response_stream(user_prompt, model, api_key, base_url="https://api.openai.com/v1", temperature=0.7):
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
    async_openai_client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    for attempt in range(MAX_RETRIES):
        try:
            api_params_stream = {
                "model": model,
                "messages": [{"role": "user", "content": user_prompt}],
                "temperature": temperature,
                "stream": True
            }
            
            if "openai.com" in base_url:
                api_params_stream["response_format"] = {"type": "json_object"}
            
            async for chunk in await async_openai_client.chat.completions.create(**api_params_stream):
                if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                    print(f"Chunk content: {chunk.choices[0].delta.content}")
                    yield chunk.choices[0].delta.content

        except Exception as e:
            print("Stream exception")
            print(f"Response generation exception: {e}")
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(1 * (2 ** attempt))
            else:
                print(f"Response generation exception after max retries: {e}")
                return
    print("Stream finished")