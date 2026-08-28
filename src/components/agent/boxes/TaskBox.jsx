import React, { useState } from 'react';
import { PlayCircle, PauseCircle, RefreshCw, Trash2, CheckCircle2, Clock, Activity, Zap } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';

export default function TaskBox({
  tasks = [],
  onRefresh,
  loading = false
}) {
  const sampleTasks = tasks.length > 0 ? tasks : [
    { id: 'task-101', name: 'Bithumb Quant Realtime Market Scanner', status: 'RUNNING', started_at: '2026-08-28 08:30:00', duration: '45m' },
    { id: 'task-102', name: 'Mabinogi Auction Floor Price Watcher', status: 'IDLE', started_at: '2026-08-28 07:00:00', duration: '2h 15m' },
    { id: 'task-103', name: 'Daily Skill Verification & Health Check', status: 'COMPLETED', started_at: '2026-08-28 06:00:00', duration: '12s' }
  ];

  return (
    <Box
      title="Task Box (백그라운드 태스크)"
      subtitle="비동기 실행 프로세스, 스케줄러 및 실시간 데몬 제어"
      icon={Zap}
      badge="Daemon Monitor"
      badgeType="info"
      actions={
        <button
          onClick={onRefresh}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sampleTasks.map((t) => {
          const isRunning = t.status === 'RUNNING';
          return (
            <div
              key={t.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isRunning ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isRunning ? '#22d3ee' : t.status === 'COMPLETED' ? '#34d399' : '#94a3b8'
                }}></span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>ID: {t.id}</span>
                    <span>시작: {t.started_at}</span>
                    <span>경과: {t.duration}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: isRunning ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: isRunning ? '#22d3ee' : '#94a3b8'
                }}>
                  {t.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}
