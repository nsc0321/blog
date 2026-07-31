import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, History, Calendar, Filter, Search, ArrowUpDown, Bot, Globe,
  RefreshCw, AlertTriangle, Loader, Eye, StopCircle, X
} from 'lucide-react';

export default function ExecutionHistory({ API_BASE, authFetch, activeTab, handleCancelTask, isCancellingTask }) {
  const [historyTasks, setHistoryTasks] = useState([]);
  const [historySummary, setHistorySummary] = useState({
    total_count: 0,
    discord_count: 0,
    web_count: 0,
    running_count: 0,
    stuck_count: 0,
    completed_count: 0,
    avg_duration_seconds: 0
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historySortBy, setHistorySortBy] = useState('date_desc');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historySourceFilter, setHistorySourceFilter] = useState('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchHistoryData = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const queryParams = new URLSearchParams({
        sort_by: historySortBy,
        status: historyStatusFilter,
        source: historySourceFilter,
        limit: '100'
      });
      if (historySearchQuery.trim()) {
        queryParams.set('search', historySearchQuery.trim());
      }
      const resp = await fetch(`${API_BASE}/api/agent/history?${queryParams.toString()}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (resp.ok) {
        const data = await resp.json();
        setHistoryTasks(data.tasks || []);
        setHistorySummary(data.summary || {
          total_count: 0,
          discord_count: 0,
          web_count: 0,
          running_count: 0,
          stuck_count: 0,
          completed_count: 0,
          avg_duration_seconds: 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch task history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [API_BASE, historySortBy, historyStatusFilter, historySourceFilter, historySearchQuery]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoryData();
    }
  }, [activeTab, fetchHistoryData]);

  const handleOpenTaskDetail = async (taskId) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/agent/history/${taskId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (resp.ok) {
        const data = await resp.json();
        setSelectedTaskDetail(data);
      } else {
        alert("상세 내역을 불러올 수 없습니다.");
      }
    } catch (e) {
      console.error("Task detail fetch error:", e);
      alert("상세 내역 조회 중 오류: " + e.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCancelAndRefresh = async (taskId) => {
    if (handleCancelTask) {
      await handleCancelTask(taskId);
      fetchHistoryData();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '24px',
      color: '#fff',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 120px)'
    }}>
      {/* Header & Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} style={{ color: '#818cf8' }} />
            처리 내역 및 Discord Bot 모니터링
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
            에이전트 실행 기록, 소요 시간, Discord Bot 사용 내역 확인 및 정체(Stuck) 프로세스 강제 종료
          </p>
        </div>
        <button
          onClick={fetchHistoryData}
          disabled={isHistoryLoading}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} className={isHistoryLoading ? 'spin' : ''} />
          새로고침
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> 전체 작업 요청
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
            {historySummary.total_count} <span style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(255,255,255,0.6)' }}>건</span>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            Discord: {historySummary.discord_count} / Web: {historySummary.web_count}
          </div>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#a5b4fc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={14} /> Discord Bot 요청
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#c7d2fe' }}>
            {historySummary.discord_count} <span style={{ fontSize: '14px', fontWeight: '400', color: '#a5b4fc' }}>회</span>
          </div>
          <div style={{ fontSize: '11px', color: '#818cf8', marginTop: '4px' }}>
            디스코드 봇 연동 실행 수
          </div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#fcd34d', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} /> 진행 / 정체 중
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#fbbf24' }}>
            {historySummary.running_count + historySummary.stuck_count} <span style={{ fontSize: '14px', fontWeight: '400', color: '#fcd34d' }}>건</span>
          </div>
          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
            진행중: {historySummary.running_count} | 정체(Stuck): {historySummary.stuck_count}
          </div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6ee7b7', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> 평균 처리 시간
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399' }}>
            {historySummary.avg_duration_seconds} <span style={{ fontSize: '14px', fontWeight: '400', color: '#6ee7b7' }}>초</span>
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
            완료율: {historySummary.total_count > 0 ? Math.round((historySummary.completed_count / historySummary.total_count) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            placeholder="요청 내용, Task ID, 결과 검색..."
            value={historySearchQuery}
            onChange={(e) => setHistorySearchQuery(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <select
              value={historySortBy}
              onChange={(e) => setHistorySortBy(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            >
              <option value="date_desc" style={{ color: '#000' }}>📅 최신순 (Newest)</option>
              <option value="date_asc" style={{ color: '#000' }}>📅 오래된순 (Oldest)</option>
              <option value="duration_desc" style={{ color: '#000' }}>⏱️ 처리시간 긴순</option>
              <option value="duration_asc" style={{ color: '#000' }}>⏱️ 처리시간 짧은순</option>
            </select>
          </div>

          {/* Source Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <select
              value={historySourceFilter}
              onChange={(e) => setHistorySourceFilter(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            >
              <option value="all" style={{ color: '#000' }}>🌐 전체 출처</option>
              <option value="discord" style={{ color: '#000' }}>🤖 Discord Bot</option>
              <option value="web" style={{ color: '#000' }}>💻 Web UI</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            >
              <option value="all" style={{ color: '#000' }}>🚥 전체 상태</option>
              <option value="running" style={{ color: '#000' }}>🔵 진행 중</option>
              <option value="completed" style={{ color: '#000' }}>🟢 완료</option>
              <option value="failed" style={{ color: '#000' }}>🔴 오류</option>
              <option value="cancelled" style={{ color: '#000' }}>🟠 강제 종료</option>
              <option value="stuck" style={{ color: '#000' }}>⚠️ 정체됨 (Stuck)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task History Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {isHistoryLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <Loader className="spin" size={24} style={{ marginBottom: '8px' }} />
            <div>처리 내역 불러오는 중...</div>
          </div>
        ) : historyTasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            조건에 맞는 처리 내역이 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(255,255,255,0.6)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>일시</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>출처</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>요청 내용 (Goal)</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>상태</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>처리 시간</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>관리 / 상세</th>
                </tr>
              </thead>
              <tbody>
                {historyTasks.map((t) => {
                  const isDiscord = t.source && t.source.toLowerCase().includes('discord');
                  const isRunning = t.status === 'running';
                  const isStuck = t.status === 'stuck';
                  const isCancelling = t.status === 'cancelling';

                  const statusBadges = {
                    running: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)', label: '진행 중' },
                    completed: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.4)', label: '완료' },
                    failed: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)', label: '오류' },
                    cancelled: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)', label: '강제 종료' },
                    stuck: { bg: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.6)', label: '⚠️ 정체됨' }
                  };
                  const sb = statusBadges[t.status] || statusBadges.failed;

                  const durationDisplay = t.duration_seconds !== null && t.duration_seconds !== undefined
                    ? (t.duration_seconds > 60
                        ? `${Math.floor(t.duration_seconds / 60)}분 ${Math.round(t.duration_seconds % 60)}초`
                        : `${t.duration_seconds}초`)
                    : (isRunning ? '진행 중...' : '-');

                  return (
                    <tr key={t.task_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                        {t.started_at ? new Date(t.started_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                      </td>

                      {/* Source */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: isDiscord ? 'rgba(99, 102, 241, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                          border: `1px solid ${isDiscord ? 'rgba(99, 102, 241, 0.4)' : 'rgba(14, 165, 233, 0.4)'}`,
                          color: isDiscord ? '#a5b4fc' : '#38bdf8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isDiscord ? <Bot size={12} /> : <Globe size={12} />}
                          {t.source}
                        </span>
                      </td>

                      {/* Goal */}
                      <td style={{ padding: '14px 16px', color: '#fff', maxWidth: '360px' }}>
                        <div style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: '500'
                        }} title={t.goal}>
                          {t.goal}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                          ID: {t.task_id} {t.logs_count > 0 && `· Logs: ${t.logs_count}건`}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: sb.bg,
                          color: sb.color,
                          border: `1px solid ${sb.border}`,
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {(isRunning || isCancelling) && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sb.color, animation: 'pulse 1.5s infinite' }} />}
                          {sb.label}
                        </span>
                      </td>

                      {/* Duration */}
                      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {durationDisplay}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenTaskDetail(t.task_id)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#fff',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={12} />
                            상세
                          </button>

                          {(isRunning || isStuck || isCancelling) && (
                            <button
                              onClick={() => handleCancelAndRefresh(t.task_id)}
                              disabled={isCancellingTask && isCancellingTask[t.task_id]}
                              style={{
                                background: 'rgba(239, 68, 68, 0.85)',
                                border: 'none',
                                color: '#fff',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: isCancellingTask && isCancellingTask[t.task_id] ? 0.6 : 1
                              }}
                              title="강제 종료"
                            >
                              <StopCircle size={12} />
                              강제 종료
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {isDetailModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#131b2e',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            width: '760px',
            maxWidth: '95%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} style={{ color: '#818cf8' }} />
                작업 상세 처리 내역 (ID: {selectedTaskDetail?.task_id || '...'})
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isDetailLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                  <Loader className="spin" size={24} />
                  <div style={{ marginTop: '8px' }}>상세 기록 조회 중...</div>
                </div>
              ) : selectedTaskDetail ? (
                <>
                  {/* Status Info Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>출처:</span>{' '}
                      <strong style={{ color: '#38bdf8' }}>{selectedTaskDetail.source}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>상태:</span>{' '}
                      <strong style={{ color: '#34d399' }}>{selectedTaskDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>소요 시간:</span>{' '}
                      <strong style={{ color: '#fbbf24' }}>
                        {selectedTaskDetail.duration_seconds !== null ? `${selectedTaskDetail.duration_seconds}초` : '-'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>시작:</span>{' '}
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {selectedTaskDetail.started_at ? new Date(selectedTaskDetail.started_at).toLocaleTimeString('ko-KR') : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Goal / User Input */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#a5b4fc', marginBottom: '6px' }}>
                      🎯 요청 내용 (Goal):
                    </div>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#fff',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedTaskDetail.goal}
                    </div>
                  </div>

                  {/* Output / Answer */}
                  {selectedTaskDetail.output && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', marginBottom: '6px' }}>
                        💬 최종 답변 / 결과 Output:
                      </div>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#e2e8f0',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedTaskDetail.output}
                      </div>
                    </div>
                  )}

                  {/* Step Execution Logs */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24', marginBottom: '6px' }}>
                      📜 단계별 실행 로그 (Trace Timeline):
                    </div>
                    <div style={{
                      background: '#0a0f1d',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      {(!selectedTaskDetail.logs || selectedTaskDetail.logs.length === 0) ? (
                        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>기록된 단계별 로그가 없습니다.</div>
                      ) : (
                        selectedTaskDetail.logs.map((l, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, fontSize: '11px' }}>
                              {l.ts ? new Date(l.ts).toLocaleTimeString('ko-KR') : ''}
                            </span>
                            <span style={{ color: '#38bdf8', flex: 1, wordBreak: 'break-all' }}>
                              {typeof l === 'string' ? l : (l.msg || JSON.stringify(l))}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
