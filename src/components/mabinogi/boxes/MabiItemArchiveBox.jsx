import React, { useState, useEffect } from 'react';
import { Layers, Search, RefreshCw, Filter, Sparkles, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

const MABI_CATEGORIES = [
  "전체", "검", "양손 장비", "한손 장비", "너클", "랜스", "듀얼건", "수리검", "체인 블레이드",
  "스태프", "원드", "실린더", "활", "석궁", "아틀라틀", "악기", "마리오네트", "핸들",
  "경갑옷", "중갑옷", "천옷", "천옷/방직", "로브", "모자/가발", "장갑", "신발", "방패",
  "액세서리", "에코스톤", "오브", "마도서", "토템", "팔리아스 유물", "인챈트 스크롤", "보석",
  "개조석", "불타래", "핀즈비즈", "마기그래프", "마기그래프 도안", "포션", "기타 재료", "생활 도구"
];

export default function MabiItemArchiveBox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isKoreanGold, setIsKoreanGold] = useState(true);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const formatGold = (val) => {
    if (!val || isNaN(val)) return '0 Gold';
    const num = Number(val);
    if (!isKoreanGold) return `${num.toLocaleString()} Gold`;
    if (num >= 100000000) {
      const eok = Math.floor(num / 100000000);
      const man = Math.floor((num % 100000000) / 10000);
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만 Gold` : `${eok}억 Gold`;
    }
    if (num >= 10000) {
      return `${Math.floor(num / 10000).toLocaleString()}만 Gold`;
    }
    return `${num.toLocaleString()} Gold`;
  };

  const [totalCount, setTotalCount] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const catParam = selectedCategory !== '전체' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      const cleanSearch = search.trim();
      const searchParam = cleanSearch ? `&query=${encodeURIComponent(cleanSearch)}&search=${encodeURIComponent(cleanSearch)}` : '';
      const resp = await fetch(`${API_BASE}/api/mabinogi/archives/items?page=${page}&limit=100${catParam}${searchParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await resp.json();
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
        const count = data.total_count || data.total || data.items.length;
        setTotalCount(count);
        setTotalPages(data.total_pages || Math.ceil(count / 100) || 1);
      } else {
        setItems([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.log('Fetch items error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  return (
    <Box
      title="2. Item Archive Box (아이템 아카이브 빅데이터)"
      subtitle="73개 공식 카테고리별 장비, 옵션 범위 및 거래 가격 아카이브"
      icon={Layers}
      badge="Archive DB"
      badgeType="purple"
      actions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setIsKoreanGold(!isKoreanGold)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: isKoreanGold ? '#34d399' : '#cbd5e1',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Coins size={12} />
            <span>{isKoreanGold ? '만/억 단위 ON' : '숫자 단위'}</span>
          </button>

          <button
            onClick={fetchItems}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>새로고침</span>
          </button>
        </div>
      }
    >
      {/* Category selector */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '14px'
      }}>
        {MABI_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setPage(1); }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${isActive ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
                background: isActive ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#c4b5fd' : '#94a3b8',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="아이템 이름 검색..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          검색
        </button>
      </form>

      {/* Loading state */}
      {loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
          <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#8b5cf6' }} />
          아이템 아카이브를 불러오는 중입니다...
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '36px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '10px',
          border: '1px dashed rgba(255, 255, 255, 0.08)',
          color: '#94a3b8',
          fontSize: '13px',
          marginBottom: '16px'
        }}>
          조건에 일치하는 아이템 데이터가 없습니다.
        </div>
      )}

      {/* Item Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                {item.item_name}
              </div>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#c4b5fd'
              }}>
                {item.category || item.item_category}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 800, marginTop: '6px' }}>
              {formatGold(item.avg_price || item.average_price)}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>수집 샘플: {item.sample_count || item.trade_count || 1}건</span>
              <span>{item.last_history_collected_at ? new Date(item.last_history_collected_at).toLocaleDateString() : '최신'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#cbd5e1',
              cursor: page <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
            페이지 <strong>{page}</strong> / {totalPages} (100건씩 보기)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#cbd5e1',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </Box>
  );
}
