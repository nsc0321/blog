import React, { useState } from 'react';
import { ShoppingCart, DollarSign, CheckCircle2, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingOrderBox({
  market = 'BTC_KRW',
  onOrderComplete
}) {
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const handleOrder = async () => {
    if (!window.confirm(`${market} ${side === 'BUY' ? '매수' : '매도'} 주문(₩${Number(amount).toLocaleString()})을 집행하시겠습니까?`)) {
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          market,
          side: side.toLowerCase(),
          amount: parseFloat(amount)
        })
      });
      const data = await resp.json();
      setFeedback({
        ok: resp.ok,
        message: data.message || (resp.ok ? '주문이 성공적으로 체결되었습니다.' : data.detail || '주문 실패')
      });
      if (onOrderComplete) onOrderComplete();
    } catch (err) {
      setFeedback({ ok: false, message: err.message || '주문 통신 실패' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      title={`2. Order Execution Box (${market})`}
      subtitle="수동/자동 분할 매수 및 매도 즉시 주문 집행 콘솔"
      icon={ShoppingCart}
      badge="Order Engine"
      badgeType="info"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setSide('BUY')}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: `1px solid ${side === 'BUY' ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
              background: side === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: side === 'BUY' ? '#34d399' : '#94a3b8',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🟢 매수 (BUY)
          </button>

          <button
            type="button"
            onClick={() => setSide('SELL')}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: `1px solid ${side === 'SELL' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
              background: side === 'SELL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: side === 'SELL' ? '#f87171' : '#94a3b8',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔴 매도 (SELL)
          </button>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            주문 금액 (KRW):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {['10000', '50000', '100000'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                ₩{Number(preset) / 10000}만
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOrder}
          disabled={loading || !amount}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: side === 'BUY' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
          <span>{side === 'BUY' ? '매수 주문 집행하기' : '매도 주문 집행하기'}</span>
        </button>

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
  );
}
