# DebugWatch

📖 Descrição
Este projeto tem como objetivo monitorar e visualizar o tempo de execução das integrações de cada cliente. Ele extrai dados dos logs armazenados no banco de dados e gera gráficos para ajudar o time de integração a analisar tempos de debug, restauração e backup.

🛠 Tecnologias Utilizadas
📌 Back-end:

Python (FastAPI ou Flask)

SQLAlchemy (para conexão com banco de dados)

Pandas (para manipulação de dados)

Matplotlib/Seaborn (para geração de gráficos)

📌 Front-end:

React

Recharts (para gráficos interativos)

Axios (para consumir a API)

📌 Banco de Dados:

PostgreSQL ou MySQL (dependendo do que já está sendo utilizado)

🚀 Como Rodar o Projeto
1️⃣ Clonar o Repositório
bash
Copiar
Editar
git clone https://github.com/seu-usuario/nome-do-projeto.git
cd nome-do-projeto
2️⃣ Configurar o Back-end (Python)
Criar e ativar um ambiente virtual:

bash
Copiar
Editar
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
Instalar as dependências:

bash
Copiar
Editar
pip install -r requirements.txt
Rodar o servidor:

bash
Copiar
Editar
uvicorn app:main --reload  # Se estiver usando FastAPI
3️⃣ Configurar o Front-end (React)
Instalar as dependências:

bash
Copiar
Editar
cd frontend
npm install
Rodar o projeto React:

bash
Copiar
Editar
npm start
📊 Funcionalidades
✔️ Listagem de clientes e tempos de execução das integrações
✔️ Geração de gráficos sobre tempos de debug e backup
✔️ API para consulta e análise dos logs
✔️ Interface interativa para visualização dos dados

📌 Futuras Melhorias
🔹 Implementação de novos gráficos e métricas
🔹 Melhorias na interface para facilitar a navegação
🔹 Automação de relatórios de desempenho

