import os
import json
import traceback
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

    system_prompt = f"""You are an advanced AI Matching Engine for a university Lost and Found system.

A student is searching for their lost item. Your job is to compare their description against the list of found items and return the best matches ranked by similarity.

STUDENT'S SEARCH QUERY:
"{user_query}"

FOUND ITEMS IN DATABASE:
{json.dumps(items_for_prompt, indent=2)}

SCORING INSTRUCTIONS:
1. Core Entity First: Mentally isolate the CORE NOUN the user is looking for (e.g., "earphones", "keys") BEFORE looking at adjectives (e.g., "white", "dark"). If the core entity does not conceptually match the item's `name`, `category`, or `description`, you MUST heavily penalize the score, even if adjectives match perfectly.
2. Contextual Clues: Use `location` and `event_date` as secondary clues. Match meaning and synonyms, not just exact keywords.
3. Strict Scoring Buckets: You MUST score items using this scale:
   - 0.85 to 1.0: Excellent semantic match of the core object.
   - 0.50 to 0.84: Plausible match (e.g., vague query, or correct category but different brand).
   - 0.10 to 0.49: Highly unlikely, but shares a location or minor detail.
   - 0.0 to 0.09: Completely different core object.
4. Reasoning Accuracy: Your `reason` string MUST logically justify the assigned score based on the strict buckets above.
5. Scale: Only return objects in the final JSON if their score is >= 0.4.

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON — no extra text, no markdown, no explanation.
- Return a JSON array of objects, sorted highest to lowest score.
- If no items match, return an empty array: []

REQUIRED JSON FORMAT:
[
  {{
    "item_id": "the item_id string",
    "name": "the item's name",
    "score": 0.95,
    "reason": "Brief explanation justifying the score based on the scoring buckets"
  }}
]"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a JSON-only response bot. Never return anything except valid JSON."},
                {"role": "user", "content": system_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=1024,
        )

        raw_response = chat_completion.choices[0].message.content.strip()
        print(f"[AI SERVICE] Raw Groq response: {raw_response[:200]}...")

        # Clean up response — sometimes LLMs wrap JSON in ```json ... ```
        if raw_response.startswith("```"):
            raw_response = raw_response.split("\n", 1)[1]
            raw_response = raw_response.rsplit("```", 1)[0]
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
