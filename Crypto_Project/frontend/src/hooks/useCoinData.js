// frontend/src/hooks/useCoinData.js

import { useState, useEffect, useCallback } from 'react';

// ❌ 잘못된 예: '/api/v3/coins/markets'
// ✅ 올바른 수정:
const MARKETS_API = 'http://localhost:8080/api/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h'; 
// (쿼리 파라미터는 백엔드에서 처리하므로 여기서는 기본 경로만 있으면 됩니다. 
//  단, 백엔드 로직에 따라 파라미터가 필요하다면 '?' 뒤에 붙이되 경로는 반드시 /api/coins/markets 여야 합니다.)

export const useCoinData = () => {
    const [coinData, setCoinData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCoinData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(MARKETS_API);
            // 💡 수정된 부분: 응답 상태 코드를 확인하여 오류 메시지에 포함
            if (!response.ok) {
                // 403 (금지됨) 또는 429 (요청 너무 많음) 등이 발생했을 가능성 높음
                throw new Error(`API 호출 실패! 상태 코드: ${response.status}. Rate Limit 확인 필요.`);
            }
            const data = await response.json();
            setCoinData(data);
        } catch (e) {
            console.error("API Fetch Error:", e);
            // 💡 오류를 정확하게 출력
            setError(`데이터를 불러오는 데 실패했습니다: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoinData();
    }, [fetchCoinData]);

    return { coinData, isLoading, error, fetchCoinData };
};