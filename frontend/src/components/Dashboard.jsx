import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [metrics, setMetrics] = useState([]);
    const [newMetric, setNewMetric] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Carregar métricas ao montar o componente
    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            const data = await apiService.getMyMetrics();
            setMetrics(data);
        } catch (error) {
            setError('Erro ao carregar métricas');
        }
    };

    const handleSubmitMetric = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validar formato HH:MM:SS
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
        if (!timeRegex.test(newMetric)) {
            setError('Formato inválido. Use HH:MM:SS (ex: 00:05:30)');
            return;
        }

        setLoading(true);

        try {
            await apiService.sendMetric(newMetric);
            setSuccess('Métrica enviada com sucesso!');
            setNewMetric('');
            await loadMetrics(); // Recarregar métricas
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>DebugWatch Dashboard</h1>
                    <div className="user-info">
                        <span>Olá, {user?.nome}!</span>
                        <button onClick={logout} className="btn-secondary">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <section className="metric-form-section">
                    <h2>Enviar Nova Métrica</h2>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmitMetric} className="metric-form">
                        <div className="form-group">
                            <label htmlFor="tempo">Tempo de Execução (HH:MM:SS):</label>
                            <input
                                type="text"
                                id="tempo"
                                value={newMetric}
                                onChange={(e) => setNewMetric(e.target.value)}
                                placeholder="00:05:30"
                                required
                                disabled={loading}
                            />
                            <small>Exemplo: 00:05:30 (5 minutos e 30 segundos)</small>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Enviando...' : 'Enviar Métrica'}
                        </button>
                    </form>
                </section>

                <section className="metrics-section">
                    <h2>Suas Métricas</h2>

                    {metrics.length === 0 ? (
                        <p className="no-metrics">Nenhuma métrica encontrada.</p>
                    ) : (
                        <div className="metrics-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tempo de Execução</th>
                                        <th>Data/Hora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((metric) => (
                                        <tr key={metric.id}>
                                            <td>{metric.id}</td>
                                            <td className="metric-time">{metric.tempo_execucao}</td>
                                            <td>{formatDate(metric.data_criacao)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;