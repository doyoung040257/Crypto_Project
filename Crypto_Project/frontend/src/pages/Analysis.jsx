// frontend/src/pages/Analysis.jsx (수정)
import styles from './Analysis.module.css';
import React, { useState } from 'react';
import CoinDetails from '../components/Analysis/CoinDetails'; 
import { useCoinSearch } from '../hooks/useCoinSearch'; 
// 💡 새로운 컴포넌트 임포트
import MarketMetrics from '../components/Analysis/MarketMetrics'; 

export default function Analysis() {
    const [analyzingCoinId, setAnalyzingCoinId] = useState('bitcoin'); 
    const [searchTerm, setSearchTerm] = useState('');
    
    const { isLoadingList, errorList, findCoinId } = useCoinSearch();

    const handleSearch = () => {
        if (!searchTerm) return;
        const foundId = findCoinId(searchTerm);
        if (foundId) {
            setAnalyzingCoinId(foundId);
        } else {
            alert(`"${searchTerm}"과 일치하는 코인을 찾을 수 없습니다.`);
            setAnalyzingCoinId(null); 
        }
        setSearchTerm('');
    };

    const popularCoins = [
        { id: 'bitcoin', label: 'BTC' },
        { id: 'ethereum', label: 'ETH' },
        { id: 'tether', label: 'USDT' },
        { id: 'binancecoin', label: 'BNB' },
        { id: 'solana', label: 'SOL' },
    ];

    return (
        <main className={styles.main}>
            <h1>암호화폐 심층 분석 센터</h1>
            
            {/* 1. 코인 검색 및 선택 섹션 */}
            <section className={styles.section}>
                <h2>코인 검색 및 선택</h2>

                {isLoadingList && <p>코인 목록 로드 중입니다...</p>}
                {errorList && <p className={styles.errorText}>오류: {errorList}</p>}

                {!isLoadingList && !errorList && (
                    <div className={styles.popularGroup}>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                className={styles.searchInput}
                                placeholder="코인 이름, 심볼 또는 ID 입력 EX : Bitcoin"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch();
                                }}
                            />
                            <button onClick={handleSearch} className={styles.searchButton}>
                                검색
                            </button>
                        </div>
                        
                        <div>
                            <strong>대표 코인 바로가기: </strong>
                            {popularCoins.map(coin => (
                                <button 
                                    key={coin.id} 
                                    onClick={() => setAnalyzingCoinId(coin.id)}
                                    className={`${styles.coinButton} ${analyzingCoinId === coin.id ? styles.activeCoin : ''}`}
                                >
                                    {coin.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <p className={styles.statusText}>
                    현재 분석 코인: <strong>{analyzingCoinId ? analyzingCoinId.toUpperCase() : '선택되지 않음'}</strong>
                </p>
            </section>
            
            {/* 2. 주요 시장 지표 섹션 */}
            <section className={styles.section}>
                <h2>주요 시장 지표</h2>
                <MarketMetrics coinId={analyzingCoinId} />
            </section>

            {/* 3. 코인 상세 정보 섹션 */}
            <section className={styles.section}>
                <h2>코인 상세 정보</h2>
                <CoinDetails coinId={analyzingCoinId} />
            </section>
            
        </main>
    );
}