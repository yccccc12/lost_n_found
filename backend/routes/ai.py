from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from db.mongodb import items_collection
from services.AI_semantic_search import find_best_matches
from services.AI_lazy_fill import parse_lazy_report_text
from config import settings

router = APIRouter(prefix="/ai", tags=["AI"])

class SearchQuery(BaseModel):
    query: str


class ParseReportBody(BaseModel):
    text: str


@router.post("/parse-report")
def parse_report(body: ParseReportBody):
    """Turn natural language into form fields (Groq). Separate from semantic search."""
    try:
        fields = parse_lazy_report_text(body.text, api_key=settings.GROQ_API_KEY)
        return {"ok": True, "fields": fields}
    except ValueError as e:
        return JSONResponse(status_code=400, content={"ok": False, "error": str(e)})
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"ok": False, "error": str(e)},
        )


@router.post("/search")
def search_items(body: SearchQuery):
    found_items = []
    for item in items_collection.find({"status": "found"}):
        item["_id"] = str(item["_id"])
        found_items.append(item)

    results = find_best_matches(
        body.query,
        found_items,
        api_key=settings.GROQ_API_KEY
    )

    return {
        "query": body.query,
        "total_results": len(results),
        "results": results
    }