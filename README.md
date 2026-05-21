# 📊 DebugWatch

Sistema de monitoramento e visualização de métricas de tempo de execução para múltiplos clientes com autenticação JWT e dashboard interativo.

## 📐 Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend - React"
        A[Login/Register] --> B[Dashboard]
        A --> C[Admin View]
        B --> D[Chart.js Gráficos]
        C --> D
        B --> E[Auto-refresh 10s]
        C --> E
    end

    subgraph "Backend - FastAPI"
        F[API REST] --> G[Autenticação JWT]
        F --> H[Endpoints /register]
        F --> I[Endpoints /login]
        F --> J[Endpoints /metrics]
        G --> K[Token Validation]
    end

    subgraph "Banco de Dados"
        L[(PostgreSQL)]
        M[Tabela: clientes]
        N[Tabela: metrics]
        L --> M
        L --> N
    end

    B -->|HTTP Requests| F
    C -->|HTTP Requests| F
    F -->|SQLAlchemy ORM| L
    
    style A fill:#667eea
    style B fill:#764ba2
    style C fill:#ff6b6b
    style F fill:#48bb78
    style L fill:#4299e1
```

## 🔄 Fluxo de Dados

```mermaid
sequenceDiagram
    participant U as Usuário
    participant FE as Frontend React
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    
    U->>FE: 1. Acessa sistema
    FE->>API: 2. POST /register ou /login
    API->>DB: 3. Valida/Cria usuário
    DB-->>API: 4. Retorna dados
    API-->>FE: 5. JWT Token
    FE->>FE: 6. Armazena token
    
    loop A cada 10 segundos
        FE->>API: 7. GET /metrics (+ token)
        API->>API: 8. Valida JWT
        API->>DB: 9. Busca métricas
        DB-->>API: 10. Retorna dados
        API-->>FE: 11. JSON com métricas
        FE->>FE: 12. Atualiza gráficos
    end
```

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
> **Nota**: As tabelas `clientes` e `metrics` são criadas automaticamente pelo SQLAlchemy ao iniciar o backend pela primeira vez.

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
