from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
import uvicorn
from routes import auth, items, ai


# -----------------------------
# Patching OpenAPI schema
# -----------------------------
def _patch_multipart_file_arrays(openapi_schema: dict) -> None:
    """Swagger UI expects items.format=binary for file pickers; FastAPI may omit it."""
    schemas = openapi_schema.get("components", {}).get("schemas", {})
    for schema in schemas.values():
        for prop in (schema.get("properties") or {}).values():
            branches = prop.get("anyOf") or [prop]
            for branch in branches:
                if branch.get("type") != "array":
                    continue
                items = branch.get("items")
                if not isinstance(items, dict):
                    continue
                if items.get("type") == "string" and "format" not in items:
                    items["format"] = "binary"


def _patch_items_create_swagger_files(openapi_schema: dict) -> None:
    """POST /items/create: Swagger defaults to urlencoded (strings only). Force multipart + files.

    Pure Form() routes emit application/x-www-form-urlencoded first; binary uploads are not
    available there. Flatten multipart schema so Swagger UI renders file inputs (allOf+ref often does not).
    """
    op = openapi_schema.get("paths", {}).get("/items/create", {}).get("post")
    if not op:
        return
    body = op.get("requestBody") or {}
    content = body.get("content") or {}
    if "application/x-www-form-urlencoded" in content:
        del content["application/x-www-form-urlencoded"]

    ref_name = "Body_create_item_items_create_post"
    ref_schema = openapi_schema.get("components", {}).get("schemas", {}).get(ref_name)
    if not ref_schema:
        return

    props = dict(ref_schema.get("properties") or {})
    props["files"] = {
        "type": "array",
        "items": {"type": "string", "format": "binary"},
        "description": "Optional images (add multiple parts named 'files').",
    }
    required = list(ref_schema.get("required") or [])

    content["multipart/form-data"] = {
        "schema": {
            "type": "object",
            "required": required,
            "properties": props,
        }
    }
    body["content"] = content
    op["requestBody"] = body


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
    )
    _patch_multipart_file_arrays(openapi_schema)
    _patch_items_create_swagger_files(openapi_schema)
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI()
app.openapi = custom_openapi

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(ai.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)