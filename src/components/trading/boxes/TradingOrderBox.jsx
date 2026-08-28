import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, CheckCircle2, AlertTriangle, RefreshCw, Zap, Shield, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingOrderBox({
  market = 'KRW-BTC',
  isDryRun: propDryRun = false,
  onMarketChange,
  onModeChange,
  onOrderComplete
}) {
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [togglingMode, setTogglingMode] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [localDryRun, setLocalDryRun] = useState(propDryRun);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  useEffect(() => {
    setLocalDryRun(propDryRun);
  }, [propDryRun]);

  const handleToggleMode = async (newMode) => {
    setTogglingMode(true);
    setFeedback(null);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ dry_run: newMode })
      });
      if (resp.ok) {
        setLocalDryRun(newMode);
        setFeedback({
          ok: true,
          message: newMode ? '모의투자(Safe) 모드로 전환되었습니다.' : '⚡ 빗썸 실전 거래(Live) 모드로 전환되었습니다!'
        });
        if (onModeChange) onModeChange(newMode);
        if (onOrderComplete) onOrderComplete();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      setFeedback({ ok: false, message: '모드 전환 실패: ' + err.message });
    } finally {
      setTogglingMode(false);
    }
  };

  const handleOrder = async () => {
    const modeText = localDryRun ? '가상 모의' : '⚡ 빗썸 실전';
    if (!window.confirm(`[${modeText} 매매] ${market} ${side === 'BUY' ? '매수' : '매도'} 주문(₩${Number(amount).toLocaleString()})을 집행하시겠습니까?`)) {
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
        message: data.message || (resp.ok ? `${modeText} 주문이 성공적으로 체결되었습니다.` : data.detail || '주문 실패')
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
      subtitle={localDryRun ? "가상 잔고를 이용한 안전한 모의 주문 집행" : "빗썸 실제 계좌 연동 즉시 주문 집행 콘솔"}
      icon={ShoppingCart}
      badge={localDryRun ? '🛡️ 모의투자 모드 (Dry-Run)' : '⚡ 실전 거래 모드 (Live Execution)'}
      badgeType={localDryRun ? 'warning' : 'success'}
      actions={
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleToggleMode(!localDryRun)}
            disabled={togglingMode}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${!localDryRun ? '#10b981' : '#fbbf24'}`,
              background: !localDryRun ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: !localDryRun ? '#34d399' : '#fbbf24',
              fontWeight: 800,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ArrowRightLeft size={12} />
            <span>{!localDryRun ? '⚡ 실전 가동중 (모의 전환)' : '🛡️ 모의 가동중 (실전 전환)'}</span>
          </button>
        </div>
      }
    >
      {/* Mode Warning Banner */}
      {!localDryRun ? (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#34d399',
          fontSize: '12px'
        }}>
          <Zap size={16} />
          <span><strong>⚡ 실전 거래 모드 가동 중:</strong> 주문 실행 시 빗썸 실제 계좌의 원화/암호화폐로 즉시 체결됩니다.</span>
        </div>
      ) : (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#fbbf24',
          fontSize: '12px'
        }}>
          <Shield size={16} />
          <span><strong>🛡️ 모의투자 모드:</strong> 실제 자산 손실 없이 가상 잔고로 안전하게 알고리즘 주문을 시뮬레이션합니다.</span>
        </div>
      )}

      {feedback && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '14px',
          background: feedback.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.ok ? '#34d399' : '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {feedback.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Market Selector & Target Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>주문 대상 종목:</span>
          <select
            value={market}
            onChange={(e) => onMarketChange && onMarketChange(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '13px',
              outline: 'none'
            }}
          >
            <option value="KRW-BTC" style={{ background: '#121225' }}>BTC (비트코인)</option>
            <option value="KRW-ETH" style={{ background: '#121225' }}>ETH (이더리움)</option>
            <option value="KRW-SOL" style={{ background: '#121225' }}>SOL (솔라나)</option>
            <option value="KRW-USDT" style={{ background: '#121225' }}>USDT (테더)</option>
            <option value="KRW-XRP" style={{ background: '#121225' }}>XRP (리플)</option>
            <option value="KRW-DOGE" style={{ background: '#121225' }}>DOGE (도지코인)</option>
            <option value="KRW-ADA" style={{ background: '#121225' }}>ADA (에이다)</option>
            <option value="KRW-AVAX" style={{ background: '#121225' }}>AVAX (아발란체)</option>
          </select>
        </div>

        {/* BUY / SELL Switch */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setSide('BUY')}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: `1px solid ${side === 'BUY' ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
              background: side === 'BUY' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.02)',
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
              border: `1px solid ${side === 'SELL' ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}`,
              background: side === 'SELL' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.02)',
              color: side === 'SELL' ? '#f87171' : '#94a3b8',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔴 매도 (SELL)
          </button>
        </div>

        {/* Order Amount */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            주문 금액 (KRW):
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#38bdf8',
              fontSize: '15px',
              fontWeight: 800,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Quick Amount Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['10000', '50000', '100000', '500000'].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                background: amount === amt ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${amount === amt ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: amount === amt ? '#c4b5fd' : '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {Number(amt) / 10000}만원
            </button>
          ))}
        </div>

        {/* Submit Execution Button */}
        <button
          type="button"
          onClick={handleOrder}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          style={{
            marginTop: '8px',
            padding: '14px',
            borderRadius: '10px',
            background: side === 'BUY'
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: 'none',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: side === 'BUY' ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(239, 68, 68, 0.3)'
          }}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
          <span>{loading ? '주문 처리 중...' : `${side === 'BUY' ? '매수' : '매도'} 즉시 주문 집행 (${market})`}</span>
        </button>
      </div>
    </Box>
  );
}
