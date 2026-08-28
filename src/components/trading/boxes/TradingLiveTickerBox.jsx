import React from 'react';
import { Activity, RefreshCw, BarChart2, Zap } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';

export default function TradingLiveTickerBox({
  market = 'BTC_KRW',
  tickerData = {},
  indicators = {},
  onRefresh,
  loading = false
}) {
  const rsi = indicators.rsi || 52.4;
  const macd = indicators.macd || '0.12 (Bullish)';
  const bb = indicators.bollinger || 'Upper: ₩145M | Lower: ₩141M';

  return (
    <Box
      title={`Live Ticker & Indicators (${market})`}
      subtitle="실시간 빗썸 호가 및 기술적 보조지표 복합 연산"
      icon={Activity}
      badge="Live Ticker"
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
          <span>새로고침</span>
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <SubBoxCard
          title="RSI (상대강도지수)"
          description={rsi > 70 ? '과매수 구간 (조정 가능성)' : rsi < 30 ? '과매도 구간 (반등 가능성)' : '중립 모멘텀 구간'}
          icon={BarChart2}
          badge={`RSI: ${rsi}`}
          badgeType={rsi > 70 ? 'warning' : rsi < 30 ? 'info' : 'success'}
        />

        <SubBoxCard
          title="MACD 신호"
          description="단기 및 장기 이동평균 수렴/확산"
          icon={Zap}
          badge={String(macd)}
          badgeType="purple"
        />
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '12px',
        color: '#cbd5e1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>볼린저 밴드 (BB 20, 2):</span>
        <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{bb}</span>
      </div>
    </Box>
  );
}
