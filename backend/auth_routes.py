from datetime import timedelta
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import auth
import database
import models
import schemas


router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register", response_model=schemas.ClienteResponse)
def register_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(database.get_db)):
    """Registra um novo cliente"""
    try:
        db_cliente = db.query(models.Cliente).filter(
            models.Cliente.nome == cliente.nome).first()
        if db_cliente:
            raise HTTPException(
                status_code=400,
                detail="Cliente já existe"
            )

        hashed_password = auth.get_password_hash(cliente.senha)

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
        logger.exception("Erro em register_cliente")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.post("/login", response_model=schemas.Token)
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
