from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
import uvicorn
from routes import auth, items, ai


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
    app.openapi_schema = openapi_schema
    return app.openapi_schema


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