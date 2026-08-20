import React, { useState, useEffect, useContext, useCallback } from 'react';
import './MyPage.css';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";

/* ---------------- Pie Chart ---------------- */
const PieChart = ({ portfolios }) => { 
  if (!portfolios || portfolios.length === 0) {
    return <p className="pie-empty-message">보유 종목이 없습니다.</p>;
  }

  // 평가 금액 숫자로 변환, NaN이면 0 처리
  const holdingValues = portfolios.map(item => parseFloat(item.evaluationPrice) || 0);
  const totalValue = holdingValues.reduce((sum, val) => sum + val, 0);

  if (totalValue === 0) {
    return <p className="pie-empty-message">총 평가 금액이 0입니다.</p>;
  }

  // 누적 비율 계산
  let cumulativePercent = 0;
  const cumulativePercents = portfolios.map((item, index) => {
    const percent = (holdingValues[index] / totalValue) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    const end = cumulativePercent;
    return { start, end };
  });

  // conic-gradient 문자열 생성
  const gradientParts = portfolios
    .map((item, index) => {
      const color = `hsl(${(index * 60) % 360}, 70%, 50%)`;
      const { start, end } = cumulativePercents[index];
      return `${color} ${start}% ${end}%`;
    })
    .join(', ');

  const chartSize = 250;             // .pie-chart-circle width/height
  const innerRadius = chartSize * 0.25; // .pie-center 반지름 (60% 크기 기준)

  return (
    <div className="pie-chart-container">
      <div
        className="pie-chart-circle"
        style={{ background: `conic-gradient(${gradientParts})` }}
      >
        {/* 중앙 도넛 유지 */}
        <div className="pie-center">
          <p>보유비중<br/>(%)</p>
        </div>

        {/* 각 조각 중앙에 % 표시 */}
        {portfolios.map((item, index) => {
          const { start, end } = cumulativePercents[index];
          const midPercent = (start + end) / 2;
          const angle = (midPercent / 100) * 360;
          const rad = (angle - 90) * (Math.PI / 180); // 0° 위쪽 기준
          const radius = (chartSize / 2 + innerRadius) / 2; // 중앙 도넛 + 차트 반지름 중간
          const x = chartSize / 2 + radius * Math.cos(rad);
          const y = chartSize / 2 + radius * Math.sin(rad);

          return (
            <div
              key={item.cryptoSymbol}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                pointerEvents: 'none', // 클릭 방해 방지
              }}
            >
              {((holdingValues[index] / totalValue) * 100).toFixed(1)}
            </div>
          );
        })}
      </div>

      {/* 하단 레전드 */}
      <ul className="pie-chart-legend">
        {portfolios.map((item, index) => {
          const percent = (holdingValues[index] / totalValue) * 100;
          const color = `hsl(${(index * 60) % 360}, 70%, 50%)`;
          return (
            <li key={item.cryptoSymbol}>
              <span className="legend-color" style={{ backgroundColor: color }} />
              {item.cryptoName} ({percent.toFixed(1)}%)
            </li>
          );
        })}
      </ul>
    </div>
  );
};


