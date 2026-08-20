// frontend/src/hooks/useCoinSearch.js

import { useState, useEffect, useCallback } from 'react';

// ❌ 잘못된 예: '/api/v3/coins/list'
// ✅ 올바른 수정:
const COIN_LIST_API = 'http://localhost:8080/api/coins/list';

export const useCoinSearch = () => {
    const [coinList, setCoinList] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [errorList, setErrorList] = useState(null);

    const fetchCoinList = useCallback(async () => {
        setIsLoadingList(true);
        setErrorList(null);
        try {
            const response = await fetch(COIN_LIST_API); 
            
            if (!response.ok) {
                throw new Error(`코인 목록 로드 실패: 상태 ${response.status}`);
            }
            
            const data = await response.json();
            setCoinList(data);
        } catch (e) {
            console.error("Coin List Fetch Error:", e);
            setErrorList(`코인 목록을 로드할 수 없습니다: ${e.message}`);
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchCoinList();
    }, [fetchCoinList]);

    /**
     * 검색어를 받아 일치하는 코인 ID를 반환합니다.
     * @param {string} searchTerm - 사용자 입력 검색어
     * @returns {string | null} 찾은 코인의 ID 또는 null
     */
    const findCoinId = (searchTerm) => {
        if (!searchTerm) return null;
        const normalizedSearch = searchTerm.toLowerCase().trim();

        // 1. ID로 정확히 일치하는지 검색
        const foundById = coinList.find(coin => coin.id.toLowerCase() === normalizedSearch);
        if (foundById) return foundById.id;
        
        // 2. 심볼(Symbol)로 정확히 일치하는지 검색
        const foundBySymbol = coinList.find(coin => coin.symbol.toLowerCase() === normalizedSearch);
        if (foundBySymbol) return foundBySymbol.id;

        // 3. 이름(Name)에 검색어가 포함되는지 검색 (영어 이름만 지원)
        const foundByName = coinList.find(coin => coin.name.toLowerCase().includes(normalizedSearch));
        if (foundByName) return foundByName.id;
        
        return null;
    };

    return { coinList, isLoadingList, errorList, findCoinId };
};