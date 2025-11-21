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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const AdminView = () => {
    const { logout } = useAuth();
    const [allMetrics, setAllMetrics] = useState([]);
    const [selectedClienteId, setSelectedClienteId] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllMetrics();
        const interval = setInterval(loadAllMetrics, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadAllMetrics = async () => {
        try {
            const data = await apiService.getAllMetrics();
            setAllMetrics(data);
        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Agrupar métricas por nome do cliente
    const groupedByClient = allMetrics.reduce((acc, metric) => {
        const clientName = metric.cliente_nome;
        if (!acc[clientName]) {
            acc[clientName] = {
                nome: clientName,
                id: metric.cliente_id,
                metrics: []
            };
        }
        acc[clientName].metrics.push(metric);
        return acc;
    }, {});

    const clientNames = Object.keys(groupedByClient);
    const filteredMetrics = selectedClienteId === 'all'
        ? allMetrics
        : groupedByClient[selectedClienteId]?.metrics || [];

    const timeToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const secondsToReadable = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const calculateStats = () => {
        if (filteredMetrics.length === 0) return null;

        const temposEmSegundos = filteredMetrics.map(m => timeToSeconds(m.tempo_execucao));
        const total = temposEmSegundos.reduce((a, b) => a + b, 0);
        const media = total / temposEmSegundos.length;
        const min = Math.min(...temposEmSegundos);
        const max = Math.max(...temposEmSegundos);

        return {
            total: filteredMetrics.length,
            media: secondsToReadable(media),
            min: secondsToReadable(min),
            max: secondsToReadable(max),
        };
    };

    const prepareBarChartData = () => {
        const last10 = filteredMetrics.slice(-10);
        const startIndex = Math.max(1, filteredMetrics.length - 9);

        return {
            labels: last10.map((m, index) => `${startIndex + index}`),
            datasets: [
                {
                    label: 'Tempo de Execução (segundos)',
                    data: last10.map(m => timeToSeconds(m.tempo_execucao)),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                }
            ]
        };
    };

    const prepareDailyChartData = () => {
        // Agrupar métricas por dia
        const metricsByDay = {};

        filteredMetrics.forEach(m => {
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
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }
            ]
        };
    };

    // Gráfico de comparação entre clientes
    const prepareClientComparisonData = () => {
        const clientData = clientNames.map(clientName => {
            const clientInfo = groupedByClient[clientName];
            const metrics = clientInfo.metrics;
            const times = metrics.map(m => timeToSeconds(m.tempo_execucao));
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            return { clientName, avg, count: metrics.length };
        });

        return {
            labels: clientData.map(d => d.clientName),
            datasets: [
                {
                    label: 'Tempo Médio (segundos)',
                    data: clientData.map(d => d.avg),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                    ],
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard admin-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>👑 Visão Admin - Todos os Clientes</h1>
                    <div className="user-info">
                        <button onClick={logout} className="btn-secondary">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Visão Geral */}
                <section className="stats-section">
                    <h2>📊 Visão Geral do Sistema</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total de Clientes</div>
                            <div className="stat-value">{clientNames.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total de Métricas</div>
                            <div className="stat-value">{allMetrics.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Cliente Selecionado</div>
                            <div className="stat-value">
                                {selectedClienteId === 'all' ? 'Todos' : selectedClienteId}
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Métricas Filtradas</div>
                            <div className="stat-value">{filteredMetrics.length}</div>
                        </div>
                    </div>
                </section>

                {/* Seletor de Cliente */}
                <section className="client-selector-section">
                    <h2>🔍 Filtrar por Cliente</h2>
                    <div className="clients-grid">
                        <div
                            className={`client-card ${selectedClienteId === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedClienteId('all')}
                        >
                            <div className="client-name">📊 Todos os Clientes</div>
                            <div className="client-metrics-count">{allMetrics.length} métricas</div>
                        </div>
                        {clientNames.map(clientName => {
                            const clientInfo = groupedByClient[clientName];
                            return (
                                <div
                                    key={clientName}
                                    className={`client-card ${selectedClienteId === clientName ? 'active' : ''}`}
                                    onClick={() => setSelectedClienteId(clientName)}
                                >
                                    <div className="client-name">{clientName}</div>
                                    <div className="client-metrics-count">
                                        {clientInfo.metrics.length} métricas
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Comparação entre Clientes */}
                {selectedClienteId === 'all' && (
                    <section className="chart-section">
                        <h2>📊 Comparação de Performance entre Clientes</h2>
                        <div className="chart-wrapper">
                            <Bar data={prepareClientComparisonData()} options={chartOptions} />
                        </div>
                    </section>
                )}

                {/* Estatísticas do Filtro */}
                {stats && (
                    <section className="stats-section">
                        <h2>📈 Estatísticas {selectedClienteId === 'all' ? 'Gerais' : `de ${selectedClienteId}`}</h2>
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
                )}

                {/* Gráficos */}
                {filteredMetrics.length > 0 && (
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
                )}

                {/* Tabela de Métricas */}
                {filteredMetrics.length > 0 && (
                    <section className="metrics-section">
                        <h2>🕐 Métricas Recentes</h2>
                        <div className="metrics-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Cliente</th>
                                        <th>Tempo de Execução</th>
                                        <th>Data/Hora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMetrics.slice(-20).reverse().map((metric, index) => (
                                        <tr key={metric.id}>
                                            <td>{filteredMetrics.length - index}</td>
                                            <td>
                                                <span className="client-badge">
                                                    {metric.cliente_nome}
                                                </span>
                                            </td>
                                            <td className="metric-time">{metric.tempo_execucao}</td>
                                            <td>{formatDate(metric.data_criacao)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminView;
