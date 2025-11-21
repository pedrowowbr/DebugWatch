from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

import models
import database
import auth
import schemas


app = FastAPI(title="DebugWatch API",
              description="API para monitoramento de métricas com autenticação JWT")

# Habilita CORS para permitir chamadas do frontend (desenvolvimento)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração OAuth2 para o Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Cria as tabelas no banco se não existirem
models.Base.metadata.create_all(bind=database.engine)


@app.post("/register", response_model=schemas.ClienteResponse)
def register_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(database.get_db)):
    """Registra um novo cliente"""
    try:
        # Verifica se o cliente já existe
        db_cliente = db.query(models.Cliente).filter(
            models.Cliente.nome == cliente.nome).first()
        if db_cliente:
            raise HTTPException(
                status_code=400,
                detail="Cliente já existe"
            )

        # Cria o hash da senha
        hashed_password = auth.get_password_hash(cliente.senha)

        # Cria o cliente
        db_cliente = models.Cliente(
            nome=cliente.nome,
            senha_hash=hashed_password
        )
        db.add(db_cliente)
        db.commit()
        db.refresh(db_cliente)

        return db_cliente

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """Login para obter token de acesso"""
    cliente = auth.authenticate_cliente(
        db, form_data.username, form_data.password)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(cliente.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/metrics", response_model=schemas.MetricResponse)
def receive_metrics(
    metric_data: schemas.MetricCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    """Recebe métricas do cliente autenticado"""
    try:
        # Obtém o usuário atual
        current_user = auth.get_current_user(token, db)

        # Converte string de tempo para timedelta
        try:
            time_parts = metric_data.tempo_execucao.split(":")
            hours = int(time_parts[0])
            minutes = int(time_parts[1])
            seconds = int(time_parts[2])
            tempo_execucao = timedelta(
                hours=hours, minutes=minutes, seconds=seconds)
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=400,
                detail="Formato de tempo inválido. Use HH:MM:SS"
            )

        nova_metric = models.Metric(
            cliente_id=current_user.id,
            tempo_execucao=tempo_execucao
        )
        db.add(nova_metric)
        db.commit()
        db.refresh(nova_metric)

        # Converte usando o schema personalizado
        return schemas.MetricResponse.from_orm(nova_metric)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/metrics", response_model=list[schemas.MetricResponse])
def list_my_metrics(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    """Lista apenas as métricas do cliente autenticado"""
    try:
        print(f"Token recebido: {token[:20]}...")
        current_user = auth.get_current_user(token, db)
        print(
            f"Usuário autenticado: {current_user.nome} (ID: {current_user.id})")

        metrics = db.query(models.Metric).join(models.Cliente).filter(
            models.Metric.cliente_id == current_user.id).all()
        print(f"Métricas encontradas: {len(metrics)}")

        # Converte usando o schema personalizado
        result = [schemas.MetricResponse.from_orm(
            metric) for metric in metrics]
        return result
    except Exception as e:
        print(f"Erro em list_my_metrics: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/metrics/all", response_model=list[schemas.MetricResponse])
def list_all_metrics(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    """Lista todas as métricas (apenas para admins)"""
    try:
        # Verifica se o usuário é admin
        current_user = auth.get_current_user(token, db)
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Apenas administradores podem visualizar todas as métricas."
            )

        # Faz join com a tabela de clientes para ter o nome
        metrics = db.query(models.Metric).join(models.Cliente).all()
        # Converte usando o schema personalizado
        result = [schemas.MetricResponse.from_orm(
            metric) for metric in metrics]
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/me", response_model=schemas.ClienteResponse)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """Retorna informações do usuário atual"""
    current_user = auth.get_current_user(token, db)
    return current_user
