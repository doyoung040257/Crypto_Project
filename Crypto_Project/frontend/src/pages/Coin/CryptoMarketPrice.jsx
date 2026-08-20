import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./CryptoMarketPrice.module.css";

function CryptoMarketPrice() {
  const [coins, setCoins] = useState([]);
  const [usdToKrw, setUsdToKrw] = useState(0);
  const [loading, setLoading] = useState(true);

  // 상승 / 하락 class
  const getChangeClass = (value) => {
    const num = Number(value);
    if (num > 0) return "up";
    if (num < 0) return "down";
    return "flat";
  };

  useEffect(() => {
    // 💡 1. 디바운스 타이머 설정 (429 방어막)
    // 페이지 진입 시 즉시 호출하기보다 아주 짧은 간격을 두어 중복 실행을 방지합니다.
    const timer = setTimeout(() => {
      fetchData();
    }, 1500); //1.5초 대기

    const fetchData = async () => {
      setLoading(true);
      try {
        // 💡 2. Promise.all을 사용하여 코인과 환율 데이터를 동시에 안전하게 가져옵니다.
        const [coinRes, exchangeRes] = await Promise.all([
          fetch("http://localhost:8080/api/market/top20"),
          fetch("http://localhost:8080/api/exchange/usd-krw")
        ]);

        if (coinRes.ok) {
          const coinData = await coinRes.json();
          setCoins(Array.isArray(coinData) ? coinData : []);
        }

        if (exchangeRes.ok) {
          const exchangeData = await exchangeRes.json();
          setUsdToKrw(exchangeData.usdToKrw);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };   
  
    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 클리어
  }, []); // ✅ 괄호 짝을 맞추어 문법 에러 해결

  // 로딩 중 표시 (선택 사항)
  if (loading && coins.length === 0) {
    return <div className={styles.loading}>시세 정보를 분석 중입니다...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.cryptoMarket}>
        <h1 className={styles.title}>암호화폐 시세</h1>

        <div className={styles.tableWrapper}>
          <table className={styles.cryptoTable}>
            <thead>
              <tr>
                <th>코인</th>
                <th>현재가(USD)</th>
                <th>현재가(KRW)</th>
                <th>변동률(24h)</th>
                <th>거래량</th>
              </tr>
            </thead>

            <tbody>
              {coins.length > 0 ? (
                coins.map((coin) => {
                  const changeClass =
                    styles[getChangeClass(coin.priceChangePercent24h)];

                  return (
                    <tr key={coin.id}>
                      <td>
                        <Link
                          to={`/coin/${coin.id}`}
                          className={`${styles.coinLink} ${changeClass}`}
                        >
                          {coin.symbol?.toUpperCase()} ({coin.name})
                        </Link>
                      </td>

                      <td>
                        {Number(coin.currentPrice)?.toLocaleString() ?? "-"}
                      </td>

                      <td>
                        {usdToKrw
                          ? Math.round(
                              coin.currentPrice * usdToKrw
                            ).toLocaleString()
                          : "-"}{" "}
                        원
                      </td>

                      <td className={changeClass}>
                        {Number(coin.priceChangePercent24h)?.toFixed(2) ?? "-"}%
                      </td>

                      <td>
                        {Number(coin.totalVolume)?.toLocaleString() ?? "-"} 
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    코인 데이터를 불러올 수 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CryptoMarketPrice;