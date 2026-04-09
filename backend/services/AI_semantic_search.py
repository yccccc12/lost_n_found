import os
import json
import traceback
import re
from groq import Groq

def find_best_matches(user_query: str, found_items: list[dict], api_key: str = None) -> list[dict]:
    """
    Takes a user's search query and a list of found items from MongoDB.
    Uses Groq (LLaMA 3) to rank items by relevance and return structured results.
    
    api_key: Pass the Groq API key directly (from main.py where dotenv is loaded).
    """

    # If no items to match against, return empty
    if not found_items:
        print("[AI SERVICE] No found items to match against — returning empty.")
        return []

    # Resolve API key
    resolved_key = api_key or os.environ.get("GROQ_API_KEY")
    if not resolved_key:
        print("[AI SERVICE] ERROR: GROQ_API_KEY is not set!")
        raise ValueError("GROQ_API_KEY is missing. Add it to your .env file.")

    # Build a clean list of items for the prompt (only relevant fields)
    items_for_prompt = []
    for item in found_items:
        items_for_prompt.append({
            "item_id": str(item.get("_id", "")),
            "name": str(item.get("name", "")),
            "category": str(item.get("category", "")),
            "description": str(item.get("description", "")),
            "location": str(item.get("location", "")),
            "event_date": str(item.get("event_date", "")),
        })

    print(f"[AI SERVICE] Matching query '{user_query}' against {len(items_for_prompt)} items...")

    client = Groq(api_key=resolved_key)

    system_prompt = f"""You are a Lost & Found Matching Engine. OUTPUT ONLY VALID JSON. NO OTHER TEXT ALLOWED.

STUDENT SEARCH QUERY:
\"{user_query}\"

FOUND ITEMS:
{json.dumps(items_for_prompt, indent=2)}

MATCHING ALGORITHM:
1. Extract the CORE NOUN from the query (e.g., \"laptop\", \"keys\", \"bottle\")
2. Check if the item's name, category, or description contains a semantically similar core object
3. If core object DOES NOT MATCH: Score = 0.0-0.15 (flat reject, ignore location/date)
4. If core object MATCHES WELL: Score = 0.85-1.0
5. If core object PARTIALLY MATCHES (e.g., both electronics, but different type): Score = 0.50-0.84
6. Use location and date as SECONDARY validation only if core object already matches

SCORING BUCKETS (STRICT):
- 0.85-1.0: Core object clearly matches (e.g., \"laptop\" finds \"MacBook\")
- 0.50-0.84: Core object somewhat matches (e.g., \"phone\" finds \"smartwatch\")
- 0.15-0.49: Different object but same category (e.g., \"laptop\" finds \"mouse\") 
- 0.0-0.14: Completely different core object (e.g., \"laptop\" finds \"water bottle\") — ALWAYS REJECT

RETURN ONLY THIS JSON ARRAY (nothing else, no comments, no markdown, no explanation):
[
  {{
    \"item_id\": \"id\",
    \"name\": \"item name\",
    \"score\": 0.95,
    \"reason\": \"Core object matches: query seeks X, item is Y.\"
  }}
]

STOP. OUTPUT ONLY JSON. DO NOT ADD ANY OTHER TEXT."""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a JSON-only response bot. Never return anything except valid JSON."},
                {"role": "user", "content": system_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.0,
            max_tokens=1024,
        )

        raw_response = chat_completion.choices[0].message.content.strip()
        print(f"[AI SERVICE] Raw Groq response: {raw_response[:200]}...")

        # Aggressive cleanup: remove markdown code blocks and extract JSON
        # First, try to extract JSON array using regex
        json_match = re.search(r'\[\s*{.*}\s*\]', raw_response, re.DOTALL)
        
        if json_match:
            raw_response = json_match.group(0)
            print(f"[AI SERVICE] Extracted JSON using regex.")
        else:
            # Fallback: remove markdown wrappers manually
            if raw_response.startswith("```"):
                # Remove opening markdown block (```json)
                raw_response = raw_response.split("\n", 1)[1] if "\n" in raw_response else raw_response[3:]
            
            # Remove closing markdown block and anything after it
            if "```" in raw_response:
                raw_response = raw_response.split("```")[0]
            
            raw_response = raw_response.strip()

        results = json.loads(raw_response)

        # Validate structure and apply strict threshold filter
        validated = []
        
        # Safely extract array if the LLM returned a JSON object by mistake
        if isinstance(results, dict):
            results = results.get("matches", results.get("results", []))
            
        if not isinstance(results, list):
            results = []

        for r in results:
            # Safely cast score to float
            try:
                score = float(r.get("score", 0))
            except (ValueError, TypeError):
                score = 0.0

            # ONLY keep items where the score is >= 0.4
            if score >= 0.4:
                validated.append({
                    "item_id": str(r.get("item_id", "")),
                    "name": str(r.get("name", "")),
                    "score": score,
                    "reason": str(r.get("reason", "")),
                })

        # Sort the remaining good matches in descending order
        validated.sort(key=lambda x: x["score"], reverse=True)
        print(f"[AI SERVICE] Returning {len(validated)} matches (score >= 0.4).")
        return validated

    except json.JSONDecodeError:
        print(f"[AI SERVICE] Failed to parse Groq response as JSON:")
        print(f"  Raw response: {raw_response}")
        traceback.print_exc()
        return []
    except Exception as e:
        print(f"[AI SERVICE] Error calling Groq API:")
        traceback.print_exc()
        raise  # Re-raise so main.py can catch it and return a proper error
