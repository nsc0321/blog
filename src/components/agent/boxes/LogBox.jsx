import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Search, Trash2, RefreshCw, Filter, ArrowDown } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function LogBox() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const logEndRef = useRef(null);

  const API_BASE = getApiBase();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/agent/logs`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await resp.json();
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.log('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const timer = setInterval(fetchLogs, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredLogs = logs.filter(l => {
    const text = typeof l === 'string' ? l : l.message || JSON.stringify(l);
    const matchSearch = !search || text.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || (filter === 'ERROR' && text.includes('ERROR')) || (filter === 'WARN' && text.includes('WARN'));
    return matchSearch && matchFilter;
  });

  return (
    <Box
      title="6-2. Log Box (실시간 텔레메트리 로그)"
      subtitle="백엔드 및 Agent 엔진의 실시간 스트리밍 로그 뷰어"
      icon={Terminal}
      badge="Live Stream"
      badgeType="purple"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={fetchLogs}
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
            <span>갱신</span>
          </button>
        </div>
      }
    >
      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="로그 키워드 검색..."
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '7px 10px 7px 30px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '7px 10px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="ALL" style={{ background: '#121225' }}>전체 로그</option>
          <option value="ERROR" style={{ background: '#121225' }}>🔴 ERROR만</option>
          <option value="WARN" style={{ background: '#121225' }}>🟡 WARN만</option>
        </select>
      </div>

      {/* Terminal View */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '12px',
        height: '240px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.6
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '40px' }}>
            로그가 비어있거나 검색 결과가 없습니다.
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const str = typeof log === 'string' ? log : log.message || JSON.stringify(log);
            const isErr = str.includes('ERROR') || str.includes('Exception');
            const isWarn = str.includes('WARN');
            return (
              <div
                key={idx}
                style={{
                  color: isErr ? '#f87171' : isWarn ? '#fbbf24' : '#94a3b8',
                  wordBreak: 'break-all',
                  marginBottom: '4px'
                }}
              >
                {str}
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </Box>
  );
}
