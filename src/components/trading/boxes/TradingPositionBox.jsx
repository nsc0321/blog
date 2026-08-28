import React, { useState, useEffect } from 'react';
import { PieChart, Wallet, DollarSign, RefreshCw, ArrowUpRight, ShieldCheck, AlertCircle, TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingPositionBox({ isDryRun: parentDryRun }) {
  const [account, setAccount] = useState({
    krw_balance: 0,
    total_eval: 0,
    crypto_eval_total: 0,
    total_pnl_krw: 0,
    total_pnl_pct: 0,
    positions: [],
    holdings: [],
    dry_run: parentDryRun !== undefined ? parentDryRun : false,
    mode: 'LIVE',
    is_live_connected: true
  });
  const [loading, setLoading] = useState(false);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/account`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setAccount({
          krw_balance: data.krw_balance || 0,
          total_eval: data.total_eval || 0,
          crypto_eval_total: data.crypto_eval_total || 0,
          total_pnl_krw: data.total_pnl_krw || 0,
          total_pnl_pct: data.total_pnl_pct || 0,
          positions: data.positions || [],
          holdings: data.holdings || [],
          dry_run: data.dry_run === true,
          mode: data.mode || (data.dry_run ? 'DRY_RUN' : 'LIVE'),
          is_live_connected: data.is_live_connected !== false
        });
      }
    } catch (err) {
      console.log('Fetch trading account note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
    const timer = setInterval(fetchAccount, 10000);
    return () => clearInterval(timer);
  }, []);

  const isDryRun = account.dry_run;
  const isPnlPositive = account.total_pnl_krw >= 0;

  return (
    <Box
      title="3. Positions & Assets Box (보유 자산 & 포지션 잔고)"
      subtitle="원화(KRW) 주문 가능 잔고, 보유 코인 수량 및 총 평가금액"
      icon={PieChart}
      badge={isDryRun ? '🛡️ 모의투자 자산 (Paper)' : '⚡ 빗썸 실전 자산 (Live)'}
      badgeType={isDryRun ? 'warning' : 'success'}
      actions={
        <button
          onClick={fetchAccount}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            padding: '6px 12px',
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
      {/* Top Assets Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        <SubBoxCard
          title="총 평가 순자산"
          icon={Wallet}
          badge={isDryRun ? '모의 자산' : '실전 자산'}
          badgeType={isDryRun ? 'warning' : 'success'}
        >
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#f8fafc' }}>
            ₩ {Number(Math.round(account.total_eval || 0)).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: isPnlPositive ? '#34d399' : '#f87171', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isPnlPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>손익: {isPnlPositive ? `+₩${Number(Math.round(account.total_pnl_krw)).toLocaleString()}` : `-₩${Number(Math.round(Math.abs(account.total_pnl_krw))).toLocaleString()}`} ({account.total_pnl_pct.toFixed(2)}%)</span>
          </div>
        </SubBoxCard>

        <SubBoxCard
          title="주문 가능 원화 (KRW)"
          icon={DollarSign}
          badge="Cash"
          badgeType="info"
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
            ₩ {Number(Math.round(account.krw_balance || 0)).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            실제 잔고: {Number(account.krw_balance || 0).toFixed(2)} KRW
          </div>
        </SubBoxCard>

        <SubBoxCard
          title="보유 암호화폐 평가액"
          icon={Coins}
          badge="Crypto"
          badgeType="purple"
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#c4b5fd' }}>
            ₩ {Number(Math.round(account.crypto_eval_total || 0)).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            {account.positions.length}개 종목 포지션 보유 중
          </div>
        </SubBoxCard>
      </div>

      {/* Positions Breakdown Table */}
      {account.positions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>종목 (Symbol)</th>
                <th style={{ padding: '8px 10px' }}>보유 수량</th>
                <th style={{ padding: '8px 10px' }}>매수 평균가</th>
                <th style={{ padding: '8px 10px' }}>현재가</th>
                <th style={{ padding: '8px 10px' }}>평가 금액 (KRW)</th>
                <th style={{ padding: '8px 10px' }}>손익률 (%)</th>
                <th style={{ padding: '8px 10px' }}>비중 (%)</th>
              </tr>
            </thead>
            <tbody>
              {account.positions.map((pos, idx) => {
                const isPosPnl = (pos.pnl_krw || 0) >= 0;
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#f8fafc' }}>
                      <span style={{ color: '#38bdf8' }}>{pos.symbol || pos.market}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>({pos.korean_name || pos.symbol})</span>
                    </td>
                    <td style={{ padding: '10px', color: '#e2e8f0', fontFamily: 'monospace' }}>
                      {pos.volume}
                    </td>
                    <td style={{ padding: '10px', color: '#cbd5e1' }}>
                      ₩{Number(pos.avg_price || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 700 }}>
                      ₩{Number(pos.current_price || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px', color: '#f8fafc', fontWeight: 800 }}>
                      ₩{Number(Math.round(pos.eval_krw || 0)).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px', color: isPosPnl ? '#34d399' : '#f87171', fontWeight: 700 }}>
                      {isPosPnl ? `+${(pos.pnl_pct || 0).toFixed(2)}%` : `${(pos.pnl_pct || 0).toFixed(2)}%`}
                    </td>
                    <td style={{ padding: '10px', color: '#c4b5fd' }}>
                      {(pos.weight_pct || 0).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '13px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px'
        }}>
          현재 보유 중인 코인 포지션이 없습니다. (100% 현금 보유 중)
        </div>
      )}
    </Box>
  );
}
