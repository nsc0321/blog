import React, { useState } from 'react';
import { Search, User, ShoppingBag, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function MabiOpenApiSearchBox() {
  const [searchType, setSearchType] = useState('character'); // 'character' | 'auction'
  const [query, setQuery] = useState('');
  const [serverName, setServerName] = useState('류트');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const endpoint = searchType === 'character'
        ? `/api/mabinogi/character?server_name=${encodeURIComponent(serverName)}&character_name=${encodeURIComponent(query.trim())}`
        : `/api/mabinogi/auction/history?item_name=${encodeURIComponent(query.trim())}`;

      const resp = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message || '조회 실패' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      title="1. Nexon Open API Search Box (실시간 조회)"
      subtitle="넥슨 공식 API 실시간 캐릭터 장비/스탯 및 경매장 시세 검색"
      icon={Search}
      badge="Nexon API"
      badgeType="info"
    >
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          >
            <option value="character" style={{ background: '#121225' }}>👤 캐릭터 정보 조회</option>
            <option value="auction" style={{ background: '#121225' }}>🏷️ 경매장 거래 내역</option>
          </select>

          {searchType === 'character' && (
            <select
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="류트" style={{ background: '#121225' }}>류트 서버</option>
              <option value="만돌린" style={{ background: '#121225' }}>만돌린 서버</option>
              <option value="하프" style={{ background: '#121225' }}>하프 서버</option>
              <option value="울프" style={{ background: '#121225' }}>울프 서버</option>
            </select>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchType === 'character' ? '캐릭터 닉네임 입력...' : '아이템 이름 입력...'}
            style={{
              flex: 1,
              minWidth: '180px',
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
            disabled={loading || !query.trim()}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              border: 'none',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            <span>검색</span>
          </button>
        </div>
      </form>

      {/* Result Viewer */}
      {result && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '14px',
          maxHeight: '280px',
          overflowY: 'auto',
          fontSize: '12px',
          color: '#cbd5e1'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#38bdf8', fontFamily: 'monospace' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </Box>
  );
}
