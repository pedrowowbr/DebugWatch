import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AllMetrics = () => {
    const [allMetrics, setAllMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllMetrics();
    }, []);

    const loadAllMetrics = async () => {
        try {
            const data = await apiService.getAllMetrics();
            setAllMetrics(data);
        } catch (error) {
            console.error('Erro ao carregar todas as métricas:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // Agrupar métricas por cliente
    const groupByClient = () => {
        const grouped = {};

        allMetrics.forEach(metric => {
            const clientId = metric.cliente_id;
            if (!grouped[clientId]) {
                grouped[clientId] = [];
            }
            grouped[clientId].push(metric);
        });

        return grouped;
    };

    // Preparar dados para gráfico de comparação entre clientes
    const prepareClientComparisonData = () => {
        const grouped = groupByClient();
        const clientIds = Object.keys(grouped);

        const avgTimes = clientIds.map(clientId => {
            const metrics = grouped[clientId];
            const times = metrics.map(m => timeToSeconds(m.tempo_execucao));
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            return avg;
        });

        return {
            labels: clientIds.map(id => `Cliente ${id}`),
            datasets: [
                {
                    label: 'Tempo Médio de Execução (segundos)',
                    data: avgTimes,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 2,
                }
            ]
        };
    };

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
                        return `Tempo Médio: ${secondsToReadable(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => secondsToReadable(value)
                }
            }
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    const grouped = groupByClient();
    const clientIds = Object.keys(grouped);

    return (
        <div className="all-metrics-container">
            <h2>📊 Visão Geral - Todos os Clientes</h2>

            {allMetrics.length === 0 ? (
                <p className="no-metrics">Nenhuma métrica encontrada no sistema.</p>
            ) : (
                <>
                    <div className="overview-stats">
                        <div className="stat-card">
                            <div className="stat-label">Total de Clientes</div>
                            <div className="stat-value">{clientIds.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total de Métricas</div>
                            <div className="stat-value">{allMetrics.length}</div>
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Comparação de Performance entre Clientes</h3>
                        <div className="chart-wrapper">
                            <Bar data={prepareClientComparisonData()} options={chartOptions} />
                        </div>
                    </div>

                    <div className="clients-details">
                        {clientIds.map(clientId => {
                            const metrics = grouped[clientId];
                            const times = metrics.map(m => timeToSeconds(m.tempo_execucao));
                            const avg = times.reduce((a, b) => a + b, 0) / times.length;

                            return (
                                <div key={clientId} className="client-detail-card">
                                    <h4>Cliente {clientId}</h4>
                                    <p>Métricas: {metrics.length}</p>
                                    <p>Tempo Médio: {secondsToReadable(avg)}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default AllMetrics;
