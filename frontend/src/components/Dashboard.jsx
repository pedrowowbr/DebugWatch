import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Carregar métricas ao montar o componente
    useEffect(() => {
        loadMetrics();
    }, []);

    // Auto-refresh a cada 10 segundos
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadMetrics();
        }, 10000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const loadMetrics = async () => {
        try {
            console.log('🔄 Carregando métricas...');
            const data = await apiService.getMyMetrics();
            console.log('✅ Métricas recebidas:', data);
            console.log('📊 Total de métricas:', data.length);
            setMetrics(data);
            setError('');
        } catch (error) {
            console.error('❌ Erro ao carregar métricas:', error);
            setError('Erro ao carregar métricas: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    // Converter tempo HH:MM:SS para segundos
    const timeToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    // Converter segundos para formato legível
    const secondsToReadable = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    // Preparar dados para o gráfico de barras (últimas 10 métricas)
    const prepareBarChartData = () => {
        const last10 = metrics.slice(-10);
        const startIndex = Math.max(1, metrics.length - 9);

        return {
            labels: last10.map((m, index) => `${startIndex + index}`),
            datasets: [
                {
                    label: 'Tempo de Execução (segundos)',
                    data: last10.map(m => timeToSeconds(m.tempo_execucao)),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                }
            ]
        };
    };

    // Preparar dados para o gráfico de tempo diário
    const prepareDailyChartData = () => {
        // Agrupar métricas por dia
        const metricsByDay = {};

        metrics.forEach(m => {
            const date = new Date(m.data_criacao);
            const dayKey = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
            });

            if (!metricsByDay[dayKey]) {
                metricsByDay[dayKey] = [];
            }
            metricsByDay[dayKey].push(timeToSeconds(m.tempo_execucao));
        });

        // Calcular média por dia
        const labels = Object.keys(metricsByDay).sort((a, b) => {
            const [diaA, mesA] = a.split('/').map(Number);
            const [diaB, mesB] = b.split('/').map(Number);
            return mesA === mesB ? diaA - diaB : mesA - mesB;
        });

        const averages = labels.map(day => {
            const tempos = metricsByDay[day];
            return tempos.reduce((a, b) => a + b, 0) / tempos.length;
        });

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Tempo Médio por Dia',
                    data: averages,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }
            ]
        };
    };

    // Calcular estatísticas
    const calculateStats = () => {
        if (metrics.length === 0) return null;

        const temposEmSegundos = metrics.map(m => timeToSeconds(m.tempo_execucao));
        const total = temposEmSegundos.reduce((a, b) => a + b, 0);
        const media = total / temposEmSegundos.length;
        const min = Math.min(...temposEmSegundos);
        const max = Math.max(...temposEmSegundos);

        return {
            total: metrics.length,
            media: secondsToReadable(media),
            min: secondsToReadable(min),
            max: secondsToReadable(max),
        };
    };

    const stats = calculateStats();

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const totalSeconds = Math.floor(context.parsed.y);
                        const hours = Math.floor(totalSeconds / 3600);
                        const minutes = Math.floor((totalSeconds % 3600) / 60);
                        const seconds = totalSeconds % 60;
                        return `Tempo: ${hours}h ${minutes}m ${seconds}s`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 3600,
                    callback: (value) => Math.round(value / 3600) + 'h'
                },
                title: {
                    display: true,
                    text: 'Horas'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando métricas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>📊 DebugWatch Dashboard</h1>
                    <div className="user-info">
                        <span>👤 {user?.nome}</span>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={autoRefresh ? "btn-success" : "btn-secondary"}
                            title={autoRefresh ? "Auto-refresh ativado" : "Auto-refresh desativado"}
                        >
                            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
                        </button>
                        <button onClick={logout} className="btn-secondary">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                {error && <div className="error-message">{error}</div>}

                {metrics.length === 0 ? (
                    <div className="no-data">
                        <h2>📭 Nenhuma métrica encontrada</h2>
                        <p>Execute o script de simulação para popular os dados:</p>
                        <code>python backend/quick_seed.py</code>
                    </div>
                ) : (
                    <>
                        {/* Estatísticas */}
                        <section className="stats-section">
                            <h2>📈 Estatísticas</h2>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Total de Métricas</div>
                                    <div className="stat-value">{stats.total}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Tempo Médio</div>
                                    <div className="stat-value">{stats.media}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Tempo Mínimo</div>
                                    <div className="stat-value">{stats.min}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Tempo Máximo</div>
                                    <div className="stat-value">{stats.max}</div>
                                </div>
                            </div>
                        </section>

                        {/* Gráficos */}
                        <div className="charts-container">
                            <section className="chart-section">
                                <h2>📊 Últimas 10 Métricas</h2>
                                <div className="chart-wrapper">
                                    <Bar data={prepareBarChartData()} options={chartOptions} />
                                </div>
                            </section>

                            <section className="chart-section">
                                <h2>📅 Tempo Médio por Dia</h2>
                                <div className="chart-wrapper">
                                    <Line data={prepareDailyChartData()} options={chartOptions} />
                                </div>
                            </section>
                        </div>

                        {/* Tabela de Métricas Recentes */}
                        <section className="metrics-section">
                            <h2>🕐 Métricas Recentes</h2>
                            <div className="metrics-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tempo de Execução</th>
                                            <th>Data/Hora</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.slice(-15).reverse().map((metric, index) => (
                                            <tr key={metric.id}>
                                                <td>{metrics.length - index}</td>
                                                <td className="metric-time">
                                                    {metric.tempo_execucao}
                                                </td>
                                                <td>{formatDate(metric.data_criacao)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;