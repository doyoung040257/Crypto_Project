import React from 'react';
import PropTypes from 'prop-types';
import styles from './Dictionary.module.css';

export default function TermDetail({ term, allTermsMap, onRelatedClick, onClose }) {
  if (!term) return <div className={styles.detailEmpty}>용어를 선택하면 상세 내용이 표시됩니다.</div>;

  const rawRelated = Array.isArray(term.related) && term.related.length ? term.related : (Array.isArray(term.relatedTerms) ? term.relatedTerms : []);
  const relatedList = rawRelated
    .map(r => {
      if (!r) return null;
      const rid = String(r.id ?? r).trim();
      const mapped = allTermsMap && allTermsMap[rid] ? allTermsMap[rid].term : (r.term ?? rid);
      const type = r.type ?? 'related';
      const score = (typeof r.score === 'number') ? r.score : (r.score == null ? 1.0 : Number(r.score));
      return { id: rid, term: mapped, type, score };
    })
    .filter(Boolean);

  // 안전하게 description 가져오기
  const descriptionRaw = term.description ?? '';

  return (
    <div className={styles.detail}>
      {/* 제목 */}
      <div className={`${styles.sectionBlock} ${styles.headerBlock}`}>
        <h2 className={styles.termNameLeft}>{term.term}</h2>
        {onClose && <button type="button" className={styles.detailClose} onClick={onClose} aria-label="상세 닫기">닫기</button>}
      </div>

      <div className={styles.blockDivider} />

      {/* 카테고리 */}
      <div className={`${styles.sectionBlock} ${styles.categoryBlock}`}>
        <div className={styles.detailCategory}>
          <strong>카테고리: </strong>
          <span>{term.category ?? '분류 없음'}</span>
        </div>
      </div>

      <div className={styles.blockDivider} />

      {/* 설명: 빈 줄 기준으로 문단 분리하여 <p>로 렌더 */}
      <div className={`${styles.sectionBlock} ${styles.descriptionBlock}`}>
        <h4 className={styles.sectionTitle}>설명</h4>
        <div className={styles.descriptionText}>
          {String(descriptionRaw)
            .split(/\n\s*\n/)            // 빈 줄(또는 공백만 있는 줄) 기준 분리
            .map((para, idx) => (
              <p key={idx}>
                {para.split('\n').map((line, i) => ( // 단일 줄바꿈도 유지하고 싶다면 <br/> 처리
                  <React.Fragment key={i}>
                    {line}
                    {i < para.split('\n').length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </p>
            ))}
        </div>
      </div>

      <div className={styles.blockDivider} />

      {/* 연관 용어 */}
      <div className={`${styles.sectionBlock} ${styles.relatedBlock}`} aria-labelledby="related-label">
        <h4 id="related-label" className={styles.sectionTitle}>연관 용어</h4>
        <ul className={styles.relatedList}>
          {relatedList.length > 0 ? (
            relatedList.map(r => (
              <li key={r.id} className={styles.relatedItem}>
                <button
                  type="button"
                  className={styles.relatedButton}
                  onClick={() => onRelatedClick?.(r.id)}
                >
                  {r.term}
                </button>
              </li>
            ))
          ) : (
            <li className={styles.noRelated}>해당 단어와 연관된 단어가 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

TermDetail.propTypes = {
  term: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    term: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    related: PropTypes.array,
    relatedTerms: PropTypes.array,
  }),
  allTermsMap: PropTypes.object,
  onRelatedClick: PropTypes.func,
  onClose: PropTypes.func,
};

TermDetail.defaultProps = {
  term: null,
  allTermsMap: null,
  onRelatedClick: () => {},
  onClose: null,
};