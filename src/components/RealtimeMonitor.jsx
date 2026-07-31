import React from 'react';
import { Activity, CheckCircle, StopCircle } from 'lucide-react';

export default function RealtimeMonitor({
  monitorTasks,
  monitorLogs,
  fetchMonitorData,
  handleCancelTask,
  isCancellingTask,
  monitorLogsEndRef
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflow: 'hidden' }}>

      {/* Active Tasks */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
            <Activity size={17} /> 진행 중인 태스크
          </h3>
          <button
            onClick={fetchMonitorData}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              padding: '5px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🔄 새로고침
          </button>
        </div>

        {monitorTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
            <CheckCircle size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>현재 진행 중인 태스크가 없습니다</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {monitorTasks.map(task => {
              const isRunning = task.status === 'running';
              const isCancelling = task.status === 'cancelling';
              const statusColors = {
                running: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.4)', dot: '#10b981', label: '진행 중' },
                cancelling: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.4)', dot: '#f59e0b', label: '취소 중...' },
                done: { bg: 'rgba(59, 130, 246, 0.10)', border: 'rgba(59, 130, 246, 0.3)', dot: '#3b82f6', label: '완료' },
                error: { bg: 'rgba(239, 68, 68, 0.10)', border: 'rgba(239, 68, 68, 0.3)', dot: '#ef4444', label: '오류' },
                cancelled: { bg: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.3)', dot: '#6b7280', label: '중단됨' },
              };
              const sc = statusColors[task.status] || statusColors.error;
              return (
                <div key={task.id} style={{
                  background: sc.bg,
                  border: `1px solid ${sc.border}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}>
                  {/* Status dot */}
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: sc.dot, flexShrink: 0, marginTop: '5px',
                    animation: (isRunning || isCancelling) ? 'pulse 1.5s infinite' : 'none'
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '4px', wordBreak: 'break-word' }}>
                      {task.goal}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                      <span>ID: <code style={{ color: 'rgba(255,255,255,0.65)' }}>{task.id}</code></span>
                      <span>출처: {task.source}</span>
                      <span>시작: {task.started_at ? new Date(task.started_at).toLocaleTimeString('ko-KR') : '-'}</span>
                      {task.finished_at && <span>종료: {new Date(task.finished_at).toLocaleTimeString('ko-KR')}</span>}
                      <span style={{ color: sc.dot, fontWeight: '700' }}>{sc.label}</span>
                    </div>
                  </div>

                  {/* Cancel button */}
                  {(isRunning || isCancelling) && (
                    <button
                      onClick={() => handleCancelTask(task.id)}
                      disabled={isCancellingTask[task.id] || isCancelling}
                      style={{
                        background: isCancelling ? 'rgba(107,114,128,0.3)' : 'rgba(239, 68, 68, 0.85)',
                        border: 'none',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: isCancelling ? 'default' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '700',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        opacity: isCancellingTask[task.id] ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      title="태스크 강제 중단"
                    >
                      <StopCircle size={13} />
                      {isCancelling ? '취소 중...' : '강제 중단'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Stream */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.07)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: '220px',
        maxHeight: '380px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            실시간 로그
          </h3>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>최근 100건 · 3초마다 자동 갱신</span>
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {monitorLogs.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', paddingTop: '32px' }}>로그가 없습니다</div>
          ) : (
            monitorLogs.map((log, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                padding: '2px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0, fontSize: '11px', paddingTop: '1px' }}>
                  {log.ts ? new Date(log.ts).toLocaleTimeString('ko-KR') : ''}
                </span>
                <span style={{ color: '#38bdf8', flexShrink: 0, fontSize: '11px', paddingTop: '1px' }}>
                  [{log.source}]
                </span>
                <span style={{ color: 'rgba(255,255,255,0.75)', flex: 1, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                  {log.text}
                </span>
              </div>
            ))
          )}
          <div ref={monitorLogsEndRef} />
        </div>
      </div>

    </div>
  );
}
