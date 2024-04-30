
from openai import AsyncOpenAI
import asyncio


MAX_RETRIES  = 5

async def generate_response(user_prompt, model, api_key, base_url="https://api.openai.com/v1", temperature=0.7):
    response = None
    async_openai_client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url
        )   

    for attempt in range(MAX_RETRIES):
        try:
            completion = await async_openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": user_prompt}],
                temperature=temperature,
            )
            response = completion.choices[0].message.content

        except Exception as e:
            if attempt < MAX_RETRIES - 1:  # don't wait after the last attempt
                await asyncio.sleep(1 * (2**attempt))
            else:
                print(f"Response generation exception after max retries: {e}")
                return None


        return response