from sqlalchemy import Column, Integer, String, DateTime, Interval
from datetime import datetime
from backend.database import Base

class Metric(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String)
    tempo_execucao = Column(Interval)
    data_criacao = Column(DateTime, default=datetime.utcnow)
