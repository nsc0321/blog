import React from 'react';
import { PieChart, Wallet, DollarSign, RefreshCw, ArrowUpRight } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';

export default function TradingPositionBox({
  balance = { krw: 5000000, btc: 0.045, evalTotal: 11500000 },
  onRefresh,
  loading = false
}) {
  return (
    <Box
      title="3. Positions & Assets (보유 자산 & 포지션)"
      subtitle="원화(KRW) 잔고, 보유 코인 및 총 평가금액"
      icon={PieChart}
      badge="Asset Wallet"
      badgeType="success"
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <SubBoxCard
          title="총 평가 자산"
          icon={Wallet}
          badge="KRW Total"
          badgeType="purple"
        >
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
            ₩ {Number(balance.evalTotal || 0).toLocaleString()}
          </div>
        </SubBoxCard>

        <SubBoxCard
          title="주문 가능 원화 (KRW)"
          icon={DollarSign}
          badge="Cash"
          badgeType="info"
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
            ₩ {Number(balance.krw || 0).toLocaleString()}
          </div>
        </SubBoxCard>

        <SubBoxCard
          title="보유 BTC 수량"
          icon={PieChart}
          badge="Holdings"
          badgeType="success"
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
            {balance.btc || 0} BTC
          </div>
        </SubBoxCard>
      </div>
    </Box>
  );
}
