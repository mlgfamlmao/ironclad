from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()
api_key1 = os.getenv("GOOGLE_API_KEY")

if not api_key1:
    raise RuntimeError("GOOGLE_API_KEY is not set.")

client = genai.Client(api_key=api_key1) 

def chat_with_gemini(system_instruction: str, chat_history: list):
    
    try:
        
        formatted_contents = []
        
        
        
        formatted_contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=system_instruction)]
            )
        )
        
        
        for msg in chat_history:
            role = "user" if msg["role"] == "user" else "model"
            formatted_contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg["content"])]
                )
            )

        
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", 
            contents=formatted_contents,
            config=types.GenerateContentConfig(
                temperature=0.7, 
                max_output_tokens=500 
            )
        )
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "Command Link Severed. Unable to process request."