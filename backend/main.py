from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
import database
import models
from auth_routes import router as auth_router
from metrics_routes import router as metrics_router


app = FastAPI(title="DebugWatch API",
              description="API para monitoramento de métricas com autenticação JWT")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(metrics_router)


@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=database.engine)
