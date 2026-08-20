import React from 'react';
import PropTypes from 'prop-types';
import styles from './Dictionary.module.css';

/*
  props:
    items: [{ id, term }]
    loading: boolean
    onSelect: function(item) -> 호출 시 선택된 항목 전달
*/
export default function SuggestionList({ items, loading, onSelect }) {
  if (loading) return <div className={styles.suggest}>검색어 제안 로딩...</div>;
  if (!items || items.length === 0) return null;

  return (
    <ul
      className={styles.suggestList}
      role="listbox"
      aria-label="연관 검색어"
    >
      {items.map(item => (
        <li key={item.id} role="option" aria-selected="false" className={styles.suggestItem}>
          {/* 버튼을 사용해 Non-interactive 경고 제거 및 키보드 접근성 확보 */}
          <button
            type="button"
            className={styles.suggestButton}
            onMouseDown={(e) => {
              // form submit 전에 선택 처리를 원하면 onMouseDown 유지
              // 필요한 경우 e.preventDefault() 추가
              onSelect?.(item);
            }}
            onClick={() => {
              // 터치/클릭 환경에서의 안전한 처리
              onSelect?.(item);
            }}
          >
            {item.term}
          </button>
        </li>
      ))}
    </ul>
  );
}

SuggestionList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    term: PropTypes.string.isRequired,
  })),
  loading: PropTypes.bool,
  onSelect: PropTypes.func,
};

SuggestionList.defaultProps = {
  items: [],
  loading: false,
  onSelect: () => {},
};