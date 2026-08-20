// frontend/src/components/ChartDisplay/ChartDisplay.jsx
import styles from './ChartDisplay.module.css'
import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const COLOR_PALETTE = ['#007bff', '#28a745', '#ffc107', '#dc3545']; 

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '선택된 암호화폐 가격 비교' },
    },
    scales: {
        x: { ticks: { display: true } },
    }
};

function ChartDisplay({ selectedCoinIds }) { 
    const [days, setDays] = useState(7); 
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const availablePeriods = [
        { label: '24H', value: 1 }, 
        { label: '7D', value: 7 }, 
        { label: '30D', value: 30 }, 
        { label: '1Y', value: 365 }
    ];

    const fetchChartData = useCallback(async () => {
        if (!selectedCoinIds || selectedCoinIds.length === 0) {
            setChartData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const fetchPromises = selectedCoinIds.map(id => 
                fetch(`http://localhost:8080/api/coins/chart/${id}?vs_currency=usd&days=${days}`)
            );
            
            const responses = await Promise.all(fetchPromises);
            
            const jsonPromises = responses.map(async (response, index) => {
                const coinId = selectedCoinIds[index];
                if (!response.ok) {
                    throw new Error(`[${coinId.toUpperCase()}] 데이터 로드 실패: 상태 ${response.status}`);
                }
                return await response.json();
            });

            const allData = await Promise.all(jsonPromises);
            
            let labels = [];
            const newDatasets = allData.map((data, index) => {
                const coinId = selectedCoinIds[index];
                const prices = data.prices;
                const priceValues = prices.map(price => price[1]);
                
                if (index === 0) {
                    labels = prices.map(price => new Date(price[0]).toLocaleDateString());
                } 

                return {
                    label: coinId.toUpperCase(),
                    data: priceValues,
                    borderColor: COLOR_PALETTE[index % COLOR_PALETTE.length], 
                    backgroundColor: `${COLOR_PALETTE[index % COLOR_PALETTE.length]}33`,
                    pointRadius: 0,
                    fill: false,
                };
            });
            
            setChartData({ labels, datasets: newDatasets });

        } catch (e) {
            setError(`차트 데이터를 로드하는 데 문제가 발생했습니다: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [selectedCoinIds, days]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchChartData();
        }, 3500); 

        return () => {
            clearTimeout(timer);
        };
    }, [fetchChartData]);

    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>차트 디스플레이</h3> 
            
            {/* 기간 선택 버튼 */}
            <div className={styles.buttonGroup}> 
                {availablePeriods.map(period => (
                    <button
                        key={period.value}
                        onClick={() => setDays(period.value)}
                        className={`${styles.periodButton} ${days === period.value ? styles.activeButton : ''}`}
                    >
                        {period.label}
                    </button>
                ))}
            </div>

            {/* 단일 차트 영역 */}
            <div className={styles.chartWrapper}>
                {loading && <div className={styles.statusMessage}>차트 로드 중...</div>}
                {(!loading && !chartData) && <div className={styles.statusMessage}>비교할 코인을 선택해주세요.</div>}
                {chartData && (
                    <Line data={chartData} options={chartOptions} />
                )}
            </div>
        </div>
    );
}

export default ChartDisplay;