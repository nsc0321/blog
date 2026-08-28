import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function HistoryBox() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/agent/executions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await resp.json();
      if (data.executions && Array.isArray(data.executions)) {
        setHistory(data.executions);
      }
    } catch (err) {
      console.log('Fetch history note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const sampleHistory = history.length > 0 ? history : [
    { id: 1, skill_name: 'bithumb_market_analysis', status: 'SUCCESS', executed_at: '2026-08-28 08:45:12', latency: '1.2s' },
    { id: 2, skill_name: 'mabi_auction_fetch', status: 'SUCCESS', executed_at: '2026-08-28 08:10:04', latency: '0.8s' },
    { id: 3, skill_name: 'user_auth_validation', status: 'SUCCESS', executed_at: '2026-08-28 07:32:55', latency: '0.3s' }
  ];

  return (
    <Box
      title="9. History Box (실행 이력 & 감사 로그)"
      subtitle="Agent 스킬 및 API 실행 기록 감사 로그"
      icon={History}
      badge="Audit Trail"
      badgeType="info"
      actions={
        <button
          onClick={fetchHistory}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sampleHistory.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: item.status === 'SUCCESS' ? '#34d399' : '#f87171'
              }}></div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  {item.skill_name || 'API Execution'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  실행: {item.executed_at} (소요: {item.latency})
                </div>
              </div>
            </div>

            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: item.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: item.status === 'SUCCESS' ? '#34d399' : '#f87171'
            }}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </Box>
  );
}
