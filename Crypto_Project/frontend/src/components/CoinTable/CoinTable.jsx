// frontend/src/components/CoinTable/CoinTable.jsx (수정)
import styles from './CoinTable.module.css'
import React from 'react';

// 유틸리티 함수
const formatCurrency = (number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 2 
}).format(number);

function CoinTable({ coins, onCoinSelect, selectedIds }) { 

    return (
        <div className={styles.container}>
            <div>
            <h2 className={styles.title}>코인 목록(최대4개)</h2>
            </div>
            
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.headerCell}>순위</th>
                        <th className={styles.headerCell}>코인</th>
                        <th className={styles.headerCell}>현재 가격 (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    {coins.map((coin) => {
                        const isSelected = selectedIds.includes(coin.id);
                        
                        return (
                            <tr 
                                key={coin.id} 
                                onClick={() => onCoinSelect(coin.id)}
                                className={`${styles.row} ${isSelected ? styles.selectedRow : ''}`}
                            >
                                <td className={styles.cell}>{coin.market_cap_rank}</td>
                                <td className={styles.cell}>
                                    <img 
                                        src={coin.image} 
                                        alt={`${coin.name} logo`} 
                                        width="16" 
                                        height="16" 
                                        className={styles.coinIcon} 
                                    />
                                    {coin.name} ({coin.symbol.toUpperCase()})
                                </td>
                                <td className={styles.cell}>{formatCurrency(coin.current_price)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default CoinTable;