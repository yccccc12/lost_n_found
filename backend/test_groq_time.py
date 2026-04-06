import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from groq import Groq

# Load environment variables (gets GROQ_API_KEY from .env)
load_dotenv()

def get_current_time_in_malaysia() -> str:
    # Malaysia is UTC+8
    now_utc = datetime.utcnow()
    now_malaysia = now_utc + timedelta(hours=8)
    return now_malaysia.strftime("%A, %B %d, %Y %I:%M:%S %p (Malaysia Time)")

def query_groq_with_time(prompt: str):
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    
    current_time_str = get_current_time_in_malaysia()
    
    # We give Groq the "System Prompt" which acts as its memory/core instructions
    system_prompt = f"""
    You are a helpful AI assistant. 
    You DO have access to the current real-time clock.
    The current date and time is: {current_time_str}
    """
    
    print(f"\nUser: {prompt}")
    print("🤖 Groq: Thinking...")
    
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.7,
    )
    
    print(f"🤖 Groq: {chat_completion.choices[0].message.content.strip()}\n")

if __name__ == "__main__":
    print("--- Testing Groq's knowledge and time awareness ---")
    
    print(f"System Clock says: {get_current_time_in_malaysia()}")
    
    # Question 1: Time awareness test (Now with injected time!)
    query_groq_with_time("What is the current time and date in Malaysia right now? Are you aware of the real-time clock?")
    
    # Question 2: Another typical knowledge cutoff check
    query_groq_with_time("Who is the current Prime Minister of Malaysia?")
