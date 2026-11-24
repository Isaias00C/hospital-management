import logging
from contextlib import asynccontextmanager

import sklearn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

from app import ml
from app.config import settings
from app.schemas import HealthResponse, ReadmissionRequest, ReadmissionResponse

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Carrega o modelo uma única vez, na inicialização."""
    try:
        app.state.model = ml.load_model(settings.model_path)
        logger.info("Modelo carregado de %s", settings.model_path)
    except Exception:
        # A API sobe mesmo sem modelo: /health reporta "degraded" e o endpoint
        # de predição responde 503, em vez de derrubar o processo.
        app.state.model = None
        logger.exception("Falha ao carregar o modelo de %s", settings.model_path)
    yield


app = FastAPI(title="Hospital Management API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health(request: Request):
    loaded = request.app.state.model is not None
    return HealthResponse(
        status="ok" if loaded else "degraded",
        model_loaded=loaded,
        model_version=settings.model_version,
        sklearn_version=sklearn.__version__,
    )


@app.post("/api/v1/predict/readmission-30d", response_model=ReadmissionResponse)
def predict_readmission(payload: ReadmissionRequest, request: Request):
    model = request.app.state.model
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Modelo indisponível.",
        )
    return ml.predict(model, payload, settings.model_version)
