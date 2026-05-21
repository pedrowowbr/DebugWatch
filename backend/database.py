from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import config


# Cria a engine (conexão com banco)
engine = create_engine(config.DATABASE_URL)

# Cria a sessão (cada request abre uma sessão com o banco)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# Dependência para obter a sessão no FastAPI


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
