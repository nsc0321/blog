import React, { useState } from 'react';
import { TrendingUp, Play, Sparkles, RefreshCw, ShoppingCart, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, Activity, DollarSign } from 'lucide-react';
import { Box, SubBoxCard } from '../common/Box';
import { getApiBase } from '../../config';

export default function CallTradingApiBox({
  tradingStatus,
  targetMarket = 'BTC_KRW',
  onRefresh,
  loading = false
}) {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [orderAction, setOrderAction] = useState('BUY');
  const [orderAmount, setOrderAmount] = useState('10000');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  });

  const handleRunAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/analyze`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ market: targetMarket })
      });
      const data = await resp.json();
      setAnalysisResult(data);
    } catch (err) {
      setAnalysisResult({ error: err.message || '분석 호출 실패' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleExecuteOrder = async () => {
    if (!window.confirm(`${targetMarket} ${orderAction === 'BUY' ? '매수' : '매도'} 주문(${orderAmount} KRW)을 집행하시겠습니까?`)) {
      return;
    }
    setOrderLoading(true);
    setOrderFeedback(null);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          market: targetMarket,
          side: orderAction.toLowerCase(),
          amount: parseFloat(orderAmount)
        })
      });
      const data = await resp.json();
      setOrderFeedback({
        ok: resp.ok,
        message: data.message || (resp.ok ? '주문이 성공적으로 접수되었습니다.' : data.detail || '주문 실패')
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setOrderFeedback({ ok: false, message: err.message || '주문 통신 오류' });
    } finally {
      setOrderLoading(false);
    }
  };

  const currentPrice = tradingStatus?.current_price || tradingStatus?.ticker?.closing_price || 0;
  const changeRate = tradingStatus?.change_rate || tradingStatus?.ticker?.fluctate_rate_24H || 0;
  const isPositive = parseFloat(changeRate) >= 0;

  return (
    <Box
      title="Call Trading API Box"
      subtitle="실시간 빗썸 시세 연산, LLM 시장 분석 및 퀀트 주문 집행"
      icon={TrendingUp}
      badge="Trading API"
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
          <span>시세 갱신</span>
        </button>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>대상 마켓: <strong>{targetMarket}</strong></span>
          <span>주문 엔드포인트: /api/trading/order</span>
        </div>
      }
    >
      {/* Real-time Ticker Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <SubBoxCard
          title="현재 실시간 체결가"
          icon={DollarSign}
          badge={isPositive ? `+${changeRate}%` : `${changeRate}%`}
          badgeType={isPositive ? 'success' : 'warning'}
        >
          <div style={{ fontSize: '20px', fontWeight: 800, color: isPositive ? '#34d399' : '#f87171' }}>
            ₩ {Number(currentPrice).toLocaleString()}
          </div>
        </SubBoxCard>

        <SubBoxCard
          title="AI LLM 분석 트리거"
          description="실시간 보조지표 기반 포지션 판단"
          icon={Sparkles}
        >
          <button
            onClick={handleRunAnalysis}
            disabled={analysisLoading}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: analysisLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {analysisLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>LLM 분석 즉시 실행</span>
          </button>
        </SubBoxCard>
      </div>

      {/* Analysis Output Box */}
      {analysisResult && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '18px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 700, color: '#c4b5fd', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            <span>AI 시장 분석 결과 요약:</span>
          </div>
          <div style={{ color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {analysisResult.decision ? (
              <div>
                <strong>추천 포지션:</strong> <span style={{ color: '#38bdf8', fontWeight: 800 }}>{analysisResult.decision}</span><br />
                <strong>사유:</strong> {analysisResult.reason || '보조지표 복합 연산 기준 적합'}
              </div>
            ) : (
              JSON.stringify(analysisResult, null, 2)
            )}
          </div>
        </div>
      )}

      {/* Manual Order Calling Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '14px 16px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
          주문 API 직접 집행 (Order API)
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={orderAction}
            onChange={(e) => setOrderAction(e.target.value)}
            style={{
              background: orderAction === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${orderAction === 'BUY' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: orderAction === 'BUY' ? '#34d399' : '#f87171',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none'
            }}
          >
            <option value="BUY" style={{ background: '#121225' }}>🟢 매수 (BUY)</option>
            <option value="SELL" style={{ background: '#121225' }}>🔴 매도 (SELL)</option>
          </select>

          <input
            type="number"
            value={orderAmount}
            onChange={(e) => setOrderAmount(e.target.value)}
            placeholder="주문 금액 (KRW)"
            style={{
              flex: '1',
              minWidth: '160px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <button
            onClick={handleExecuteOrder}
            disabled={orderLoading || !orderAmount}
            style={{
              background: orderAction === 'BUY' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: orderLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {orderLoading ? <RefreshCw size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
            <span>주문 전송</span>
          </button>
        </div>

        {orderFeedback && (
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            color: orderFeedback.ok ? '#34d399' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {orderFeedback.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span>{orderFeedback.message}</span>
          </div>
        )}
      </div>
    </Box>
  );
}
