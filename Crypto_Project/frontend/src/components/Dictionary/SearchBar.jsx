import React from 'react';
import PropTypes from 'prop-types';
import styles from './Dictionary.module.css';

export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className={styles.searchForm}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <input
        className={styles.searchInput}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="코인 용어를 검색해보세요"
        aria-label="코인 용어 검색"
      />
      <button type="submit" className={styles.searchBtn}>검색</button>
    </form>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

SearchBar.defaultProps = {
  value: '',
  onChange: () => {},
  onSubmit: () => {},
};