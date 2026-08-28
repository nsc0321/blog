import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Shield, Activity, Sparkles } from 'lucide-react';

export default function TradingStatusBox({
  currentPrice = 0,
  changeRate = '0',
  isDryRun = true,
  lastSignal = 'HOLD',
  market = 'BTC_KRW'
}) {
  const isPositive = parseFloat(changeRate) >= 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '10px', color: '#22d3ee' }}>
          <DollarSign size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{market} 현재가</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
            ₩ {Number(currentPrice).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          padding: '8px',
          borderRadius: '10px',
          color: isPositive ? '#34d399' : '#f87171'
        }}>
          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>24H 변동률</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: isPositive ? '#34d399' : '#f87171' }}>
            {isPositive ? `+${changeRate}%` : `${changeRate}%`}
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: `1px solid ${isDryRun ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: isDryRun ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          padding: '8px',
          borderRadius: '10px',
          color: isDryRun ? '#fbbf24' : '#34d399'
        }}>
          <Shield size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>트레이딩 모드</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: isDryRun ? '#fbbf24' : '#34d399' }}>
            {isDryRun ? '🛡️ 모의투자 (Safe)' : '⚡ 실전투자 (Live)'}
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', color: '#c4b5fd' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>AI 시장 신호</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#c4b5fd' }}>
            {lastSignal}
          </div>
        </div>
      </div>
    </div>
  );
}
