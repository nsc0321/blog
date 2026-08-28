import React, { useState } from 'react';
import { Search, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import { Box } from '../../common/Box';
import MabiAuctionChart from '../../MabiAuctionChart';
import { getApiBase } from '../../../config';

export default function MabiOpenApiSearchBox() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [auctionData, setAuctionData] = useState(null);
  const [searchedItemName, setSearchedItemName] = useState('');
  const [error, setError] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const formatGold = (val) => {
    if (!val || isNaN(val)) return '0 Gold';
    const num = Number(val);
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

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setLoading(true);
    setError(null);
    setAuctionData(null);
    setSearchedItemName(cleanQuery);

    try {
      const resp = await fetch(`${API_BASE}/api/mabinogi/auction/history?item_name=${encodeURIComponent(cleanQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || '경매장 거래 정보를 찾을 수 없습니다.');
      
      const historyList = data.auction_history || data.history || data.items || [];
      if (!historyList || historyList.length === 0) {
        setError(`'${cleanQuery}'에 대한 최근 경매장 거래 내역이 없습니다.`);
      } else {
        setAuctionData(data);
      }
    } catch (err) {
      setError(err.message || '조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      title="Nexon Open API Search Box (경매장 실시간 시세 조회)"
      subtitle="넥슨 공식 API 실시간 경매장 최근 체결 시세 및 거래 동향 차트"
      icon={Search}
      badge="Nexon Official"
      badgeType="info"
    >
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            color: '#c4b5fd',
            fontSize: '13px',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            <ShoppingBag size={16} />
            <span>경매장 실시간 시세</span>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="아이템 이름 입력 (예: 디바인 블레이드, 붕괴된 마력의 정수, 기억상실)..."
            style={{
              flex: 1,
              minWidth: '200px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              border: 'none',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: (loading || !query.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: (loading || !query.trim()) ? 0.7 : 1
            }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            <span>검색</span>
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '12px 14px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Auction History & Line Chart View */}
      {auctionData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <MabiAuctionChart
            itemName={searchedItemName || query}
            historyData={auctionData.auction_history || auctionData.history || auctionData.items || []}
            formatGold={formatGold}
          />
        </div>
      )}
    </Box>
  );
}
