// src/hooks/useDictionary.js
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import DictionaryData from '../utils/DictionaryData.json';

/* Debounce 훅 */
function useDebounce(value, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* 데이터 정규화 */
function normalizeTerms(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => {
    const id = String(t.id ?? t.term ?? '').trim();
    const term = t.term ?? '';
    const aliases = Array.isArray(t.aliases) ? t.aliases.map(a => String(a)) : [];
    const category = t.category ?? 'uncategorized';
    const description = t.description ?? '';
    const excerpt = t.excerpt ?? (description ? description.slice(0, 120) : '');
    const tags = Array.isArray(t.tags) ? t.tags.map(tag => String(tag)) : [];
    const rawRelated = Array.isArray(t.related) ? t.related : (Array.isArray(t.relatedTerms) ? t.relatedTerms : []);
    const related = rawRelated.map(r => {
      if (!r) return null;
      if (typeof r === 'string') return { id: String(r), type: 'related', score: 1.0, source: 'manual' };
      const rid = String(r.id ?? r.term ?? '').trim();
      return { id: rid, type: r.type ?? 'related', score: (typeof r.score === 'number') ? r.score : 1.0, source: r.source ?? 'manual' };
    }).filter(Boolean);
    const popularity = typeof t.popularity === 'number' ? t.popularity : 0;
    const updatedAt = t.updatedAt ?? null;
    return { id, term, aliases, category, description, excerpt, tags, related, popularity, updatedAt };
  });
}

/* 검색/필터 헬퍼 */
function filterTerms(terms, q, { category, tags = [], sort } = {}) {
  const query = (q ?? '').trim().toLowerCase();
  let list = Array.isArray(terms) ? terms : [];

  if (category) {
    list = list.filter(t => String(t.category).toLowerCase() === String(category).toLowerCase());
  }

  if (Array.isArray(tags) && tags.length > 0) {
    const lowered = tags.map(x => String(x).toLowerCase());
    list = list.filter(t => lowered.every(tag => (t.tags || []).map(y=>String(y).toLowerCase()).includes(tag)));
  }

  if (query) {
    list = list.filter(t => {
      const hay = [
        t.term || '',
        ...(t.aliases || []),
        ...(t.tags || []),
        t.description || ''
      ].join(' ').toLowerCase();
      return hay.includes(query);
    });
  }

  if (sort === 'recent') {
    list = list.slice().sort((a,b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  } else if (sort === 'popular') {
    list = list.slice().sort((a,b) => (b.popularity || 0) - (a.popularity || 0));
  }

  return list;
}

/* 메인 훅 */
export default function useDictionary({ initialQuery = '' } = {}) {
  const [allTerms, setAllTerms] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 220);
  const mountedRef = useRef(false);
  const timerRef = useRef(null);

  const allTermsMap = useMemo(() => Object.fromEntries((allTerms || []).map(t => [String(t.id), t])), [allTerms]);
  const categories = useMemo(() => Array.from(new Set((allTerms || []).map(t => t.category))).sort(), [allTerms]);
  const allTags = useMemo(() => Array.from(new Set((allTerms || []).flatMap(t => t.tags || []))).sort(), [allTerms]);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    try {
      const raw = Array.isArray(DictionaryData.terms) ? DictionaryData.terms : [];
      const normalized = normalizeTerms(raw);
      if (mountedRef.current) { setAllTerms(normalized); setError(null); }
    } catch (err) {
      console.error('[useDictionary] load error', err);
      if (mountedRef.current) { setAllTerms([]); setError(err); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // suggestions
  useEffect(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (!debouncedQuery) { setSuggestions([]); setSuggestLoading(false); return; }

    setSuggestLoading(true);
    timerRef.current = setTimeout(() => {
      try {
        const q = (debouncedQuery || '').trim().toLowerCase();
        const matched = (allTerms || []).filter(t => {
          const termMatch = (t.term || '').toLowerCase().includes(q);
          const aliasMatch = (t.aliases || []).some(a => (a||'').toLowerCase().includes(q));
          const tagMatch = (t.tags || []).some(tag => (tag||'').toLowerCase().includes(q));
          return termMatch || aliasMatch || tagMatch;
        }).slice(0, 8).map(t => ({ id: t.id, term: t.term }));
        if (mountedRef.current) { setSuggestions(matched); setSuggestLoading(false); setError(null); }
      } catch (err) {
        console.error('[useDictionary] suggestion error', err);
        if (mountedRef.current) { setSuggestions([]); setSuggestLoading(false); setError(err); }
      } finally { timerRef.current = null; }
    }, 60);

    return () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  }, [debouncedQuery, allTerms]);

  // search
  const search = useCallback((params = {}) => {
    setLoading(true);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    timerRef.current = setTimeout(() => {
      try {
        const list = filterTerms(allTerms, query, params);
        const mapped = (list || []).map(t => ({
          id: t.id,
          term: t.term,
          excerpt: t.excerpt || (t.description || '').slice(0, 120),
          category: t.category,
          tags: t.tags,
        }));
        if (mountedRef.current) { setResults(mapped); setError(null); }
      } catch (err) {
        console.error('[useDictionary] search error', err, { query, params });
        if (mountedRef.current) { setResults([]); setError(err); }
      } finally {
        if (mountedRef.current) setLoading(false);
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      }
    }, 60);
  }, [allTerms, query]);

  // fetchDetail
  const fetchDetail = useCallback((id) => {
    try {
      const sid = String(id);
      const item = (allTerms || []).find(t => String(t.id) === sid) || null;
      if (mountedRef.current) { setSelectedTerm(item); setError(null); }
    } catch (err) {
      console.error('[useDictionary] fetchDetail error', err, { id });
      if (mountedRef.current) setError(err);
    }
  }, [allTerms]);

  useEffect(() => () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } }, []);

  return {
    allTerms, allTermsMap, categories, allTags,
    query, setQuery,
    suggestions, suggestLoading,
    results, loading,
    selectedTerm, setSelectedTerm,
    search, fetchDetail,
    error,
  };
}