import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Search, CheckCircle2, Clock } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingLogBox({ logs = [], onRefresh, loading = false }) {
  const [search, setSearch] = useState('');

  const sampleLogs = logs.length > 0 ? logs : [
    { id: 1, type: 'ANALYSIS', message: 'BTC/KRW RSI(54.2), MACD Golden Cross detected -> Decision: HOLD', timestamp: '2026-08-28 09:20:15' },
    { id: 2, type: 'ORDER', message: 'Dry-Run BUY order executed: 10,000 KRW at ₩144,200,000', timestamp: '2026-08-28 09:15:02' },
    { id: 3, type: 'CIRCUIT', message: 'Circuit breaker health check: Normal volatility index (1.2%)', timestamp: '2026-08-28 09:00:00' }
  ];

  const filteredLogs = sampleLogs.filter(l =>
    !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      title="5. Trading Log Box (자동매매 실행 감사 로그)"
      subtitle="시장 분석, 조건 체결 및 리스크 관리 감사 기록"
      icon={Terminal}
      badge="Audit Trail"
      badgeType="info"
      actions={
        <button
          onClick={onRefresh}
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
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="로그 검색..."
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
        {filteredLogs.map(log => (
          <div
            key={log.id}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '2px' }}>
                {log.message}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                {log.timestamp}
              </div>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: log.type === 'ORDER' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              color: log.type === 'ORDER' ? '#34d399' : '#c4b5fd'
            }}>
              {log.type}
            </span>
          </div>
        ))}
      </div>
    </Box>
  );
}
