import React, { useState } from 'react';
import { Search, User, ShoppingBag, Sparkles, RefreshCw, AlertCircle, BarChart2, Award, Shield, DollarSign } from 'lucide-react';
import { Box } from '../../common/Box';
import MabiAuctionChart from '../../MabiAuctionChart';
import { getApiBase } from '../../../config';

export default function MabiOpenApiSearchBox() {
  const [searchType, setSearchType] = useState('character'); // 'character' | 'auction'
  const [query, setQuery] = useState('');
  const [serverName, setServerName] = useState('류트');
  const [loading, setLoading] = useState(false);
  const [characterData, setCharacterData] = useState(null);
  const [auctionData, setAuctionData] = useState(null);
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
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setCharacterData(null);
    setAuctionData(null);

    try {
      if (searchType === 'character') {
        const resp = await fetch(`${API_BASE}/api/mabinogi/character?server_name=${encodeURIComponent(serverName)}&character_name=${encodeURIComponent(query.trim())}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || '캐릭터 정보를 찾을 수 없습니다.');
        setCharacterData(data);
      } else {
        const resp = await fetch(`${API_BASE}/api/mabinogi/auction/history?item_name=${encodeURIComponent(query.trim())}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || '경매장 거래 정보를 찾을 수 없습니다.');
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
      title="1. Nexon Open API Search Box (캐릭터 & 경매장 실시간 조회)"
      subtitle="넥슨 공식 API 실시간 캐릭터 장비/스탯 뷰어 및 경매장 시세 차트"
      icon={Search}
      badge="Nexon Official"
      badgeType="info"
    >
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={searchType}
            onChange={(e) => { setSearchType(e.target.value); setError(null); }}
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
            <option value="auction" style={{ background: '#121225' }}>🏷️ 경매장 실시간 시세 & 차트</option>
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
            placeholder={searchType === 'character' ? '캐릭터 닉네임 입력 (예: 유하)...' : '아이템 이름 입력 (예: 디바인 블레이드)...'}
            style={{
              flex: 1,
              minWidth: '200px',
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

      {/* Character Result View */}
      {characterData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '10px', borderRadius: '50%', color: '#c4b5fd' }}>
                <User size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  {characterData.character_name || query} ({characterData.server_name || serverName})
                </h4>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                  종족: {characterData.race || '인간'} • 누적레벨: {Number(characterData.cumulative_level || 0).toLocaleString()} • 아르카나: {characterData.talent || '미지정'}
                </div>
              </div>
            </div>

            {characterData.title && (
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.2)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.4)'
              }}>
                👑 {characterData.title}
              </span>
            )}
          </div>

          {/* Equipment Grid */}
          {characterData.equipment && (
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                착용 장비 목록
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {(Array.isArray(characterData.equipment) ? characterData.equipment : Object.entries(characterData.equipment)).map((eq, idx) => {
                  const name = eq.item_name || eq[1]?.item_name || (typeof eq === 'string' ? eq : JSON.stringify(eq));
                  const slot = eq.slot_name || eq[0] || `장비 ${idx+1}`;
                  return (
                    <div key={idx} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{slot}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>{name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auction History & Line Chart View */}
      {auctionData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <MabiAuctionChart
            itemName={query}
            historyData={auctionData.auction_history || auctionData.items || []}
            formatGold={formatGold}
          />
        </div>
      )}
    </Box>
  );
}
