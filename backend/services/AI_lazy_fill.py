"""
Extract structured lost/found report fields from free text using Groq.
Separate from AI_semantic_search: different task (form fill vs item matching).
"""
import json
import os
import re
import traceback
from typing import Any

from datetime import datetime, timedelta
from groq import Groq

ALLOWED_CATEGORIES = frozenset(
    {"electronics", "essentials", "books", "clothing", "id", "other"}
)

def get_current_time_in_malaysia() -> str:
    # Malaysia is UTC+8
    now_utc = datetime.utcnow()
    now_malaysia = now_utc + timedelta(hours=8)
    return now_malaysia.strftime("%A, %B %d, %Y %I:%M:%S %p (Malaysia Time)")

def _strip_code_fence(raw: str) -> str:
    s = raw.strip()
    if s.startswith("```"):
        s = s.split("\n", 1)[1]
        s = s.rsplit("```", 1)[0]
    return s.strip()


def _normalize_payload(data: dict[str, Any]) -> dict[str, Any | None]:
    """Ensure keys and category slug are safe for the frontend."""
    cat = data.get("category")
    if isinstance(cat, str):
        cat = cat.strip().lower().replace(" ", "_")
        if cat not in ALLOWED_CATEGORIES:
            cat = "other"
    else:
        cat = None

    rt = data.get("report_type")
    if rt not in ("lost", "found"):
        rt = None

    def s(key: str) -> str | None:
        v = data.get(key)
        if v is None:
            return None
        t = str(v).strip()
        return t if t else None

    # event_date: prefer YYYY-MM-DD if present
    ed = s("event_date")
    if ed and not re.match(r"^\d{4}-\d{2}-\d{2}$", ed):
        ed = None

    return {
        "report_type": rt,
        "category": cat,
        "item_name": s("item_name"),
        "location": s("location"),
        "event_date": ed,
        "details": s("details"),
    }


def parse_lazy_report_text(text: str, api_key: str | None = None) -> dict[str, Any | None]:
    """
    Returns keys: report_type, category, item_name, location, event_date, details.
    Omitted or null fields mean "could not infer".
    """
    text = (text or "").strip()
    if not text:
        return {}

    key = api_key or os.environ.get("GROQ_API_KEY")
    if not key:
        raise ValueError("GROQ_API_KEY is missing.")

    client = Groq(api_key=key)

    current_time_str = get_current_time_in_malaysia()
    
    user_prompt = f"""You help fill a university Lost & Found web form from the user's story.

The current date and time is: {current_time_str}.

USER TEXT:
{text}

Infer these fields. Use null only when there is no reasonable guess.

RULES:
- report_type: "lost" if they misplaced something; "found" if they are reporting something they found.
- category: exactly one of: electronics, essentials, books, clothing, id, other
- item_name: short label for the item (e.g. "black wallet")
- location: building or area (string) (e.g. "Library, 3rd floor", "Student Union", "Main Building")
- event_date: ISO date YYYY-MM-DD if a specific day is implied; otherwise null
- details: a concise paragraph for the form description, anything that helps identify the item

Return ONLY valid JSON (no markdown) with this exact shape:
{{
  "report_type": "lost" | "found" | null,
  "category": "Electronics" | "Essentials & keys" | "Books & supplies" | "Clothing & accessories" | "ID & cards" | "Other" | null,
  "item_name": string | null,
  "location": string | null,
  "event_date": string | null,
  "details": string | null
}}"""

    raw_response = ""
    try:
        chat = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You reply with JSON only. No markdown fences, no commentary.",
                },
                {"role": "user", "content": user_prompt},
            ],
            model="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=1024,
        )
        raw_response = chat.choices[0].message.content.strip()
        raw_response = _strip_code_fence(raw_response)
        data = json.loads(raw_response)
        if not isinstance(data, dict):
            return {}
        return _normalize_payload(data)
    except json.JSONDecodeError:
        print("[AI_LAZY_FILL] JSON parse failed:")
        print(raw_response[:500])
        traceback.print_exc()
        raise ValueError("AI returned invalid JSON. Try again.")
    except Exception:
        traceback.print_exc()
        raise
