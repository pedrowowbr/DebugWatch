// Configuração da API
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Headers com autenticação
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Salvar token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Remover token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Registrar novo cliente
    async register(nome, senha) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ nome, senha }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro no registro');
        }

        return response.json();
    }

    // Login
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro no login');
        }

        const data = await response.json();
        this.setToken(data.access_token);
        return data;
    }

    // Obter informações do usuário atual
    async getMe() {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erro ao obter informações do usuário');
        }

        return response.json();
    }

    // Enviar métrica
    async sendMetric(tempo_execucao) {
        const response = await fetch(`${API_BASE_URL}/metrics`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ tempo_execucao }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao enviar métrica');
        }

        return response.json();
    }

    // Obter métricas do usuário
    async getMyMetrics() {
        console.log('📡 Requisitando métricas...');
        console.log('🔑 Token:', this.token ? 'Presente' : 'Ausente');
        console.log('📝 Headers:', this.getHeaders());

        const response = await fetch(`${API_BASE_URL}/metrics`, {
            headers: this.getHeaders(),
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta:', errorText);
            throw new Error('Erro ao obter métricas');
        }

        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        return data;
    }

    // Obter todas as métricas (apenas para admins)
    async getAllMetrics() {
        const response = await fetch(`${API_BASE_URL}/metrics/all`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erro ao obter todas as métricas');
        }

        return response.json();
    }
}

export default new ApiService();