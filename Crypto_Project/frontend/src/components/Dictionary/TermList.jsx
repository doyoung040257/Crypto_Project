import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Dictionary.module.css';

export default function TermList({ items, loading, visibleRows, onSelect, categoryFilter }) {
  
  const filtered = useMemo(() => {
    const safeItems = items || [];
    if (!categoryFilter) return safeItems;
    
    return safeItems.filter(it => 
      String(it.category || '').toLowerCase() === String(categoryFilter || '').toLowerCase()
    );
  }, [items, categoryFilter]);

  const maxRows = Math.min(Math.max(1, visibleRows || 6), 100);

  if (loading) return <div className={styles.loading}>검색 중...</div>;
  if (!items || items.length === 0) return <div className={styles.noResult}>검색 결과가 없습니다.</div>;

  return (
    <div className={styles.resultWrap}>
      <table className={styles.resultTable} role="table" aria-label="검색 결과">
        <colgroup>
          <col style={{ width: '35%' }} />  {/* 🌟 35% */}
          <col style={{ width: '65%' }} />  {/* 🌟 65%로 수정! 총 100% */}
        </colgroup>
        <thead className={styles.resultHead}>
          {/* <tr>
            <th scope="col" className={styles.headCell}>용어</th>
            <th scope="col" className={styles.headCell}>설명</th>
          </tr> */}
        </thead>
        <tbody className={styles.resultBody}>
          {filtered.map(it => (
            <React.Fragment key={it.id}>
              {/* 🌟 하이라이트 효과를 위해 resultRow에 hover 클래스를 이용. */}
              {/* 여기 it.excerpt가 없을 때 descriptionRow를 렌더링하도록 조건 추가 */}
              {/* onSelect는 항상 첫 번째 rowButton에서만 트리거되도록 함 */}
              <tr className={styles.resultRow} onClick={() => onSelect(String(it.id))}> {/* 🌟 row 클릭 시 onSelect 호출 */}
                <td className={styles.termCell}>
                  {/* button은 클릭 가능 영역만 표시 */}
                  <button type="button" className={styles.rowButton}>
                    {it.term}
                  </button>
                </td>
                <td className={styles.excerptCell}>
                  {it.excerpt ? it.excerpt : (it.longDescription || it.description || '')} {/* 요약 설명이 없으면 상세 설명을 바로 보여줌 */}
                </td>
              </tr>
              {/* 🌟 이제 descriptionRow는 필요 없어요! excerptCell에서 상세 설명을 바로 보여줄 거니까요! */}
              {/* 만약 요약 설명과 상세 설명을 별도로 보여주고 싶다면 아래 주석 처리된 코드를 다시 활성화하고 스타일을 추가해야 합니다. */}
              {/*
              {it.excerpt && ( // 요약 설명이 있을 때만 상세 설명을 다른 행으로 보여주고 싶을 경우
                <tr className={styles.descriptionRow}>
                  <td className={styles.descriptionFull} colSpan="2">
                    <div className={styles.descriptionBanner}>
                      {it.longDescription || it.description || ''}
                    </div>
                  </td>
                </tr>
              )}
              */}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// PropTypes 설정 및 기본값은 기존과 동일
