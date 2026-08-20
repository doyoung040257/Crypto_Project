// frontend/src/components/Analysis/MarketMetrics.jsx (최종 수정: 강력한 문자열 정제)
import styles from './MarketMetrics.module.css'
import React, { useEffect } from 'react'; // useEffect 추가
import { useCoinDetails } from '../../hooks/useCoinDetails'; 
import { useAIAnalysis } from '../../hooks/useAIAnalysis'; 
import ReactMarkdown from 'react-markdown';

function MarketMetrics({ coinId }) {
    const { details, isLoading, error, formatPercentage } = useCoinDetails(coinId);
    
    // 💡 resetAnalysis 가져오기
    const { analysisResult, isAnalyzing, analysisError, fetchAIAnalysis, resetAnalysis } = useAIAnalysis();

    // [방법 2 핵심] 코인 ID가 변경되면 즉시 이전 분석 결과를 지움
    useEffect(() => {
        resetAnalysis();
    }, [coinId, resetAnalysis]);

    const handleAnalyze = () => {
        if (!details) {
            alert("시장 지표를 먼저 로드해야 AI 분석을 시작할 수 있습니다.");
            return;
        }

        const marketData = {
            marketCap: details.marketCap, 
            volume24h: details.volume24h, 
            priceChange24h: details.priceChange24h, 
        };
        
        fetchAIAnalysis(coinId, marketData);
    };

    if (!coinId) return <div className={styles.message}>분석할 코인을 선택해 주세요.</div>;
    
    if (error) { 
        return <div className={`${styles.message} ${styles.error}`}>오류: {error}</div>;
    }

    if (isLoading) {
        return <div className={styles.message}>주요 시장 지표 로드 중...</div>;
    }

    if (!details || !details.marketCap) {
        return <div className={styles.message}>지표 정보를 찾을 수 없습니다.</div>;
    }
    
    const metrics = [
        { label: '현재 가격 (USD)', value: details.currentPrice },
        { label: '시가총액 (USD)', value: details.marketCap },
        { label: '24H 거래량 (USD)', value: details.volume24h },
        { label: '24H 가격 변동률', value: formatPercentage(details.priceChange24h), isHtml: true },
        { label: '유통량', value: details.circulatingSupply },
    ];
    
    // 💡 MetricBox를 컴포넌트 내부에서 사용할 때 styles 적용
    const MetricBox = ({ label, value, isHtml }) => (
        <div className={styles.metricItem}>
            <div className={styles.label}>{label}</div>
            <div className={styles.value}>
                {isHtml ? value : String(value)}
            </div>
        </div>
    );
    
    const cleanAnalysisResult = (result) => {
        if (!result) return '';
        let cleaned = result.replace(/["']\s*(\]|,)\s*(\}|\s*,\s*"role":\s*"model".*)/gs, '');
        cleaned = cleaned.trim();
        while (cleaned.endsWith(',') || cleaned.endsWith('"') || cleaned.endsWith('}') || cleaned.endsWith(']')) {
            cleaned = cleaned.substring(0, cleaned.length - 1).trim();
        }
        return cleaned;
    };

    const finalAnalysisText = cleanAnalysisResult(analysisResult);

    return (
        <div>
            {/* 1. 시장 지표 표시 */}
            <div className={styles.metricsGrid}>
                {metrics.map((metric, index) => (
                    <MetricBox key={index} label={metric.label} value={metric.value} isHtml={metric.isHtml} />
                ))}
            </div>
            
            {/* 2. AI 분석 섹션 */}
            <div className={styles.aiSection}>
                <h3>AI 기반 분석 및 평가</h3>
                <button onClick={handleAnalyze} disabled={isAnalyzing} className={styles.analyzeButton}>
                    {isAnalyzing ? '분석 중...' : ' Gemini AI 분석'}
                </button>

                {analysisError && <p className={styles.error}>{analysisError}</p>}

                {/* 분석 중이 아니고 결과가 있을 때만 출력 */}
                {!isAnalyzing && finalAnalysisText && (
                    <div className={styles.resultContainer}>
                        <p className={styles.resultTitle}>AI 분석 결과입니다.</p>
                        <ReactMarkdown>{finalAnalysisText}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MarketMetrics;