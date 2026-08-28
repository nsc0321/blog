import React, { useState, useEffect } from 'react';
import { Sparkles, Search, RefreshCw, ChevronLeft, ChevronRight, Coins, Layers } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function MabiEnchantArchiveBox() {
  const [enchants, setEnchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('전체'); // '전체' | '접두' | '접미'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isKoreanGold, setIsKoreanGold] = useState(true);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const formatGold = (val) => {
    if (!val || isNaN(val)) return '가격 정보 없음';
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

  const fetchEnchants = async () => {
    setLoading(true);
    try {
      const typeParam = selectedType !== '전체' ? `&enchant_type=${encodeURIComponent(selectedType)}` : '';
      const searchParam = search.trim() ? `&query=${encodeURIComponent(search.trim())}` : '';
      const resp = await fetch(`${API_BASE}/api/mabinogi/archives/enchants?page=${page}&limit=100${typeParam}${searchParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await resp.json();
      if (data.items && Array.isArray(data.items)) {
        setEnchants(data.items);
        setTotalCount(data.total || data.items.length);
        setTotalPages(data.total_pages || Math.ceil((data.total || data.items.length) / 100) || 1);
      } else {
        setEnchants([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.log('Fetch enchants error:', err);
      setEnchants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnchants();
  }, [page, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEnchants();
  };

  return (
    <Box
      title="3. Enchant Archive Box (인챈트 스크롤 아카이브)"
      subtitle="수집된 접두/접미 인챈트 스크롤 옵션, 랭크 및 실거래 시세 데이터베이스"
      icon={Sparkles}
      badge="Enchant DB"
      badgeType="info"
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
            onClick={fetchEnchants}
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
      {/* Type Selector (전체 / 접두 / 접미) */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '14px'
      }}>
        {['전체', '접두', '접미'].map((t) => {
          const isActive = selectedType === t;
          return (
            <button
              key={t}
              onClick={() => { setSelectedType(t); setPage(1); }}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
                background: isActive ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#22d3ee' : '#94a3b8',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {t === '전체' ? '전체 인챈트' : `${t} 인챈트`}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
          총 <strong style={{ color: '#22d3ee', margin: '0 4px' }}>{Number(totalCount).toLocaleString()}</strong>건
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="인챈트 이름, 부위 또는 옵션 효과 검색 (예: 미티어로이드, 솔리스트, 최대 대미지)..."
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
            padding: '8px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
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
      {loading && enchants.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
          <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#22d3ee' }} />
          인챈트 데이터베이스를 불러오는 중입니다...
        </div>
      )}

      {/* Empty State */}
      {!loading && enchants.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '36px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '10px',
          border: '1px dashed rgba(255, 255, 255, 0.08)',
          color: '#94a3b8',
          fontSize: '13px'
        }}>
          조건에 일치하는 인챈트 데이터가 없습니다.
        </div>
      )}

      {/* Enchants List Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {enchants.map(enc => (
          <div
            key={enc.id}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                  {enc.enchant_name}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: enc.enchant_type === '접두' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                    color: enc.enchant_type === '접두' ? '#60a5fa' : '#c084fc',
                    border: `1px solid ${enc.enchant_type === '접두' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`
                  }}>
                    {enc.enchant_type || '인챈트'}
                  </span>
                  {enc.rank && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      {enc.rank}
                    </span>
                  )}
                </div>
              </div>

              {enc.target_equip && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  적용 부위: <span style={{ color: '#cbd5e1' }}>{enc.target_equip}</span>
                </div>
              )}

              <div style={{
                fontSize: '12px',
                color: '#cbd5e1',
                marginTop: '6px',
                lineHeight: 1.4,
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '6px 8px',
                borderRadius: '6px'
              }}>
                {enc.effect_summary || '옵션 정보 없음'}
              </div>
            </div>

            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: enc.avg_price ? '#38bdf8' : '#64748b' }}>
                {enc.avg_price ? formatGold(enc.avg_price) : '시세 미수집'}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {enc.trade_count ? `거래 ${enc.trade_count}건` : (enc.sample_count ? `표본 ${enc.sample_count}건` : '')}
              </div>
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
