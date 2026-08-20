import styles from "../Main.module.css";
import { useEffect, useState } from "react";

export default function CoinListSection() {
  const [coins, setCoins] = useState([]);
  const [usdToKrw, setUsdToKrw] = useState(0);
  const [loading, setLoading] = useState(true);

  const getChangeClass = (value) => {
    const num = Number(value);
    if (num > 0) return "up";
    if (num < 0) return "down";
    return "flat";
  };

  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      setLoading(true);
      try {
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

    fetchData();
    intervalId = setInterval(fetchData, 30_000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <div className={styles.coinSection}>
        <table>
          <thead>
            <tr>
              <th>코인</th>
              <th>현재가(KRW)</th>
              <th>변동률(24h)</th>
            </tr>
          </thead>
          <tbody>
            {coins.length > 0 ? (
              coins.slice(0, 10).map((coin) => {
                const changeClass = styles[getChangeClass(coin.priceChangePercent24h)];
                return (
                  <tr key={coin.id}>
                    <td>
                      {coin.symbol?.toUpperCase()}
                    </td>
                    <td className={changeClass}>
                      {usdToKrw
                        ? Math.round(coin.currentPrice * usdToKrw).toLocaleString()
                        : "-"}{" "}
                      KRW
                    </td>
                    <td className={changeClass}>
                      {Number(coin.priceChangePercent24h)?.toFixed(2) ?? "-"}%
                    </td>
                  </tr>
                );
              })
            ) : (
              /* 💡 수정된 부분: 텍스트를 tr > td 로 감싸서 HTML 규격을 맞춤 */
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                  {loading ? "데이터를 불러오는 중입니다..." : "코인 데이터를 불러올 수 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}