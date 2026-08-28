import React, { useState, useEffect } from 'react';
import { PieChart, Wallet, DollarSign, RefreshCw, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingPositionBox() {
  const [account, setAccount] = useState({
    krw_balance: 10000000,
    total_eval: 10000000,
    positions: [],
    dry_run: true
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
          total_eval: data.total_eval || data.krw_balance || 0,
          positions: data.accounts || data.positions || [],
          dry_run: data.dry_run !== false
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
  }, []);

  return (
    <Box
      title="4. Positions & Assets Box (보유 자산 & 포지션 잔고)"
      subtitle="원화(KRW) 주문 가능 잔고, 보유 코인 수량 및 총 평가금액"
      icon={PieChart}
      badge={account.dry_run ? '모의 자산' : '실전 자산'}
      badgeType={account.dry_run ? 'warning' : 'success'}
      actions={
        <button
          onClick={fetchAccount}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        <SubBoxCard
          title="총 평가 자산"
          icon={Wallet}
          badge={account.dry_run ? 'Paper Total' : 'Live Total'}
          badgeType="purple"
        >
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
            ₩ {Number(account.total_eval || account.krw_balance || 0).toLocaleString()}
          </div>
        </SubBoxCard>

        <SubBoxCard
          title="주문 가능 원화 (KRW)"
          icon={DollarSign}
          badge="Cash"
          badgeType="info"
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
            ₩ {Number(account.krw_balance || 0).toLocaleString()}
          </div>
        </SubBoxCard>

        <SubBoxCard
          title="보유 포지션 수"
          icon={PieChart}
          badge="Coins"
          badgeType="success"
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
            {account.positions.length} 개 종목
          </div>
        </SubBoxCard>
      </div>

      {/* Positions breakdown table */}
      {account.positions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>화폐 (Currency)</th>
                <th style={{ padding: '8px 10px' }}>보유 수량</th>
                <th style={{ padding: '8px 10px' }}>매수 평균가</th>
                <th style={{ padding: '8px 10px' }}>평가 금액</th>
              </tr>
            </thead>
            <tbody>
              {account.positions.map((pos, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f8fafc' }}>
                    {pos.currency || pos.unit_currency}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                    {Number(pos.balance || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>
                    ₩{Number(pos.avg_buy_price || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#34d399', fontWeight: 700 }}>
                    ₩{Number(pos.eval_amount || (Number(pos.balance || 0) * Number(pos.avg_buy_price || 0))).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '12px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px'
        }}>
          현재 보유 중인 코인 포지션이 없습니다. (100% 현금 보유 중)
        </div>
      )}
    </Box>
  );
}
