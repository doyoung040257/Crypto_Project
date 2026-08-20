// frontend/src/components/Analysis/CoinDetails.jsx (새 파일)
import styles from './CoinDetails.module.css';
import React from 'react';
import { useCoinDetails } from '../../hooks/useCoinDetails'; // 💡 새로 만든 Hook 임포트

function CoinDetails({ coinId }) {
    const { details, isLoading, error } = useCoinDetails(coinId);

    console.log("📍 API 응답 전체:", details);
    console.log("📍 설명 데이터(description):", details?.description);

    if (!coinId) {
        return <div className={styles.section}>분석할 코인을 선택해 주세요.</div>;
    }

    if (isLoading) {
        return <div className={styles.section}>코인 상세 정보를 로드 중입니다...</div>;
    }

    if (error) {
        return <div className={`${styles.section} ${styles.error}`}>오류: {error}</div>;
    }

    if (!details) {
        return <div className={styles.section}>선택된 코인의 정보를 찾을 수 없습니다.</div>;
    }

    // 💡 설명 추출 로직: 한국어 -> 영어 -> 첫 번째 사용 가능한 언어 순서
    const getDescription = () => {
    if (!details || !details.description) return "상세 정보가 존재하지 않습니다.";

    const desc = details.description;

    // 1. 객체인 경우 (언어 우선순위: 한국어 > 영어 > 아무거나)
    if (typeof desc === 'object') {
        const ko = desc.ko?.trim();
        const en = desc.en?.trim();
        
        if (ko) return ko;
        if (en) return en;

        // 다른 언어라도 있으면 가져오기
        const anyLang = Object.values(desc).find(text => text && text.trim().length > 0);
        return anyLang || "등록된 설명 텍스트가 없습니다.";
    }

    // 2. 문자열인 경우
    if (typeof desc === 'string' && desc.trim().length > 0) {
        return desc;
    }

    return "설명을 불러올 수 없습니다.";
};

    const descriptionHtml = getDescription();

    return (
        <div className={styles.section}>
            {/* 코인 이름 및 이미지 (수직 정렬 반영) */}
            <div className={styles.header}>
                <img 
                    src={details.image} 
                    alt={details.name} 
                    className={styles.coinImage} 
                />
                <h3 className={styles.coinName}>
                    {details.name} ({details.symbol?.toUpperCase()})
                </h3>
            </div>

            {/* 홈페이지 링크 */}
            {details.homepage && (
                <div className={styles.infoRow}>
                    <strong>공식 웹사이트:</strong> 
                    <a href={details.homepage} target="_blank" rel="noopener noreferrer">
                        {details.homepage}
                    </a>
                </div>
            )}

            {/* 코인 설명 */}
            <div className={styles.descriptionContainer}>
                <h4>코인 설명</h4>
                <div 
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }} 
                    className={styles.descriptionText}
                />
            </div>
        </div>
    );
}

export default CoinDetails;