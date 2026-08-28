import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Cpu, CheckCircle2, AlertTriangle, Clock, Calendar, Zap, Save, Layers, Sparkles, Activity } from 'lucide-react';
import { Box } from '../../common/Box';
import BoxGuard from '../../common/BoxGuard';
import { getApiBase } from '../../../config';

export default function MabiBatchControlBox() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [maxPages, setMaxPages] = useState(1);
  const [lastRunAt, setLastRunAt] = useState(null);
  const [nextRunAt, setNextRunAt] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totals, setTotals] = useState(null);
  const [lastLog, setLastLog] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const INTERVAL_PRESETS = [
    { label: '15분', value: 15 },
    { label: '30분', value: 30 },
    { label: '1시간', value: 60 },
    { label: '2시간', value: 120 },
    { label: '6시간', value: 360 },
    { label: '12시간', value: 720 },
    { label: '24시간', value: 1440 },
  ];

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/mabinogi/batch/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setIsEnabled(data.is_enabled ?? true);
        setIntervalMinutes(data.interval_minutes ?? 60);
        setMaxPages(data.max_pages ?? 1);
        setLastRunAt(data.last_run_at);
        setNextRunAt(data.next_run_at);
        setIsRunning(data.is_running ?? false);
        setTotals(data.totals);
        setLastLog(data.last_log);
      }
    } catch (err) {
      console.log('Fetch batch config error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const resp = await fetch(`${API_BASE}/api/mabinogi/batch/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          is_enabled: isEnabled,
          interval_minutes: parseInt(intervalMinutes, 10) || 60,
          max_pages: parseInt(maxPages, 10) || 1
        })
      });
      const data = await resp.json();
      if (resp.ok) {
        setFeedback({ ok: true, message: '배치 시간 및 주기 설정이 성공적으로 저장되었습니다.' });
        if (data.next_run_at) setNextRunAt(data.next_run_at);
      } else {
        setFeedback({ ok: false, message: data.detail || '설정 저장에 실패했습니다.' });
      }
    } catch (err) {
      setFeedback({ ok: false, message: err.message || '통신 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBatch = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const resp = await fetch(`${API_BASE}/api/mabinogi/batch/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ max_pages: parseInt(maxPages, 10) || 1 })
      });
      const data = await resp.json();
      setFeedback({
        ok: resp.ok,
        message: data.message || (resp.ok ? '백그라운드 수집 배치가 즉시 시작되었습니다.' : '배치 호출 실패')
      });
      setIsRunning(true);
      setTimeout(fetchConfig, 2000);
    } catch (err) {
      setFeedback({ ok: false, message: err.message || '통신 실패' });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '기록 없음';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <BoxGuard minRole="admin" boxTitle="스마트 자동 수집 배치 제어">
      <Box
        title="Smart Batch Collector Box (아카이브 수집 제어)"
        subtitle="넥슨 경매장 & 아이템 빅데이터 자동 스크랩 배치 주기, 시간 및 세부 옵션 제어 콘솔"
        icon={Cpu}
        badge="Admin Batch"
        badgeType="purple"
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={fetchConfig}
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

            <button
              onClick={handleTriggerBatch}
              disabled={loading || isRunning}
              style={{
                background: isRunning ? 'rgba(245, 158, 11, 0.2)' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                border: isRunning ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
                color: isRunning ? '#fbbf24' : '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: (loading || isRunning) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isRunning ? <Activity size={13} className="animate-spin" /> : <Play size={13} />}
              <span>{isRunning ? '배치 실행 중...' : '배치 즉시 실행'}</span>
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Status & Schedule Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            {/* Run Status */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#38bdf8" />
                <span>배치 상태</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: isRunning ? '#fbbf24' : (isEnabled ? '#34d399' : '#94a3b8'), marginTop: '4px' }}>
                {isRunning ? '⚡ 수집 진행 중' : (isEnabled ? '● 자동 수집 활성' : '○ 일시 정지')}
              </div>
            </div>

            {/* Last Run Time */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#c4b5fd" />
                <span>최근 실행 시간</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                {formatDateTime(lastRunAt)}
              </div>
            </div>

            {/* Next Run Time */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#34d399" />
                <span>다음 예정 시간</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isEnabled ? '#34d399' : '#94a3b8', marginTop: '4px' }}>
                {isEnabled ? formatDateTime(nextRunAt) : '스케줄 중지됨'}
              </div>
            </div>
          </div>

          {/* Batch Configuration Form Section */}
          <div style={{
            background: 'rgba(18, 18, 37, 0.6)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#c4b5fd" />
              <span>배치 주기 및 실행 세부 옵션</span>
            </h4>

            {/* 1. Auto Batch Active Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>자동 주기 수집 활성화</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  설정된 간격마다 백그라운드에서 넥슨 경매장 데이터를 자동으로 스크랩합니다.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${isEnabled ? '#10b981' : '#64748b'}`,
                  background: isEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isEnabled ? '#34d399' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isEnabled ? 'ON (활성화)' : 'OFF (일시정지)'}
              </button>
            </div>

            {/* 2. Interval Selection (간격 설정) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                  배치 실행 간격 (Batch Interval):
                </label>
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
                  현재 {intervalMinutes >= 60 ? `${(intervalMinutes / 60).toFixed(intervalMinutes % 60 === 0 ? 0 : 1)}시간 (${intervalMinutes}분)` : `${intervalMinutes}분`} 주기
                </span>
              </div>

              {/* Interval Presets */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {INTERVAL_PRESETS.map(preset => {
                  const isActive = intervalMinutes === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setIntervalMinutes(preset.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${isActive ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
                        background: isActive ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? '#c4b5fd' : '#cbd5e1',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Interval Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>직접 입력:</span>
                <input
                  type="number"
                  min="5"
                  max="10080"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Math.max(5, parseInt(e.target.value, 10) || 5))}
                  style={{
                    width: '100px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>분 마다 실행</span>
              </div>
            </div>

            {/* 3. Max Pages Volume (1회 수집 최대 페이지) */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                  1회 수집 분량 (Max Pages):
                </label>
                <span style={{ fontSize: '12px', color: '#c4b5fd', fontWeight: 700 }}>
                  {maxPages} 페이지 (카테고리당 최대 약 {maxPages * 500}건 스크랩)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map(p => {
                  const isActive = maxPages === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMaxPages(p)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
                        background: isActive ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? '#22d3ee' : '#cbd5e1',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {p}페이지 ({p * 500}건)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>배치 설정 저장</span>
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div style={{
              padding: '10px 14px',
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

          {/* Batch Totals & Last Execution Log Summary */}
          {totals && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="#8b5cf6" />
                <span>배치 누적 수집 통계</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  총 실행: <strong style={{ color: '#f8fafc' }}>{totals.total_batch_runs || 0}회</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  신규 아이템: <strong style={{ color: '#34d399' }}>{Number(totals.total_new_items || 0).toLocaleString()}건</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  갱신 아이템: <strong style={{ color: '#38bdf8' }}>{Number(totals.total_updated_items || 0).toLocaleString()}건</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  신규 인챈트: <strong style={{ color: '#c084fc' }}>{Number(totals.total_new_enchants || 0).toLocaleString()}건</strong>
                </div>
              </div>

              {lastLog && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.06)', fontSize: '11px', color: '#94a3b8' }}>
                  마지막 실행 결과: <span style={{ color: lastLog.status === 'completed' ? '#34d399' : '#f87171', fontWeight: 700 }}>{lastLog.status}</span> ({lastLog.duration_seconds || 0}초 소요, 처리 {lastLog.total_items_processed || 0}건)
                </div>
              )}
            </div>
          )}

        </div>
      </Box>
    </BoxGuard>
  );
}
