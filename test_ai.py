import asyncio
import os
from services.enhanced_ai_coach import enhanced_ada_ai  # pyright: ignore[reportMissingImports]

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
    # API key'i environment variable'dan al, hardcoded değil
    if not os.getenv('GEMINI_API_KEY'):
        print("❌ GEMINI_API_KEY environment variable bulunamadı!")
        print("Lütfen .env dosyasında GEMINI_API_KEY tanımlayın.")
        exit(1)
    asyncio.run(test_ai())