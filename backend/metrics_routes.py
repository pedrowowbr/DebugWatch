from datetime import timedelta
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import auth
import database
import models
import schemas


router = APIRouter()
logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.post("/metrics", response_model=schemas.MetricResponse)
def receive_metrics(
    metric_data: schemas.MetricCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    """Recebe métricas do cliente autenticado"""
    try:
        current_user = auth.get_current_user(token, db)

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

        return schemas.MetricResponse.from_orm(nova_metric)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Erro em receive_metrics")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/metrics", response_model=list[schemas.MetricResponse])
def list_my_metrics(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    """Lista apenas as métricas do cliente autenticado"""
    try:
        current_user = auth.get_current_user(token, db)

        metrics = db.query(models.Metric).join(models.Cliente).filter(
            models.Metric.cliente_id == current_user.id).all()

        return [schemas.MetricResponse.from_orm(metric) for metric in metrics]
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Erro em list_my_metrics")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/metrics/all", response_model=list[schemas.MetricResponse])
def list_all_metrics(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    """Lista todas as métricas (apenas para admins)"""
    try:
        current_user = auth.get_current_user(token, db)
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Apenas administradores podem visualizar todas as métricas."
            )

        metrics = db.query(models.Metric).join(models.Cliente).all()
        result = [schemas.MetricResponse.from_orm(
            metric) for metric in metrics]
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Erro em list_all_metrics")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/me", response_model=schemas.ClienteResponse)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """Retorna informações do usuário atual"""
    current_user = auth.get_current_user(token, db)
    return current_user