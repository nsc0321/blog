import React, { useState, useEffect } from 'react';
import { Layers, Search, RefreshCw, Filter, Sparkles } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function MabiItemArchiveBox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const fetchItems = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/mabinogi/archives/items?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await resp.json();
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.log('Fetch items note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sampleItems = items.length > 0 ? items : [
    { id: 1, item_name: '디바인 블레이드', item_category: '양손검', average_price: 450000000, last_updated: '2026-08-28' },
    { id: 2, item_name: '파멸의 로브 (남성용)', item_category: '천옷/로브', average_price: 1800000000, last_updated: '2026-08-28' },
    { id: 3, item_name: '켈틱 로열 나이트 소드', item_category: '한손검', average_price: 12000000, last_updated: '2026-08-28' }
  ];

  const filtered = sampleItems.filter(i =>
    !search || i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      title="2. Item Archive Box (아이템 데이터베이스)"
      subtitle="수집된 장비, 무기 및 제작 재료 아이템 아카이브"
      icon={Layers}
      badge="Archive DB"
      badgeType="purple"
      actions={
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
      }
    >
      <div style={{ marginBottom: '14px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="아이템 이름 검색..."
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        {filtered.map(item => (
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
                {item.item_category}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 800, marginTop: '6px' }}>
              ₩ {Number(item.average_price).toLocaleString()} Gold
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              최종 갱신: {item.last_updated}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}
