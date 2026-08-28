import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Terminal, AlertCircle, PlayCircle } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function HistoryBox() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50');

      const resp = await fetch(`${API_BASE}/api/agent/history?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setHistory(data.history || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.log('Fetch agent history note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed' || s === 'success') {
      return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', text: '성공 (Completed)', icon: CheckCircle2 };
    }
    if (s === 'running') {
      return { bg: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', text: '실행 중 (Running)', icon: PlayCircle };
    }
    if (s === 'failed' || s === 'error') {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', text: '실패 (Failed)', icon: XCircle };
    }
    if (s === 'cancelled') {
      return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', text: '취소됨 (Cancelled)', icon: AlertCircle };
    }
    return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', text: status || 'Pending', icon: Clock };
  };

  return (
    <Box
      title="Agent History (에이전트 실행 이력 & 감사 로그)"
      subtitle="AI Agent 비동기 태스크, 스킬 실행 내역 및 상세 진행 감사 로그"
      icon={History}
      badge="Agent History"
      badgeType="info"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={fetchHistory}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>새로고침</span>
          </button>
        </div>
      }
    >
      {/* 1. Summary Metrics Header */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          marginBottom: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>총 실행 횟수</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{summary.total_count || 0}건</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>성공 완료</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>{summary.completed_count || 0}건</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>실행 중</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#c4b5fd', marginTop: '2px' }}>{summary.running_count || 0}건</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>평균 소요 시간</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{summary.avg_duration_sec ? `${summary.avg_duration_sec}초` : '-'}</div>
          </div>
        </div>
      )}

      {/* 2. Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            placeholder="태스크 ID, 목표 프롬프트 또는 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '7px 12px',
              color: '#f8fafc',
              fontSize: '12px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'rgba(139, 92, 246, 0.25)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              borderRadius: '8px',
              padding: '0 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Search size={13} />
            <span>검색</span>
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: 'rgba(18, 18, 37, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '7px 10px',
            color: '#cbd5e1',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="all">전체 상태</option>
          <option value="completed">성공 완료</option>
          <option value="running">실행 중</option>
          <option value="failed">실패</option>
          <option value="cancelled">취소됨</option>
        </select>
      </form>

      {/* 3. Task History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px 10px',
            color: '#64748b',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            border: '1px dashed rgba(255, 255, 255, 0.06)',
            fontSize: '13px'
          }}>
            {loading ? '에이전트 실행 이력을 불러오는 중입니다...' : '기록된 Agent 실행 이력이 없습니다.'}
          </div>
        ) : (
          history.map((item) => {
            const badge = getStatusBadge(item.status);
            const StatusIcon = badge.icon;
            const isExpanded = expandedTaskId === item.id || expandedTaskId === item.task_id;

            return (
              <div
                key={item.id || item.task_id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedTaskId(isExpanded ? null : (item.id || item.task_id))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      padding: '3px 7px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#a78bfa',
                      fontWeight: 700
                    }}>
                      #{item.task_id ? String(item.task_id).slice(0, 8) : item.id}
                    </span>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', wordBreak: 'break-word' }}>
                        {item.goal || item.skill_name || 'Agent Goal Execution'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span>출처: {item.source || 'web'}</span>
                        <span>시작: {item.started_at ? new Date(item.started_at).toLocaleString('ko-KR') : '-'}</span>
                        {item.duration_seconds !== null && item.duration_seconds !== undefined && (
                          <span style={{ color: '#38bdf8' }}>소요: {item.duration_seconds}초</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: badge.bg,
                      color: badge.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <StatusIcon size={12} />
                      <span>{badge.text}</span>
                    </span>

                    {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                  </div>
                </div>

                {/* Expanded Details: Output & Logs */}
                {isExpanded && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    {item.output && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '4px' }}>최종 응답 결과:</div>
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e2e8f0',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {item.output}
                        </div>
                      </div>
                    )}

                    {item.logs && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Terminal size={12} />
                          <span>실행 상세 로그:</span>
                        </div>
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          padding: '10px',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#38bdf8',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '240px',
                          overflowY: 'auto'
                        }}>
                          {typeof item.logs === 'string' ? item.logs : JSON.stringify(item.logs, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Box>
  );
}
