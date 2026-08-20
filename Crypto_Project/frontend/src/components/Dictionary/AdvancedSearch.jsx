import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Dictionary.module.css';

// 보이는 라벨과 실제 value 매핑
const CATEGORY_OPTIONS = [
  { label: '기술(Technology)', value: 'technology' },
  { label: '자산(Assets)', value: 'assets' },
  { label: '거래(Trading)', value: 'trading' },
  // { label: '디파이(DeFi)', value: 'defi' },
  // { label: '지갑/보안(Wallet & Security)', value: 'wallet-security' },
  // { label: '심리/은어(Psychology & Slang)', value: 'psychology-slang' },
  // { label: '생태계(Others)', value: 'ecosystem' },
];

export default function AdvancedSearch({ onApply }) {
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('relevance');

  return (
    <div className={styles.advanced}>
       <select value={category} onChange={e => setCategory(e.target.value)} className={styles.selectBox}>
        <option value="">전체 카테고리</option>
        {CATEGORY_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

     {/* ⭐️ 여기 className={styles.applyButton} 추가! */}
      <button onClick={() => onApply({ category, sort })} className={styles.applyButton}>적용</button>
    </div>
  );
}

AdvancedSearch.propTypes = { onApply: PropTypes.func };
AdvancedSearch.defaultProps = { onApply: () => {} };