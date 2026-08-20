import styles from "./Simulated_Trading.module.css";
import useFetch from "../../hooks/useFetch";
import Trade_Board from "./Trade_Board.jsx";
import History_Board from "./History_Board.jsx";
import Rank_Board from "./Rank_Board";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Simulated_Trading() {
  const { isLoggedIn, userId } = useContext(AuthContext);

  const [usdToKrw, setUsdToKrw] = useState(0);
  const [KRW, setKRW] = useState(0);

  // 🟢 코인 목록 1초마다 새로고침을 위한 상태
  const [coinRefreshKey, setCoinRefreshKey] = useState(0);

  // useFetch 의존성 배열에 coinRefreshKey 추가 → 1초마다 갱신
  const coins = useFetch("http://localhost:8080/api/market/top20", [coinRefreshKey]);

  const [rankingCriteria, setRankingCriteria] = useState("asset"); 
  const [countdown, setCountdown] = useState(30); 
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchedRankingsData = useFetch(
    `http://localhost:8080/api/rankings?criteria=${rankingCriteria}`, 
    [rankingCriteria, refreshKey]
  );

  const getChangeClass = (value) => {
    if (value > 0) return styles.up;
    if (value < 0) return styles.down;
    return styles.same;
  };

  // 1초마다 코인 새로고침
  useEffect(() => {
    const coinTimer = setInterval(() => {
      setCoinRefreshKey((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(coinTimer);
  }, []);

  // 30초 카운트다운 + 랭킹 새로고침
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRefreshKey((k) => k + 1); // 랭킹 새로고침
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [rankings, setRankings] = useState([]);

  const handleRadioClick = (coin) => {
    setSelected(coin);
    setKRW(Math.round(coin.currentPrice * usdToKrw));
  };

  useEffect(() => {
    if (fetchedRankingsData && fetchedRankingsData.rankings) {
      const dataToSet = fetchedRankingsData.rankings;
      const finalRankings = dataToSet.map((user, index) => ({
        ...user,
        ranking_position: index + 1
      }));
      setRankings(finalRankings);
    }
  }, [fetchedRankingsData]);

  // 환율 가져오기
  useEffect(() => {
    fetch("http://localhost:8080/api/exchange/usd-krw")
      .then((res) => (res.ok ? res.json() : Promise.reject("Network Error")))
      .then((data) => setUsdToKrw(data.usdToKrw))
      .catch((err) => {
        console.error("환율 가져오기 실패:", err);
        setUsdToKrw(0);
      });
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div className={styles.body}>
      <div className={styles.top}></div>
      <div className={styles.inner}>
        <div className={styles.container}>
          <div className={styles.left}>
            {/* 🟢 코인 목록 (1초마다 새로고침) */}
            <div className={styles.cryptoBox}>
              <table className={styles.cryptoTable}>
                <thead>
                  <tr>
                    <th colSpan={2}>종목</th>
                    <th>현재가격</th>
                    <th>변동률</th>
                    <th>거래량</th>
                  </tr>
                </thead>
                <tbody>
                  {coins && coins.length > 0 ? (
                    coins.map((coin) => (
                      <tr key={coin.id} className={selected?.id === coin.id ? styles.selectedRow : ""}>
                        <td>
                          <input
                            type="radio"
                            name="selectedCrypto"
                            checked={selected?.id === coin.id}
                            onChange={() => handleRadioClick(coin)}
                          />
                        </td>
                        <td>{coin.symbol?.toUpperCase()}<br/>({coin.name})</td>
                        <td className={getChangeClass(coin.priceChangePercent24h)}>
                          {usdToKrw
                            ? Math.round(coin.currentPrice * usdToKrw).toLocaleString()
                            : "-"} 원
                        </td>
                        <td className={getChangeClass(coin.priceChangePercent24h)}>
                          {Number(coin.priceChangePercent24h)?.toFixed(2) ?? "-"}%
                        </td>
                        <td>{Number(coin.totalVolume)?.toLocaleString() ?? "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5">암호화폐 목록을 불러오는 중이거나 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.mid}>
            <div className={styles.trade}>
              <Trade_Board
                userId={userId}
                selectedCrypto={selected}
                setRefresh={setRefresh}
                setSelected={setSelected}
                KRW={KRW}
              />
            </div>
            <div className={styles.history}>
              <History_Board userId={userId} refresh={refresh} />
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.rankboard}>
              <Rank_Board
                rankings={rankings}
                setRankingCriteria={setRankingCriteria}
                currentCriteria={rankingCriteria}
                userId={userId}
                countdown={countdown}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
