// src/pages/Dictionary/DictionaryPage.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/Dictionary/SearchBar';
import AdvancedSearch from '../../components/Dictionary/AdvancedSearch';
import SuggestionList from '../../components/Dictionary/SuggestionList';
import TermList from '../../components/Dictionary/TermList';
import TermDetail from '../../components/Dictionary/TermDetail';
import useDictionary from '../../hooks/useDictionary';
import styles from '../../components/Dictionary/Dictionary.module.css';

export default function DictionaryPage() {
  const {
    allTerms,
    categories, // useDictionary가 categories를 제공하면 AdvancedSearch에 전달 가능
    query, setQuery,
    suggestions, suggestLoading,
    results, loading,
    selectedTerm, fetchDetail, search,
  } = useDictionary();

  const location = useLocation();
  const navigate = useNavigate();

  // 기본은 빈 문자열로 두면 "전체 카테고리" 의미
  const [categoryFilter, setCategoryFilter] = useState('');
  const autoTriggeredRef = useRef(false); // 자동 실행 중복 방지

  const allTermsMap = useMemo(() => {
    const arr = Array.isArray(allTerms) ? allTerms : [];
    return Object.fromEntries(arr.map(t => [String(t.id), t]));
  }, [allTerms]);

  const handleSelect = (id) => {
    if (!id) return;
    fetchDetail(String(id));
  };

  const handleApplyAdvanced = (params) => {
    // AdvancedSearch가 category에 ''(빈 문자열)을 전달하면 전체 의미
    const cat = params?.category ?? '';
    setCategoryFilter(cat);
    search({ category: cat, sort: params?.sort });
  };

  const handleSuggestionSelect = (item) => {
    if (!item) return;
    setQuery(item.term);
    // suggestion 선택 후 현재 카테고리 기준으로 검색 실행
    search({ category: categoryFilter, q: item.term });
  };

  // 1) 헤더에서 navigate로 state: { autoSearch: true }를 보낸 경우 처리
  useEffect(() => {
    const auto = location?.state?.autoSearch === true;
    if (!auto) return;
    // 한 번만 수행
    if (!autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      setCategoryFilter(''); // UI 동기화: 전체 카테고리
      // 만약 allTerms가 아직 비어있다면 다음 effect(allTerms 의존)에서 실제 search를 수행하게 한다.
      // 여기서는 allTerms 준비 여부와 상관없이 일단 시도
      if (Array.isArray(allTerms) && allTerms.length > 0) {
        search({ category: '' });
      } else {
        // allTerms 아직 로드 전이면 아래 allTerms 의존 effect가 실행되면 검색이 일어남.
      }
      // location.state 초기화해서 뒤로가기/재진입 시 중복 실행 방지
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.autoSearch]);

  // 2) allTerms가 준비되는 시점을 감지해서 아직 자동검색이 실행되지 않았으면 실행
  useEffect(() => {
    if (autoTriggeredRef.current) return; // 이미 자동 실행 된 경우 무시
    if (Array.isArray(allTerms) && allTerms.length > 0) {
      // 페이지 진입(또는 훅 초기화) 후 allTerms가 준비되면 자동으로 전체 검색 실행
      autoTriggeredRef.current = true;
      setCategoryFilter('');
      search({ category: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTerms]);

  // (선택) 페이지 최초 진입 시에도 전체 검색을 트리거하고 싶다면 아래 useEffect 사용:
  // useEffect(() => {
  //   // 단, autoTriggeredRef와 충돌하지 않도록 위 로직과 함께 사용 시 주의
  //   if (!autoTriggeredRef.current) {
  //     autoTriggeredRef.current = true;
  //     setCategoryFilter('');
  //     search({ category: '' });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <div className={styles.dictionaryPage}>
      <div className={styles.container}>
        <div className={styles.left}>
          <SearchBar
            value={query}
            onChange={(v) => setQuery(v)}
            onSubmit={() => search({ category: categoryFilter, q: query })}
          />

          {/* AdvancedSearch에 categories 전달하면 드롭다운 옵션을 훅 데이터 기준으로 자동 생성 가능 */}
          <AdvancedSearch categories={categories} onApply={handleApplyAdvanced} />

          <SuggestionList
            items={suggestions}
            loading={suggestLoading}
            onSelect={(item) => handleSuggestionSelect(item)}
          />

          <TermList
            items={results}
            loading={loading}
            visibleRows={8}
            onSelect={(id) => handleSelect(id)}
            categoryFilter={categoryFilter}
          />
        </div>

        <aside className={styles.right}>
          <TermDetail
            term={selectedTerm}
            allTermsMap={allTermsMap}
            onRelatedClick={(relatedId) => handleSelect(relatedId)}
          />
        </aside>
      </div>
    </div>
  );
}