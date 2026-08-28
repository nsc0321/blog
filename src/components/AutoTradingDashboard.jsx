import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Layers } from 'lucide-react';
import TradingTabBox from './trading/boxes/TradingTabBox';
import TradingStatusBox from './trading/boxes/TradingStatusBox';
import TradingAiAnalysisBox from './trading/boxes/TradingAiAnalysisBox';
import TradingPositionBox from './trading/boxes/TradingPositionBox';
import TradingSettingBox from './trading/TradingSettingBox';
import TradingLogBox from './trading/boxes/TradingLogBox';
import { getApiBase } from '../config';

export default function AutoTradingDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'positions' | 'settings' | 'logs'
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
        if (data.target_markets && data.target_markets.length > 0 && !market) {
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
    const timer = setInterval(fetchStatus, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentPrice = tradingStatus?.current_price || tradingStatus?.ticker?.closing_price || 111455000;
  const changeRate = tradingStatus?.change_rate || tradingStatus?.ticker?.fluctate_rate_24H || '0.56';
  const isDryRun = tradingStatus?.is_dry_run !== undefined 
    ? tradingStatus.is_dry_run 
    : (tradingStatus?.dry_run !== undefined ? tradingStatus.dry_run : false);

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
        
        {/* 1. AI Market Analysis View */}
        {activeTab === 'overview' && (
          <TradingAiAnalysisBox
            market={market}
            onAnalysisDone={(res) => {
              if (res.decision) setLastSignal(res.decision);
            }}
          />
        )}

        {/* 2. Positions & Assets View */}
        {activeTab === 'positions' && (
          <TradingPositionBox
            isDryRun={isDryRun}
            selectedMarket={market}
            onSelectMarket={(newM) => {
              setMarket(newM);
              setActiveTab('overview');
            }}
            onRefresh={fetchStatus}
            loading={loading}
          />
        )}

        {/* 3. Trading Settings View */}
        {activeTab === 'settings' && (
          <TradingSettingBox
            onSaveSettings={() => fetchStatus()}
          />
        )}

        {/* 4. Trading Log View */}
        {activeTab === 'logs' && (
          <TradingLogBox />
        )}

      </div>
    </div>
  );
}
