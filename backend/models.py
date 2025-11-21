from sqlalchemy import Column, Integer, String, DateTime, Interval, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    senha_hash = Column(String)
    is_admin = Column(Boolean, default=False)
    data_criacao = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamento com métricas
    metrics = relationship("Metric", back_populates="cliente")


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    tempo_execucao = Column(Interval)
    data_criacao = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamento com cliente
    cliente = relationship("Cliente", back_populates="metrics")
