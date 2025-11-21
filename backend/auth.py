from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
import hashlib
import secrets
import os
from sqlalchemy.orm import Session
from database import get_db
from models import Cliente

# Configurações do JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY não configurado no .env!")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

security = HTTPBearer()


def verify_password(plain_password, hashed_password):
    """Verifica se a senha fornecida corresponde ao hash armazenado"""
    try:
        # Extrai o salt do hash armazenado
        salt = hashed_password[:32]  # Os primeiros 32 caracteres são o salt
        stored_hash = hashed_password[32:]  # O resto é o hash

        # Gera o hash da senha fornecida com o mesmo salt
        password_hash = hashlib.pbkdf2_hmac(
            'sha256', plain_password.encode('utf-8'), bytes.fromhex(salt), 100000)

        # Compara os hashes
        return password_hash.hex() == stored_hash
    except:
        return False


def get_password_hash(password):
    """Gera um hash seguro da senha usando PBKDF2"""
    # Gera um salt aleatório
    salt = secrets.token_hex(16)  # 32 caracteres hex (16 bytes)

    # Gera o hash da senha
    password_hash = hashlib.pbkdf2_hmac(
        'sha256', password.encode('utf-8'), bytes.fromhex(salt), 100000)

    # Retorna salt + hash
    return salt + password_hash.hex()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        cliente_id: str = payload.get("sub")
        if cliente_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return cliente_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str, db: Session = Depends(get_db)):
    """Obtém o usuário atual baseado no token JWT"""
    try:
        cliente_id = verify_token(token)
        cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
        if cliente is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cliente não encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return cliente
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )


def authenticate_cliente(db: Session, nome_cliente: str, senha: str):
    cliente = db.query(Cliente).filter(Cliente.nome == nome_cliente).first()
    if not cliente:
        return False
    if not verify_password(senha, cliente.senha_hash):
        return False
    return cliente
