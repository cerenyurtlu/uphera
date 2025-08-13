import asyncio
import os
from services.enhanced_ai_coach import enhanced_ada_ai

async def test_ai():
    print("Testing AI bot...")
    try:
        async for chunk in enhanced_ada_ai.get_enhanced_response(
            'test_user', 
            'Merhaba, ben test kullanıcısıyım. Bana kapsamlı bir yanıt ver.', 
            'general'
        ):
            print(chunk, end='', flush=True)
        print("\n---TEST COMPLETE---")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    os.environ['GEMINI_API_KEY'] = "AIzaSyDzneKXfPU_tq5-8K0DIDRvgZ1qd0PjjWg"
    asyncio.run(test_ai())
