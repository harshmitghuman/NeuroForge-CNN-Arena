from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Python Microservice",
        version="1.0.0",
    )

    # ✅ CORS setup
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,       # or ["*"] for full access
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ✅ Health check route
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    # ✅ Include your API router
    app.include_router(router)

    return app


# ✅ Create app instance for uvicorn
app = create_app()
