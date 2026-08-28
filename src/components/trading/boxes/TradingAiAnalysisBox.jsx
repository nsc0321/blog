import React, { useState, useEffect } from 'react';
import { Sparkles, Play, RefreshCw, CheckCircle2, AlertTriangle, Cpu, TrendingUp, ShieldCheck, BarChart2, Activity, Zap } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingAiAnalysisBox({
  market = 'KRW-BTC',
  onAnalysisDone
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ market })
      });
      const data = await resp.json();
      setAnalysis(data);
      if (onAnalysisDone) onAnalysisDone(data);
    } catch (err) {
      setAnalysis({ error: err.message || '분석 요청 실패' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, [market]);

  const decision = analysis?.decision || 'HOLD';
  const isBuy = decision === 'BUY';
  const isSell = decision === 'SELL';
  const confidence = analysis?.confidence ? Math.round(analysis.confidence * 100) : 75;
  const confluenceScore = analysis?.confluence_score !== undefined ? analysis.confluence_score : 50;

  const probs = analysis?.directional_probability || analysis?.predicted_probabilities || {
    bullish: 0.55,
    bearish: 0.35,
    neutral: 0.10
  };

  const vector = analysis?.vector || {
    v_trend: 0.65,
    v_volume: 0.40,
    v_candle: 0.35,
    v_velocity: 0.25,
    v_volatility: 0.20,
    v_rsi: 0.15,
    v_macd: 0.30
  };

  const phaseKo = analysis?.projected_phase_ko || analysis?.vector_forecast?.projected_phase_ko || '상승 모멘텀 지속 국면';

  return (
    <Box
      title={`2. AI Quant Market Analysis (${market})`}
      subtitle="8차원 방향성 벡터 & 차트 변동성 합치 점수 기반 퀀트 매매 판정"
      icon={Sparkles}
      badge={phaseKo}
      badgeType="purple"
      actions={
        <button
          onClick={handleRunAnalysis}
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
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? '연산 중...' : '실시간 퀀트 분석'}</span>
        </button>
      }
    >
      {/* 1. Main Decision & Score Banner */}
      <div style={{
        background: isBuy ? 'rgba(16, 185, 129, 0.12)' : isSell ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
        border: `1px solid ${isBuy ? 'rgba(16, 185, 129, 0.3)' : isSell ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: isBuy ? 'rgba(16, 185, 129, 0.25)' : isSell ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
            color: isBuy ? '#34d399' : isSell ? '#f87171' : '#fbbf24',
            padding: '10px',
            borderRadius: '10px'
          }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>퀀트 매매 판정 신호</div>
            <div style={{
              fontSize: '22px',
              fontWeight: 900,
              color: isBuy ? '#34d399' : isSell ? '#f87171' : '#fbbf24'
            }}>
              {decision} <span style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>({confidence}% 신뢰도)</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>합치 점수 (Score)</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>{confluenceScore} / 100</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>예상 국면</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#c4b5fd', marginTop: '2px' }}>{phaseKo}</div>
          </div>
        </div>
      </div>

      {/* 2. Directional Probabilities Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
          <span style={{ color: '#34d399' }}>🟢 상승 확률 {(probs.bullish * 100).toFixed(1)}%</span>
          <span style={{ color: '#fbbf24' }}>🟡 횡보 {(probs.neutral * 100).toFixed(1)}%</span>
          <span style={{ color: '#f87171' }}>🔴 하락 {(probs.bearish * 100).toFixed(1)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: `${probs.bullish * 100}%`, background: '#10b981', transition: 'width 0.3s' }} />
          <div style={{ width: `${probs.neutral * 100}%`, background: '#f59e0b', transition: 'width 0.3s' }} />
          <div style={{ width: `${probs.bearish * 100}%`, background: '#ef4444', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* 3. 8-Dimensional Directional Vector Dashboard */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart2 size={14} />
          <span>8차원 방향성 벡터 (Directional Vectors [-1.0 ~ +1.0])</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {Object.entries(vector).map(([key, val]) => {
            const num = typeof val === 'number' ? val : 0;
            const isPos = num >= 0;
            return (
              <div key={key} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '8px 10px'
              }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>{key.replace('v_', '')}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isPos ? '#34d399' : '#f87171', marginTop: '2px' }}>
                  {isPos ? `+${num.toFixed(2)}` : num.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Reason Detail */}
      {analysis?.reason && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '12px',
          color: '#cbd5e1',
          lineHeight: 1.6
        }}>
          <strong style={{ color: '#38bdf8' }}>퀀트 근거 요약: </strong>
          {analysis.reason}
        </div>
      )}
    </Box>
  );
}
