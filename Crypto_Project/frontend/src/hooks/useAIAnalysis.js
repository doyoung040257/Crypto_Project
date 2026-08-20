// frontend/src/hooks/useAIAnalysis.js

import { useState, useCallback } from 'react';

const BACKEND_API_URL = 'http://localhost:8080/api/analyze-crypto';

export const useAIAnalysis = () => {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);

    // 💡 데이터를 명시적으로 비워주는 함수 추가
    const resetAnalysis = useCallback(() => {
        setAnalysisResult(null);
        setAnalysisError(null);
        setIsAnalyzing(false);
    }, []);

    const fetchAIAnalysis = useCallback(async (coinId, marketData) => {
        if (!coinId || !marketData) {
            setAnalysisError("분석할 코인 ID와 시장 데이터가 필요합니다.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        try {
            const requestBody = {
                coinId: coinId,
                marketData: {
                    marketCap: marketData.marketCap, 
                    volume24h: marketData.volume24h,
                    priceChange24h: marketData.priceChange24h, 
                }
            };
            
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`백엔드 호출 실패! 상태 코드: ${response.status}`);
            }

            const data = await response.json();
            setAnalysisResult(data.analysis); 

        } catch (e) {
            console.error("AI Analysis Fetch Error:", e);
            setAnalysisError(`AI 분석 통신 실패: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    // resetAnalysis를 반환값에 추가
    return { analysisResult, isAnalyzing, analysisError, fetchAIAnalysis, resetAnalysis };
};