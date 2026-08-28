import React, { useState } from 'react';
import { Play, Pause, RefreshCw, Cpu, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Box } from '../../common/Box';
import BoxGuard from '../../common/BoxGuard';
import { getApiBase } from '../../../config';

export default function MabiBatchControlBox() {
  const [isRunning, setIsRunning] = useState(false);
  const [maxPages, setMaxPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const handleTriggerBatch = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const resp = await fetch(`${API_BASE}/api/mabinogi/batch/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ max_pages: parseInt(maxPages, 10) })
      });
      const data = await resp.json();
      setFeedback({
        ok: resp.ok,
        message: data.message || (resp.ok ? '배치 수집 작업이 성공적으로 시작되었습니다.' : '배치 호출 실패')
      });
      setIsRunning(true);
    } catch (err) {
      setFeedback({ ok: false, message: err.message || '통신 실패' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BoxGuard minRole="admin" boxTitle="스마트 자동 수집 배치 제어">
      <Box
        title="4. Smart Batch Collector Box (아카이브 수집 제어)"
        subtitle="넥슨 경매장 & 아이템 빅데이터 자동 스크랩 배치 제어 콘솔 (관리자 전용)"
        icon={Cpu}
        badge="Admin Batch"
        badgeType="purple"
        actions={
          <button
            onClick={handleTriggerBatch}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
            <span>배치 즉시 실행</span>
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
              1회 수집 최대 페이지 수 (Max Pages):
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxPages}
              onChange={(e) => setMaxPages(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#38bdf8',
                fontSize: '13px',
                fontWeight: 700,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {feedback && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: feedback.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${feedback.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: feedback.ok ? '#34d399' : '#f87171',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {feedback.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      </Box>
    </BoxGuard>
  );
}
