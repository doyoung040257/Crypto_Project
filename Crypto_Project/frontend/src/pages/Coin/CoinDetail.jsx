import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TradingViewChart from "../../components/TradingView/TradingViewChart";
import styles from "./CoinDetail.module.css";
// import CoinDetails from "../../components/Analysis/CoinDetails";

function CoinDetail() {
  const { id: symbol } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 💡 1. 디바운스된 symbol 상태 추가
  const [debouncedSymbol, setDebouncedSymbol] = useState(symbol);

  // 💡 2. URL의 symbol이 바뀔 때 타이머 설정 (429 방어막)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSymbol(symbol);
    }, 1500); // 1.5초 대기

    return () => {
      clearTimeout(handler); // 0.5초 이내에 다른 코인으로 이동하면 이전 요청 취소
    };
  }, [symbol]);

  const convertSymbol = (symbol) => `BINANCE:${symbol.toUpperCase()}USDT`;

  const getChangeClass = (value) => {
    const num = Number(value);
    if (num > 0) return styles.up;
    if (num < 0) return styles.down;
    return "";
  };

  // 💡 3. 실제 데이터 호출은 debouncedSymbol이 확정되었을 때만 수행
  useEffect(() => {
    if (!debouncedSymbol) return;

    setLoading(true);
    fetch("http://localhost:8080/api/market/top20")
      .then((res) => res.json())
      .then((data) => {
        // top20 배열에서 해당 코인 찾기
        const found = data.find((c) => c.id === debouncedSymbol);
        if (!found) throw new Error("코인 데이터 없음");
        setCoin(found);
      })
      .catch((err) => {
        console.error("Error fetching coin detail:", err);
        setCoin(null);
      })
      .finally(() => setLoading(false));
  }, [debouncedSymbol]); // symbol 대신 debouncedSymbol을 감시

  if (loading) return <div className={styles.loading}>데이터 분석 중...</div>;
  if (!coin) return <div className={styles.error}>코인 데이터를 불러올 수 없습니다.</div>;

  return (
    <div className={styles.pageWrapper}>
       <div className={styles.chartInner}>
        {/* 차트는 즉시 로드하거나 symbol을 사용해도 무방합니다 (트레이딩뷰 위젯 자체 로직 때문) */}
        <TradingViewChart symbol={convertSymbol(coin.symbol)} />

        <h1 className={styles.title}>
          {coin.name} ({coin.symbol?.toUpperCase()})
        </h1>

        <div className={styles.infoBox}>
          <div className={styles.infoItem}>
            현재가: ${coin.currentPrice?.toLocaleString() ?? "-"}
          </div>

          <div
            className={`${styles.infoItem} ${getChangeClass(
              coin.priceChangePercent24h
            )}`}
          >
            24h 변동률: {coin.priceChangePercent24h?.toFixed(2) ?? "-"}%
          </div>

          <div className={styles.infoItem}>
            24h 거래량: {coin.totalVolume?.toLocaleString() ?? "-"}
          </div>
        </div>


        {/* 코인 설명 섹션 
        <div className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>프로젝트 상세 설명</h2>
          <div className={styles.descriptionContent}>
            <CoinDetails key={coin.id} coinId={coin.id} />
          </div>
        </div>*/}
      </div>
    </div>
  );
}

export default CoinDetail;