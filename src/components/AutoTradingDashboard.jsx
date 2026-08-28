import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Layers } from 'lucide-react';
import TradingTabBox from './trading/boxes/TradingTabBox';
import TradingStatusBox from './trading/boxes/TradingStatusBox';
import TradingPositionBox from './trading/boxes/TradingPositionBox';
import TradingSettingBox from './trading/TradingSettingBox';
import TradingLogBox from './trading/boxes/TradingLogBox';
import { getApiBase } from '../config';

export default function AutoTradingDashboard() {
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' | 'settings' | 'logs'
  const [tradingStatus, setTradingStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setTradingStatus(data);
      }
    } catch (err) {
      console.log('Trading status fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 10000);
    return () => clearInterval(timer);
  }, []);

  const isDryRun = tradingStatus?.is_dry_run !== undefined 
    ? tradingStatus.is_dry_run 
    : (tradingStatus?.dry_run !== undefined ? tradingStatus.dry_run : false);

  const assets = tradingStatus?.assets || {};
  const totalEval = assets.total_net_assets || assets.total_eval || (isDryRun ? 1000000 : 0);
  const krwBalance = assets.krw_balance || (isDryRun ? 1000000 : 0);
  const cryptoEval = assets.crypto_eval_total || 0;
  const totalPnlKrw = assets.total_pnl_krw || 0;
  const totalPnlPct = assets.total_pnl_pct || 0;
  const holdingCount = assets.held_coins_count || (assets.held_coins_summary ? assets.held_coins_summary.length : 0);

  return (
    <div className="trading-container-box" style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Real-time Status Header Box: 4 Cards (Mode, Total, KRW, Crypto) */}
      <TradingStatusBox
        isDryRun={isDryRun}
        totalEval={totalEval}
        krwBalance={krwBalance}
        cryptoEval={cryptoEval}
        totalPnlKrw={totalPnlKrw}
        totalPnlPct={totalPnlPct}
        holdingCount={holdingCount}
      />

      {/* Tab Box Switcher: 3 Tabs (Positions, Settings, Logs) */}
      <TradingTabBox
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Active Sub-Box View */}
      <div className="trading-active-box-view">
        
        {/* 1. Positions & Assets View */}
        {activeTab === 'positions' && (
          <TradingPositionBox
            isDryRun={isDryRun}
            onRefresh={fetchStatus}
            loading={loading}
          />
        )}

        {/* 2. Trading Settings View */}
        {activeTab === 'settings' && (
          <TradingSettingBox
            onSaveSettings={() => fetchStatus()}
          />
        )}

        {/* 3. Trading Log View */}
        {activeTab === 'logs' && (
          <TradingLogBox />
        )}

      </div>
    </div>
  );
}