/* ---------------- MyPage ---------------- */
export default function MyPage() {
  const navigate = useNavigate();
  const { userName, isLoggedIn, userId } = useContext(AuthContext);

  const [portfolio, setPortfolio] = useState([]);
  const [totalPortfolio, setTotalPortfolio] = useState(null);
  const [balance, setBalance] = useState({ balance: 0 });
  const [loading, setLoading] = useState(true);

  /** ✅ 데이터 fetch 함수 */
  const fetchPortfolio = useCallback(async () => {
    try {
      const [resPortfolio, resTotal, resBalance] = await Promise.all([
        fetch(`http://localhost:8080/api/portfolio/${userId}`),
        fetch(`http://localhost:8080/api/totalportfolio/${userId}`),
        fetch(`http://localhost:8080/api/trades/users/${userId}`)
      ]);

      if (!resPortfolio.ok || !resTotal.ok || !resBalance.ok) {
        throw new Error("마이페이지 조회 실패");
      }

      const portfolioData = await resPortfolio.json();
      const totalData = await resTotal.json();
      const balanceData = await resBalance.json();

      setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);
      setTotalPortfolio(totalData);
      setBalance(balanceData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /** 최초 로딩 */
  useEffect(() => {
    if (userId) fetchPortfolio();
  }, [userId, fetchPortfolio]);

  /** 30초마다 데이터만 갱신 */
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchPortfolio]);

  if (!isLoggedIn) return null;
  if (loading) return <div>Loading...</div>;

  if (portfolio.length === 0) {
    return (
      <div className="mypage-container">
        <h1>{userName}님의 마이페이지</h1>
        <div className="empty-portfolio-box">
          <div className="empty-icon"></div>
          <h2>보유하신 종목이 없습니다.</h2>
          <p>첫 번째 코인을 매수하고 투자를 시작해 보세요!</p>
          <button 
            className="buy-button" 
            onClick={() => navigate('/simulated_trading')}
          >
            매수하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <h1>{userName}님의 마이페이지</h1>

      <section className="portfolio-section">
        <h2>모의 투자 포트폴리오</h2>

        {/* ---------------- 총 요약 카드 ---------------- */}
        {totalPortfolio && (
          <div className="portfolio-summary-card">
            <h3>내 보유 자산</h3>
            <div className='summarybox'>
              <div className="summary-top">
                <p>총 보유 자산: &nbsp;&nbsp;&nbsp;{parseFloat(totalPortfolio.totalEvaluation + balance.balance).toLocaleString()}원</p>
                <p style={{color: 'gray'}}>|</p>
                <p>보유 KRW: &nbsp;&nbsp;&nbsp;{parseFloat(balance.balance).toLocaleString()}원</p>
              </div>
              <div className="summary-details">
                <div className="summary-item">
                  <span className="summary-title">총 매수 금액</span>
                  <span className="summary-price">{parseFloat(totalPortfolio.totalInvested).toLocaleString()}원</span>
                </div>

                <div className="summary-item">
                  <span className="summary-title">총 평가 금액</span>
                  <span className="summary-price">{parseFloat(totalPortfolio.totalEvaluation).toLocaleString()}원</span>
                </div>

                <div className="summary-item">
                  <span className="summary-title">손익</span>
                  <span className={totalPortfolio.totalProfit >= 0 ? 'profit' : 'loss'}>
                    {parseFloat(totalPortfolio.totalProfit).toLocaleString()}원
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-title">수익률</span>
                  <span className={totalPortfolio.totalRate >= 0 ? 'profit' : 'loss'}>
                    {parseFloat(totalPortfolio.totalRate).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Pie Chart ---------------- */}
        <PieChart portfolios={portfolio} />

        {/* ---------------- 코인별 상세 테이블 ---------------- */}
        <div className="coin-summary-table">
          <table>
            <thead>
              <tr>
                <th>코인</th>
                <th>매수금액</th>
                <th>보유수량</th>
                <th>평균매수금액</th>
                <th>평가금액</th>
                <th>손익</th>
                <th>수익률</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(item => (
                <tr key={item.cryptoSymbol}>
                  <td>{item.cryptoName} ({item.cryptoSymbol?.toUpperCase()})</td>
                  <td>{parseFloat(item.buyPrice).toLocaleString()}</td>
                  <td>{parseFloat(item.quantity).toLocaleString()}</td>
                  <td>{parseFloat(item.averagePrice).toLocaleString()}</td>
                  <td>{parseFloat(item.evaluationPrice).toLocaleString()}</td>
                  <td>{parseFloat(item.profit).toLocaleString()}</td>
                  <td>{parseFloat(item.profitRate).toFixed(2)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
