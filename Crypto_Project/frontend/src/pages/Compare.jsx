// frontend/src/pages/Compare.jsx (수정)
import styles from './Compare.module.css'
import React, { useState } from 'react';
import { useCoinData } from '../hooks/useCoinData'; 
import CoinTable from '../components/CoinTable/CoinTable';
import ChartDisplay from '../components/ChartDisplay/ChartDisplay';

function Compare() {
    const { coinData, isLoading, error, fetchCoinData } = useCoinData();
    const [selectedCoinIds, setSelectedCoinIds] = useState(['bitcoin']); 

    const handleCoinSelection = (coinId) => {
        setSelectedCoinIds(prevIds => {
            if (prevIds.includes(coinId)) {
                return prevIds.filter(id => id !== coinId);
            } else {
                if (prevIds.length < 4) {
                    return [...prevIds, coinId];
                }
                alert("최대 4개의 코인까지만 비교 가능합니다.");
                return prevIds; 
            }
        });
    };

    return (
    <main className={styles.main}>
        <div className={styles.pageHeader}>
            <h1 className={styles.title}>암호화폐 비교 센터</h1>
            <button onClick={fetchCoinData} className={styles.refreshButton}>
                데이터 새로고침
            </button>
        </div>

        {/* 가로 배치를 위한 컨테이너 */}
        <div className={styles.contentContainer}>
            
            {/* 왼쪽: 차트 영역 (넓게) */}
            <section className={styles.chartArea}>
                <div className={styles.infoBar}>
                    <strong>선택된 코인:</strong> {selectedCoinIds.join(', ').toUpperCase()}
                </div>
                <div className={styles.chartWrapper}>
                    <ChartDisplay selectedCoinIds={selectedCoinIds} />
                </div>
            </section>

            {/* 오른쪽: 코인 목록 (사이드바 형태) */}
            <section className={styles.listArea}>
                {isLoading && <p>데이터 로딩 중...</p>}
                {error && <p className={styles.errorText}>{error}</p>}
                
                <div className={styles.scrollTable}>
                    {!isLoading && !error && (
                        <CoinTable 
                            coins={coinData} 
                            selectedIds={selectedCoinIds} 
                            onCoinSelect={handleCoinSelection} 
                        />
                    )}
                </div>
            </section>
        </div>
    </main>
);
}

export default Compare;