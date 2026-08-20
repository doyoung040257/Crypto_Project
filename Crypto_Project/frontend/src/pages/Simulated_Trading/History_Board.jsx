import { useEffect, useState } from "react";
import styles from "./History_Board.module.css";

export default function History_Board({ userId, refresh }) {
    const [trades, setTrades] = useState([]);
    const [filteredTrade, setFilteredTrade] = useState([]);
    const [coinFilter, setCoinFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState("DESC");

    // 🔹 심볼 목록
    const coins = trades.length > 0
    ? Array.from(
        new Map(
            trades.map(t => [
            t.cryptoSymbol,
            { symbol: t.cryptoSymbol, name: t.cryptoName }
            ])
        ).values()
        )
    : [];

    // ===============================
    // 거래 내역 조회 (userId 기준)
    // ===============================
    useEffect(() => {
        if (!userId) {
            console.warn("❗ userId 없음, 거래내역 조회 중단");
            return;
        }

        const fetchTrades = async () => {
            try {
                console.log("📡 거래내역 조회 userId:", userId);

                const response = await fetch(
                    `http://localhost:8080/api/trades/${userId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP 오류: ${response.status}`);
                }

                const data = await response.json();
                console.log("✅ 거래내역 응답:", data);

                setTrades(data);
            } catch (error) {
                console.error("❌ 거래 내역 조회 실패:", error);
                setTrades([]);
            }
        };

        fetchTrades();
    }, [userId, refresh]);

    // ===============================
    // 필터링 + 정렬
    // ===============================
    useEffect(() => {
        let result = [...trades];

        if (coinFilter !== "ALL") {
            result = result.filter(
                t => t.cryptoSymbol === coinFilter
            );
        }

        if (typeFilter !== "ALL") {
            result = result.filter(t => t.orderType === typeFilter);
        }

        result.sort((a, b) =>
            sortOrder === "ASC"
                ? new Date(a.tradeTime) - new Date(b.tradeTime)
                : new Date(b.tradeTime) - new Date(a.tradeTime)
        );

        setFilteredTrade(result);
    }, [trades, coinFilter, typeFilter, sortOrder]);


    return (
        <div className={styles.historyBoard}>
            <h2>거래내역</h2>

            <div className={styles.tableWrap}>
                <table>
                    <thead>
                        <tr>
                            <th>
                                <select
                                    value={coinFilter}
                                    onChange={(e) => setCoinFilter(e.target.value)}
                                    className={styles.thSelect}
                                >
                                    <option value="ALL">종목 ▼</option>
                                    {coins.map(coin => (
                                    <option key={coin.symbol} value={coin.symbol}>
                                        {coin.symbol?.toUpperCase()}
                                    </option>
                                    ))}
                                </select>
                            </th>
                            <th>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className={styles.thSelect}
                                >
                                    <option value="ALL">유형</option>
                                    <option value="매수">매수</option>
                                    <option value="매도">매도</option>
                                </select>
                            </th>
                            <th>가격</th>
                            <th>수량</th>
                            <th>총 가격</th>
                            <th
                                className={styles.sortable}
                                onClick={() =>
                                    setSortOrder(prev =>
                                        prev === "DESC" ? "ASC" : "DESC"
                                    )
                                }
                                style={{cursor: 'pointer'}}
                            >
                                주문날짜
                                {sortOrder === "DESC" ? " ▼" : " ▲"}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrade.length > 0 ? (
                            filteredTrade.map(trade => (
                                <tr key={trade.simulId}>
                                    <td>{trade.cryptoSymbol?.toUpperCase()}({trade.cryptoName})</td>
                                    <td
                                        className={
                                            trade.orderType === "매수"
                                                ? styles.buy
                                                : styles.sell
                                        }
                                    >
                                        {trade.orderType}
                                    </td>
                                    <td>{trade.tradePrice?.toLocaleString()}</td>
                                    <td>{trade.tradeQuantity?.toLocaleString()}</td>
                                    <td>{trade.totalPrice?.toLocaleString()}</td>
                                    <td>
                                        {trade.tradeTime ? (
                                        <>
                                            {new Date(trade.tradeTime).toLocaleDateString("ko-KR")}
                                            <br />
                                            {new Date(trade.tradeTime).toLocaleTimeString("ko-KR")}
                                        </>
                                        ) : "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">거래 내역이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
