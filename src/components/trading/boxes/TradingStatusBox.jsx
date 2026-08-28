import React from 'react';
import { DollarSign, Wallet, Shield, Coins, TrendingUp, TrendingDown } from 'lucide-react';

export default function TradingStatusBox({
  isDryRun = false,
  totalEval = 0,
  krwBalance = 0,
  cryptoEval = 0,
  totalPnlKrw = 0,
  totalPnlPct = 0,
  holdingCount = 0
}) {
  const isPnlPos = totalPnlKrw >= 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {/* 1. Trading Mode */}
      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: `1px solid ${!isDryRun ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: !isDryRun ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          padding: '8px',
          borderRadius: '10px',
          color: !isDryRun ? '#34d399' : '#fbbf24'
        }}>
          <Shield size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>트레이딩 모드</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: !isDryRun ? '#34d399' : '#fbbf24' }}>
            {!isDryRun ? '⚡ 실전투자 (Live)' : '🛡️ 모의투자 (Safe)'}
          </div>
        </div>
      </div>

      {/* 2. Total Net Assets */}
      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', color: '#c4b5fd' }}>
          <Wallet size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>총 자산 (순평가액)</div>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc' }}>
            ₩ {Number(Math.round(totalEval || 0)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 3. KRW Balance */}
      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px', color: '#38bdf8' }}>
          <DollarSign size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>원화 (KRW 잔고)</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
            ₩ {Number(Math.round(krwBalance || 0)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 4. Crypto Valuation */}
      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '8px', borderRadius: '10px', color: '#f472b6' }}>
          <Coins size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
            암호화폐 ({holdingCount > 0 ? `${holdingCount}개 보유` : '평가액'})
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f472b6' }}>
            ₩ {Number(Math.round(cryptoEval || 0)).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
