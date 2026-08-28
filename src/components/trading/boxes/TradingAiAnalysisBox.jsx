import React, { useState } from 'react';
import { Sparkles, Play, RefreshCw, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingAiAnalysisBox({
  market = 'BTC_KRW',
  onAnalysisDone
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const handleRunAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
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

  return (
    <Box
      title={`AI LLM Market Analysis (${market})`}
      subtitle="보조지표와 오더북 데이터를 종합 분석하여 최적 포지션 판단"
      icon={Sparkles}
      badge="LLM Quant"
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
          {loading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
          <span>분석 실행</span>
        </button>
      }
    >
      {!analysis && !loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          [분석 실행] 버튼을 눌러 실시간 LLM 퀀트 분석 리포트를 생성하세요.
        </div>
      ) : loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#a78bfa', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RefreshCw size={16} className="animate-spin" />
          <span>LLM이 보조지표 및 시장 호가를 심층 분석 중입니다...</span>
        </div>
      ) : (
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '10px',
          padding: '14px',
          fontSize: '13px',
          lineHeight: 1.6
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>추천 포지션 판정:</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '8px',
              background: analysis.decision === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : analysis.decision === 'SELL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: analysis.decision === 'BUY' ? '#34d399' : analysis.decision === 'SELL' ? '#f87171' : '#fbbf24'
            }}>
              {analysis.decision || 'HOLD / 관망'}
            </span>
          </div>

          <div style={{ color: '#cbd5e1', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {analysis.reason || JSON.stringify(analysis, null, 2)}
          </div>
        </div>
      )}
    </Box>
  );
}
