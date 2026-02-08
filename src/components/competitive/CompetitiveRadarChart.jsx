import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { RadarChartControls } from './RadarChartControls';
import { ScoreBreakdown } from './ScoreBreakdown';

export function CompetitiveRadarChart({ userProduct, competitor, onDifferentiatorAdd }) {
    const [axes, setAxes] = useState([]);
    const [scores, setScores] = useState({ user: [], competitor: [] });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [error, setError] = useState(null);
    const [differentiators, setDifferentiators] = useState([]);

    // Generate axes on mount or when competitor changes
    useEffect(() => {
        if (competitor?.url || competitor?.name) {
            generateAxes();
        }
    }, [competitor?.url, competitor?.name]);

    const generateAxes = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Generate competitive dimensions
            const axesResult = await base44.functions.invoke('generateCompetitiveAxes', {
                userProduct: {
                    description: userProduct.description,
                    targetPersona: userProduct.targetPersona,
                },
                competitor: {
                    name: competitor.name || competitor.productName,
                    url: competitor.url,
                    content: competitor.scrapedContent || competitor.description,
                }
            });

            if (axesResult.data.error) {
                throw new Error(axesResult.data.message || 'Failed to generate axes');
            }

            setAxes(axesResult.data.axes);

            // Get initial scores
            await scoreProducts(axesResult.data.axes, []);

        } catch (err) {
            console.error('Failed to generate radar chart:', err);
            setError(err.message || 'Failed to analyze competitive positioning');
        } finally {
            setIsGenerating(false);
        }
    };

    const scoreProducts = async (axesToScore, currentDifferentiators) => {
        setIsScoring(true);

        try {
            const scoresResult = await base44.functions.invoke('scoreCompetitivePosition', {
                axes: axesToScore,
                userProduct: {
                    description: userProduct.description,
                    targetPersona: userProduct.targetPersona,
                },
                competitor: {
                    name: competitor.name || competitor.productName,
                    content: competitor.scrapedContent || competitor.description,
                },
                differentiators: currentDifferentiators
            });

            if (scoresResult.data.error) {
                throw new Error(scoresResult.data.message || 'Failed to score products');
            }

            // Map scores to arrays matching axes order
            const axisOrder = axesToScore.map(a => a.id);
            const userScores = [];
            const competitorScores = [];

            axisOrder.forEach(axisId => {
                const scoreData = scoresResult.data.scores.find(s => s.axisId === axisId);
                userScores.push(scoreData?.userScore || 50);
                competitorScores.push(scoreData?.competitorScore || 50);
            });

            setScores({
                user: userScores,
                competitor: competitorScores
            });

        } catch (err) {
            console.error('Failed to score products:', err);
        } finally {
            setIsScoring(false);
        }
    };

    const handleDifferentiatorAdd = async (differentiator) => {
        const newDifferentiators = [...differentiators, differentiator];
        setDifferentiators(newDifferentiators);

        // Re-score with new differentiator
        await scoreProducts(axes, newDifferentiators);

        onDifferentiatorAdd?.(differentiator);
    };

    const handleDifferentiatorRemove = async (index) => {
        const newDifferentiators = differentiators.filter((_, i) => i !== index);
        setDifferentiators(newDifferentiators);

        // Re-score without the removed differentiator
        await scoreProducts(axes, newDifferentiators);
    };

    // Chart configuration
    const chartData = {
        labels: axes.map(axis => axis.name),
        datasets: [
            {
                label: competitor.name || competitor.productName || 'Competitor',
                data: scores.competitor,
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                borderColor: 'rgba(236, 72, 153, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(236, 72, 153, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(236, 72, 153, 1)',
            },
            {
                label: userProduct.name || 'Your Product',
                data: scores.user,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 750,
            easing: 'easeInOutQuart',
        },
        scales: {
            r: {
                min: 0,
                max: 100,
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                    display: false,
                },
                pointLabels: {
                    font: {
                        size: 12,
                        family: 'Poppins, sans-serif',
                    },
                    color: '#a1a1aa',
                },
                grid: {
                    color: 'rgba(161, 161, 170, 0.1)',
                },
                angleLines: {
                    color: 'rgba(161, 161, 170, 0.1)',
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        family: 'Poppins, sans-serif',
                    },
                    color: '#fafafa',
                    padding: 20,
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                titleColor: '#fafafa',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(63, 63, 70, 0.5)',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    title: (context) => {
                        const axisIndex = context[0].dataIndex;
                        return axes[axisIndex]?.name || '';
                    },
                    label: (context) => {
                        const score = context.parsed.r;
                        return `${context.dataset.label}: ${score}/100`;
                    },
                    afterLabel: (context) => {
                        const axisIndex = context.dataIndex;
                        const axis = axes[axisIndex];
                        return axis?.description || '';
                    },
                },
            },
        },
    };

    // Loading state
    if (isGenerating) {
        return (
            <div className="flex items-center justify-center h-96 bg-zinc-950 rounded-lg">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C24516] mx-auto mb-4" />
                    <p className="text-zinc-400">Analyzing competitive positioning...</p>
                    <p className="text-zinc-500 text-sm mt-1">Generating market dimensions</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-zinc-950 border border-red-500/30 rounded-lg p-6 text-center">
                <p className="text-red-400 mb-2">Failed to generate competitive analysis</p>
                <p className="text-zinc-500 text-sm">{error}</p>
                <button
                    onClick={generateAxes}
                    className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // No axes yet
    if (axes.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Radar Chart */}
            <div className="relative h-96 bg-zinc-950 rounded-lg p-6">
                {isScoring && (
                    <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center rounded-lg z-10">
                        <div className="text-center">
                            <Loader2 className="w-6 h-6 animate-spin text-[#C24516] mx-auto mb-2" />
                            <p className="text-zinc-400 text-sm">Updating scores...</p>
                        </div>
                    </div>
                )}
                <Radar data={chartData} options={chartOptions} />
            </div>

            {/* Controls for adding differentiators */}
            <RadarChartControls
                axes={axes}
                differentiators={differentiators}
                isUpdating={isScoring}
                onDifferentiatorAdd={handleDifferentiatorAdd}
                onDifferentiatorRemove={handleDifferentiatorRemove}
            />

            {/* Score breakdown table */}
            <ScoreBreakdown axes={axes} scores={scores} />
        </div>
    );
}

export default CompetitiveRadarChart;
