import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Layers } from 'lucide-react';
import TradingTabBox from './trading/boxes/TradingTabBox';
import TradingStatusBox from './trading/boxes/TradingStatusBox';
import TradingLiveTickerBox from './trading/boxes/TradingLiveTickerBox';
import TradingAiAnalysisBox from './trading/boxes/TradingAiAnalysisBox';
import TradingOrderBox from './trading/boxes/TradingOrderBox';
import TradingPositionBox from './trading/boxes/TradingPositionBox';
import TradingSettingBox from './trading/TradingSettingBox';
import TradingLogBox from './trading/boxes/TradingLogBox';
import { getApiBase } from '../config';

export default function AutoTradingDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'positions' | 'settings' | 'logs'
  const [market, setMarket] = useState('KRW-BTC');
  const [tradingStatus, setTradingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSignal, setLastSignal] = useState('HOLD');

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
        if (data.analysis?.decision) {
          setLastSignal(data.analysis.decision);
        }
        if (data.target_markets && data.target_markets.length > 0) {
          setMarket(data.target_markets[0]);
        }
      }
    } catch (err) {
      console.log('Trading status fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const currentPrice = tradingStatus?.current_price || tradingStatus?.ticker?.closing_price || 144250000;
  const changeRate = tradingStatus?.change_rate || tradingStatus?.ticker?.fluctate_rate_24H || '1.85';
  const isDryRun = tradingStatus?.dry_run !== undefined ? tradingStatus.dry_run : true;

  return (
    <div className="trading-container-box" style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Real-time Status Header Box */}
      <TradingStatusBox
        currentPrice={currentPrice}
        changeRate={changeRate}
        isDryRun={isDryRun}
        lastSignal={lastSignal}
        market={market}
      />

      {/* Tab Box Switcher */}
      <TradingTabBox
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Active Sub-Box View */}
      <div className="trading-active-box-view">
        
        {/* 1. Live Ticker & AI Analysis View */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <TradingLiveTickerBox
              market={market}
              onRefresh={fetchStatus}
              loading={loading}
            />
            <TradingAiAnalysisBox
              market={market}
              onAnalysisDone={(res) => {
                if (res.decision) setLastSignal(res.decision);
              }}
            />
          </div>
        )}

        {/* 2. Order Execution Box View */}
        {activeTab === 'orders' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <TradingOrderBox
              market={market}
              isDryRun={isDryRun}
              onOrderComplete={fetchStatus}
            />
            <TradingPositionBox
              isDryRun={isDryRun}
              onRefresh={fetchStatus}
              loading={loading}
            />
          </div>
        )}

        {/* 3. Positions & Assets View */}
        {activeTab === 'positions' && (
          <TradingPositionBox
            isDryRun={isDryRun}
            onRefresh={fetchStatus}
            loading={loading}
          />
        )}

        {/* 4. Trading Settings View */}
        {activeTab === 'settings' && (
          <TradingSettingBox
            onSaveSettings={() => fetchStatus()}
          />
        )}

        {/* 5. Trading Log View */}
        {activeTab === 'logs' && (
          <TradingLogBox
            onRefresh={fetchStatus}
            loading={loading}
          />
        )}

      </div>
    </div>
  );
}
