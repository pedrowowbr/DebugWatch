from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional


class ClienteCreate(BaseModel):
    nome: str
    senha: str


class ClienteResponse(BaseModel):
    id: int
    nome: str
    data_criacao: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    cliente_id: Optional[str] = None


class MetricCreate(BaseModel):
    tempo_execucao: str  # formato: "HH:MM:SS"


class MetricResponse(BaseModel):
    id: int
    tempo_execucao: str
    data_criacao: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Converte timedelta para string no formato HH:MM:SS
        if hasattr(obj, 'tempo_execucao') and obj.tempo_execucao:
            total_seconds = int(obj.tempo_execucao.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            tempo_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            tempo_str = "00:00:00"

        return cls(
            id=obj.id,
            tempo_execucao=tempo_str,
            data_criacao=obj.data_criacao
        )
