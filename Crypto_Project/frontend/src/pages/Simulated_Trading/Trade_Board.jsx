import { useState, useEffect } from "react";
import { format } from "date-fns";
import styles from "./Trade_Board.module.css";

export default function Trade_Board({ userId, selectedCrypto, setRefresh, setSelected, KRW }) {
  const [tradeType, setTradeType] = useState("매수");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [binances, setBinances] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [totalPortfolio, setTotalPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ownedQuantity, setOwnedQuantity] = useState(0);
  const [availableAmount, setAvailableAmount] = useState(0);

  // -------------------- 공통 fetch 함수 --------------------
  const fetchPortfolioAndBalance = async () => {
    try {
      const [balanceRes, portfolioRes, totalPortfolioRes] = await Promise.all([
        fetch(`http://localhost:8080/api/trades/users/${userId}`),
        fetch(`http://localhost:8080/api/portfolio/${userId}`),
        fetch(`http://localhost:8080/api/totalportfolio/${userId}`)
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBinances(balanceData.balance || 0);
      }

      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setPortfolio(Array.isArray(data) ? data : []);
      }

      if (totalPortfolioRes.ok) {
        const data = await totalPortfolioRes.json();
        setTotalPortfolio(data);
      }
    } catch (error) {
      console.error("Portfolio & balance fetch 실패:", error);
    }
  };

  // -------------------- 초기 데이터 --------------------
  useEffect(() => {
    if (!userId) return;
    fetchPortfolioAndBalance().finally(() => setLoading(false));
  }, [userId]);

  // -------------------- 선택 코인 가격 업데이트 --------------------
  useEffect(() => {
    setPrice(selectedCrypto && KRW ? KRW : 0);
  }, [selectedCrypto, KRW]);

  // -------------------- 선택 코인 포트폴리오 상태 --------------------
  useEffect(() => {
    if (!selectedCrypto || !portfolio) {
      // 코인이 선택되지 않았으면 초기화
      setOwnedQuantity(0);
      setAvailableAmount(0);
      return;
    }
    
    const selected = portfolio.find(p => p.cryptoSymbol === selectedCrypto.symbol);
    setOwnedQuantity(selected ? selected.quantity : 0);
    setAvailableAmount(selected ? selected.evaluationPrice : 0);
  }, [selectedCrypto, portfolio]);

  const resetForm = () => {
    setPrice(0);
    setQuantity(0);
    setSelected(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCrypto) return alert("암호화폐를 선택해주세요.");
    if (!tradeType) return alert("매수/매도를 선택하세요.");
    if (quantity <= 0) return alert("주문 수량은 0보다 커야 합니다.");
    if (price <= 0) return alert("가격은 0보다 커야 합니다.");

    const currentTotal = quantity * price;

    if (tradeType === "매수" && binances < currentTotal) return alert("주문 가능 금액이 부족합니다.");
    if (tradeType === "매도" && quantity > ownedQuantity) return alert("보유 수량보다 많은 매도는 불가능합니다.");
    if (tradeType === "매도" && availableAmount < price) return alert("판매가능액수가 부족합니다.");

    const tradeData = {
      userId,
      cryptoName: selectedCrypto.name,
      cryptoSymbol: selectedCrypto.symbol,
      orderType: tradeType,
      tradePrice: price,
      tradeQuantity: quantity,
      totalPrice: currentTotal,
      tradeTime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    };

    try {
      const res = await fetch('http://localhost:8080/api/trades', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData)
      });

      if (res.ok) {
        alert("주문내역이 저장되었습니다.");

        // 💡 거래 후 상태 최신화
        await fetchPortfolioAndBalance();

        // 폼 초기화
        resetForm();
        setRefresh(prev => prev + 1);

      } else {
        const errorData = await res.json();
        alert(`주문내역 저장에 실패했습니다: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("거래 요청 중 오류 발생:", error);
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={onSubmit} className={styles.tradeForm}>
      <div className={styles.tradeControls}>
        <div className={styles.cryptoInfo}>
          <div className={styles.toggleBtn}>
            <button
              type="button"
              onClick={() => setTradeType("매수")}
              className={tradeType === "매수" ? styles.tradeactive : ''}
            >매수</button>
            <button
              type="button"
              onClick={() => setTradeType("매도")}
              className={tradeType === "매도" ? styles.tradeactive : ''}
            >매도</button>
          </div>
        </div>

        <table className={styles.tradeTable}>
          <tbody>
            <tr>
              <td>{tradeType === "매수" ? "주문가능" : "판매가능"}</td>
              <td>{tradeType === "매수"
                ? binances.toLocaleString() + " KRW"
                : !selectedCrypto ? "코인을 선택해주세요" : availableAmount.toLocaleString() + " KRW"}
              </td>
            </tr>
            <tr>
              <td>보유 현황</td>
              <td>{ownedQuantity} 개</td>
            </tr>
            <tr>
              <td>주문 수량</td>
              <td>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity === 0 ? "" : quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="0"
                  step="any"
                  className={styles.inputField}
                  style={{ width: '115px' }}
                />
                개
              </td>
            </tr>
            <tr>
              <td>가격</td>
              <td>
                <input
                  type="number"
                  placeholder="0"
                  value={price === 0 ? "" : price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min="0"
                  step="any"
                  className={styles.inputField}
                  style={{ width: '115px' }}
                />
                KRW
              </td>
            </tr>
            <tr>
              <td>총액</td>
              <td>{(quantity && price ? quantity * price : 0).toLocaleString()} KRW</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.bottomButtons}>
          <button type="reset" className={styles.resetButton} onClick={resetForm}>리셋</button>
          <button type="submit" className={styles.submitButton}>완료</button>
        </div>
      </div>
    </form>
  );
}
