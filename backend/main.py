from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import models, database

app = FastAPI()

# Cria as tabelas no banco se não existirem
models.Base.metadata.create_all(bind=database.engine)


@app.post("/metrics")
def receive_metrics(data: dict, db: Session = Depends(database.get_db)):
    nova_metric = models.Metric(
        cliente=data["cliente"],
        tempo_execucao=data["tempo_execucao"]
    )
    db.add(nova_metric)
    db.commit()
    db.refresh(nova_metric)
    return {"status": "sucesso", "dados": data}


@app.get("/")
def root():
    return {"message": "API está rodando!"}
