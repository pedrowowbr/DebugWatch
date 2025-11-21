# 📊 DebugWatch

Sistema de monitoramento e visualização de métricas de tempo de execução para múltiplos clientes com autenticação JWT e dashboard interativo.

## 🚀 Tecnologias

### Backend
- **FastAPI** 0.116.0
- **PostgreSQL** (psycopg2-binary 2.9.9)
- **SQLAlchemy** 2.0.23
- **Python-Jose** 3.3.0 (JWT)
- **Python-dotenv** 1.0.0
- **Uvicorn** 0.35.0

### Frontend
- **React** 19.1.0
- **Chart.js** 4.5.1
- **react-chartjs-2** 5.3.1

## ⚙️ Configuração

### 1. Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
# Copiar .env.example para .env e preencher:
# - DATABASE_URL=postgresql://usuario:senha@localhost/monitoramento
# - JWT_SECRET_KEY=sua_chave_secreta_aqui
```

### 2. Banco de Dados PostgreSQL

```sql
CREATE DATABASE monitoramento;
```

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install
```

## ▶️ Executar

### Backend
```bash
cd backend
uvicorn main:app --reload
# API rodando em http://localhost:8000
```

### Frontend
```bash
cd frontend
npm start
# Interface rodando em http://localhost:3000
```

## 📌 Funcionalidades

- ✅ Autenticação JWT com sistema de permissões
- ✅ Dashboard com gráficos interativos (Chart.js)
- ✅ Visão Admin para monitorar todos os clientes
- ✅ Métricas agrupadas por cliente
- ✅ Gráficos de tempo de execução e tendências
- ✅ Auto-refresh a cada 10 segundos
- ✅ Estatísticas em tempo real

## 👤 Usuários

- **Cliente padrão**: Visualiza apenas suas métricas
- **Admin**: Acesso a todas as métricas e comparações entre clientes

## 🔒 Segurança

- Senhas hashadas com PBKDF2-HMAC SHA256
- Tokens JWT com expiração de 30 minutos
- Variáveis de ambiente para dados sensíveis
