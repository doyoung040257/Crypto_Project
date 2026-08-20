// Rank_Board.jsx
import React from 'react';
import styles from './Rank_Board.module.css';

const Rank_Board = ({ rankings, setRankingCriteria, currentCriteria, userId, countdown }) => {
  
  if (!rankings || rankings.length === 0) return <div className={styles.loading}>데이터 로딩 중...</div>;

  const myRankData = rankings.find(user => String(user.id) === String(userId));

  return (
    <div className={styles.rankboard_container}>
      {/* 1. 헤더: 타이틀과 간소화된 타이머 */}
      <div className={styles.header_section}>
        <h2 className={styles.title}>실시간 랭킹</h2>
        <div className={styles.timerBadge}>🕒 {countdown}s</div>
      </div>

      {/* 🌟 2. 내 순위: 상단 배치 및 깨짐 방지 레이아웃 */}
      {myRankData && (
        <div className={styles.myRankTop}>
          <div className={styles.myRankUpper}>
            <div className={styles.myRankBadge}>
              <span className={styles.myLabel}>MY RANK </span>
              <span className={styles.myPos}> {myRankData.ranking_position}위</span>
            </div>
            {/* 이름을 왼쪽 상단에 큼직하게 배치 */}
            <span className={styles.myName}>{myRankData.name}님</span>
          </div>
          
          <div className={styles.myRankLower}>
            {/* 금액을 하단에 강조하여 배치 */}
            <span className={styles.myValue}>
              {currentCriteria === 'asset' 
                ? `${myRankData.asset?.toLocaleString()} KRW` 
                : `${myRankData.profitRate?.toFixed(2)}%`}
            </span>
          </div>
        </div>
      )}

      {/* 3. 정렬 버튼 */}
      <div className={styles.criteriaButtons}>
        <button 
          onClick={() => setRankingCriteria('asset')}
          className={currentCriteria === 'asset' ? styles.activeButton : ''}
        >자산순</button>
        <button 
          onClick={() => setRankingCriteria('profitRate')}
          className={currentCriteria === 'profitRate' ? styles.activeButton : ''}
        >수익률순</button>
      </div>

      {/* 4. 랭킹 테이블 */}
      <div className={styles.tableWrapper}>
        <table className={styles.rankTable}>
          <thead>
            <tr>
              <th>순위</th>
              <th>사용자</th>
              <th>자산</th>
              <th>수익률</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((user) => (
              <tr 
                key={user.id} 
                className={String(user.id) === String(userId) ? styles.highlightRow : ''}
              >
                <td className={styles.rankCol}>
                  {user.ranking_position === 1 ? "🥇" : 
                   user.ranking_position === 2 ? "🥈" : 
                   user.ranking_position === 3 ? "🥉" : user.ranking_position}
                </td>
                <td className={styles.nameCol}>{user.name}</td>
                <td className={styles.assetCol}>{user.asset?.toLocaleString()}</td>
                <td className={`${styles.rateCol} ${user.profitRate >= 0 ? styles.positive : styles.negative}`}>
                  {user.profitRate?.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rank_Board;