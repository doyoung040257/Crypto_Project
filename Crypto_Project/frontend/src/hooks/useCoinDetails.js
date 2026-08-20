// frontend/src/hooks/useCoinDetails.js

import { useState, useEffect, useCallback } from 'react';
import React from 'react';

const DETAILS_BASE_URL = 'http://localhost:8080/api/coins/details/';

// 💡 통화 포맷 유틸리티 함수
const formatCurrency = (number) => {
    if (number === undefined || number === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(number);
};

export const useCoinDetails = (coinId) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // 💡 1. 디바운스된 coinId 상태 관리 (실제 API 호출에 사용할 ID)
    const [debouncedCoinId, setDebouncedCoinId] = useState(coinId);

    // 💡 2. coinId가 바뀔 때마다 타이머 설정 (500ms 동안 유지될 때만 업데이트)
    useEffect(() => {
        if (!coinId) return;

        const handler = setTimeout(() => {
            setDebouncedCoinId(coinId);
        }, 1800); // 1.8초 대기 시간

        return () => {
            clearTimeout(handler); // 사용자가 0.5초 이내에 다른 코인을 클릭하면 이전 타이머 취소
        };
    }, [coinId]);

    const fetchDetails = useCallback(async (id) => {
        if (!id) return;

        setIsLoading(true);
        setError(null);
        try {
            const url = `${DETAILS_BASE_URL}${id}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`[${id}] 상세 정보 로드 실패: 상태 ${response.status}`);
            }
            
            const data = await response.json();
            
            setDetails({
                name: data.name,
                symbol: data.symbol.toUpperCase(),
                // 💡 이전 에러 해결: .rendered 제거하고 객체 그대로 전달
                description: data.description, 
                homepage: data.links.homepage.find(url => url !== ''),
                image: data.image.small,
                marketCap: formatCurrency(data.market_data.market_cap.usd),
                volume24h: formatCurrency(data.market_data.total_volume.usd),
                priceChange24h: data.market_data.price_change_percentage_24h,
                currentPrice: formatCurrency(data.market_data.current_price.usd),
                circulatingSupply: new Intl.NumberFormat('en-US').format(data.market_data.circulating_supply),
            });
            
        } catch (e) {
            console.error("Coin Details Fetch Error:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 💡 3. 실제 API 호출은 debouncedCoinId가 변할 때만 실행
    useEffect(() => {
        if (debouncedCoinId) {
            fetchDetails(debouncedCoinId);
        }
    }, [debouncedCoinId, fetchDetails]);

    // 퍼센트 포맷 함수 (컴포넌트에서 사용하도록 반환)
    const formatPercentage = (number) => {
        if (number === undefined || number === null) return 'N/A';
        const color = number >= 0 ? 'green' : 'red';
        const sign = number >= 0 ? '+' : '';
        return <span style={{ color: color }}>{sign}{number.toFixed(2)}%</span>;
    };

    return { details, isLoading, error, formatPercentage }; 
};