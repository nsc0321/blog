import React, { useState, useEffect } from 'react';
import { Settings, Shield, Sliders, Save, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, DollarSign, Target, Key, Plus, RefreshCw, X, Sparkles, Activity, TrendingUp, Clock, BarChart2 } from 'lucide-react';
import { Box, SubBoxCard } from '../common/Box';
import { getApiBase } from '../../config';

export default function TradingSettingBox({ onSaveSettings }) {
  // 1. Basic Trading Mode
  const [targetMarket, setTargetMarket] = useState('KRW-BTC');
  const [dryRun, setDryRun] = useState(true);
  const [maxOrderAmount, setMaxOrderAmount] = useState(100000);
  const [maxPortfolioRatio, setMaxPortfolioRatio] = useState(0.3);
  const [candleUnit, setCandleUnit] = useState(15);

  // 2. Risk Stop-Loss & Take-Profit Guardrails
  const [stopLossPercent, setStopLossPercent] = useState(3.5);
  const [takeProfitPercent, setTakeProfitPercent] = useState(5.0);
  const [trailingStopPercent, setTrailingStopPercent] = useState(2.5);

  // 3. Profit Protection (Reversal & Stagnation)
  const [enableProfitReversal, setEnableProfitReversal] = useState(true);
  const [profitReversalThreshold, setProfitReversalThreshold] = useState(1.0);
  const [profitReversalDrop, setProfitReversalDrop] = useState(0.05);
  const [enableProfitStagnation, setEnableProfitStagnation] = useState(true);
  const [profitStagnationMinutes, setProfitStagnationMinutes] = useState(30.0);

  // 4. Auto Market Selection (1 Hour interval)
  const [enableAutoMarket, setEnableAutoMarket] = useState(true);
  const [autoMarketCount, setAutoMarketCount] = useState(5);
  const [autoMarketMinVolume, setAutoMarketMinVolume] = useState(1000000000);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(null);

  // Key Modal State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [keyFeedback, setKeyFeedback] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/trading/config`, { headers: getHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        const cfg = data.config || {};
        if (cfg.dry_run !== undefined) setDryRun(cfg.dry_run);
        if (cfg.target_markets && cfg.target_markets.length > 0) setTargetMarket(cfg.target_markets[0]);
        if (cfg.stop_loss_pct !== undefined) setStopLossPercent(cfg.stop_loss_pct);
        if (cfg.take_profit_pct !== undefined) setTakeProfitPercent(cfg.take_profit_pct);
        if (cfg.trailing_stop_pct !== undefined) setTrailingStopPercent(cfg.trailing_stop_pct);
        if (cfg.max_order_krw_per_trade !== undefined) setMaxOrderAmount(cfg.max_order_krw_per_trade);
        if (cfg.max_portfolio_ratio_per_coin !== undefined) setMaxPortfolioRatio(cfg.max_portfolio_ratio_per_coin);
        if (cfg.candle_unit_minutes !== undefined) setCandleUnit(cfg.candle_unit_minutes);
        
        // Profit Protection
        if (cfg.enable_profit_reversal_exit !== undefined) setEnableProfitReversal(cfg.enable_profit_reversal_exit);
        if (cfg.profit_reversal_threshold_pct !== undefined) setProfitReversalThreshold(cfg.profit_reversal_threshold_pct);
        if (cfg.profit_reversal_drop_pct !== undefined) setProfitReversalDrop(cfg.profit_reversal_drop_pct);
        if (cfg.enable_profit_stagnation_exit !== undefined) setEnableProfitStagnation(cfg.enable_profit_stagnation_exit);
        if (cfg.profit_stagnation_minutes !== undefined) setProfitStagnationMinutes(cfg.profit_stagnation_minutes);

        // Auto Market Selection
        if (cfg.enable_auto_market_selection !== undefined) setEnableAutoMarket(cfg.enable_auto_market_selection);
        if (cfg.auto_market_count !== undefined) setAutoMarketCount(cfg.auto_market_count);
        if (cfg.auto_market_min_trade_price_24h !== undefined) setAutoMarketMinVolume(cfg.auto_market_min_trade_price_24h);
      }
    } catch (err) {
      console.log('Error fetching trading config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedFeedback(null);

    const payload = {
      dry_run: Boolean(dryRun),
      target_markets: [targetMarket],
      max_order_krw_per_trade: parseFloat(maxOrderAmount),
      max_portfolio_ratio_per_coin: parseFloat(maxPortfolioRatio),
      candle_unit_minutes: parseInt(candleUnit, 10),
      stop_loss_pct: parseFloat(stopLossPercent),
      take_profit_pct: parseFloat(takeProfitPercent),
      trailing_stop_pct: parseFloat(trailingStopPercent),
      enable_profit_reversal_exit: Boolean(enableProfitReversal),
      profit_reversal_threshold_pct: parseFloat(profitReversalThreshold),
      profit_reversal_drop_pct: parseFloat(profitReversalDrop),
      enable_profit_stagnation_exit: Boolean(enableProfitStagnation),
      profit_stagnation_minutes: parseFloat(profitStagnationMinutes),
      enable_auto_market_selection: Boolean(enableAutoMarket),
      auto_market_mode: 'TOP_VOLUME',
      auto_market_count: parseInt(autoMarketCount, 10),
      auto_market_min_trade_price_24h: parseFloat(autoMarketMinVolume)
    };

    try {
      const resp = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok) {
        setSavedFeedback({ ok: true, message: '자동 매매 지침 및 파라미터가 성공적으로 반영되었습니다.' });
        if (onSaveSettings) onSaveSettings(payload);
        setTimeout(() => setSavedFeedback(null), 3000);
      } else {
        setSavedFeedback({ ok: false, message: data.detail || '설정 저장에 실패했습니다.' });
      }
    } catch (err) {
      setSavedFeedback({ ok: false, message: `통신 오류: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKey || !secretKey) {
      setKeyFeedback({ ok: false, message: 'Connect Key와 Secret Key를 모두 입력해 주세요.' });
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/credentials`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          site_name: 'BITHUMB_API_KEY',
          domain: 'bithumb.com',
          username: apiKey,
          secret_key: secretKey,
          description: '빗썸 자동매매 실전 API Key'
        })
      });
      if (resp.ok) {
        setKeyFeedback({ ok: true, message: '빗썸 API Key가 안전하게 암호화 저장되었습니다.' });
        setTimeout(() => {
          setShowKeyModal(false);
          setKeyFeedback(null);
          setApiKey('');
          setSecretKey('');
        }, 1500);
      } else {
        setKeyFeedback({ ok: false, message: 'API Key 저장 실패' });
      }
    } catch (err) {
      setKeyFeedback({ ok: false, message: err.message });
    }
  };

  return (
    <Box
      title="4. Trading Setting Box (자동 거래 지침 & 퀀트 제어)"
      subtitle="손익절 가드레일, 고점 반락/장기 횡보 수익 보존 규칙 및 1시간 주기 종목 자동 발굴"
      icon={Settings}
      badge={dryRun ? '모의투자 모드 (Dry-run)' : '실전 거래 모드 (Live)'}
      badgeType={dryRun ? 'warning' : 'success'}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowKeyModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#c4b5fd',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Key size={13} />
            <span>빗썸 API Key 연동</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{saving ? '저장 중...' : '지침 저장 및 적용'}</span>
          </button>
        </div>
      }
    >
      {savedFeedback && (
        <div style={{
          marginBottom: '16px',
          padding: '10px 14px',
          borderRadius: '8px',
          background: savedFeedback.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${savedFeedback.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: savedFeedback.ok ? '#34d399' : '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {savedFeedback.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{savedFeedback.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Section 1: Basic Trading Execution Mode */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} />
            <span>1. 기본 매매 환경 & 모의/실전 운용 모드</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                매매 실행 모드:
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setDryRun(true)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${dryRun ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)'}`,
                    background: dryRun ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    color: dryRun ? '#fbbf24' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  🛡️ 모의투자 (Safe)
                </button>
                <button
                  type="button"
                  onClick={() => setDryRun(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${!dryRun ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                    background: !dryRun ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    color: !dryRun ? '#34d399' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ 실전 거래 (Live)
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                기본 감시 마켓:
              </label>
              <select
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="KRW-BTC" style={{ background: '#121225' }}>비트코인 (BTC/KRW)</option>
                <option value="KRW-ETH" style={{ background: '#121225' }}>이더리움 (ETH/KRW)</option>
                <option value="KRW-SOL" style={{ background: '#121225' }}>솔라나 (SOL/KRW)</option>
                <option value="KRW-XRP" style={{ background: '#121225' }}>리플 (XRP/KRW)</option>
                <option value="KRW-DOGE" style={{ background: '#121225' }}>도지코인 (DOGE/KRW)</option>
              </select>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                1회 주문 한도 (KRW):
              </label>
              <input
                type="number"
                value={maxOrderAmount}
                onChange={(e) => setMaxOrderAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Stop Loss, Take Profit & Trailing Stop Guardrails */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={15} />
            <span>2. 손익절 & 트레일링 스탑 가드레일 (지침 기준: 손절 -3.5% / 트레일링 2.5%)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>하드 손절선 (Stop-Loss %):</span>
              <input
                type="number"
                step="0.1"
                value={stopLossPercent}
                onChange={(e) => setStopLossPercent(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#f87171',
                  fontWeight: 800,
                  fontSize: '13px',
                  marginTop: '4px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>목표 익절선 (Take-Profit %):</span>
              <input
                type="number"
                step="0.1"
                value={takeProfitPercent}
                onChange={(e) => setTakeProfitPercent(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#34d399',
                  fontWeight: 800,
                  fontSize: '13px',
                  marginTop: '4px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 600 }}>트레일링 스탑 (Trailing %):</span>
              <input
                type="number"
                step="0.1"
                value={trailingStopPercent}
                onChange={(e) => setTrailingStopPercent(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#c4b5fd',
                  fontWeight: 800,
                  fontSize: '13px',
                  marginTop: '4px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Profit Protection (Reversal & Stagnation) */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={15} />
            <span>3. 고점 반락 & 장기 횡보 수익 보존 규칙 (Profit Protection)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>고점 반락 익절 (Profit Reversal):</span>
                <input
                  type="checkbox"
                  checked={enableProfitReversal}
                  onChange={(e) => setEnableProfitReversal(e.target.checked)}
                  style={{ accentColor: '#fbbf24', cursor: 'pointer' }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                순수익 +{profitReversalThreshold}% 도달 후 고점 대비 {profitReversalDrop}%p 되밀림 시 즉시 청산
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <input
                  type="number"
                  step="0.1"
                  value={profitReversalThreshold}
                  onChange={(e) => setProfitReversalThreshold(e.target.value)}
                  placeholder="기준 수익률 %"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '6px', color: '#fbbf24', fontSize: '11px', boxSizing: 'border-box' }}
                />
                <input
                  type="number"
                  step="0.01"
                  value={profitReversalDrop}
                  onChange={(e) => setProfitReversalDrop(e.target.value)}
                  placeholder="되밀림 낙폭 %p"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '6px', color: '#fbbf24', fontSize: '11px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>이익 횡보 정체 탈출 (Stagnation Exit):</span>
                <input
                  type="checkbox"
                  checked={enableProfitStagnation}
                  onChange={(e) => setEnableProfitStagnation(e.target.checked)}
                  style={{ accentColor: '#fbbf24', cursor: 'pointer' }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                +0.3% 이상 수익 상태에서 {profitStagnationMinutes}분 이상 고점 갱신 정체 시 자금 회수
              </div>
              <input
                type="number"
                value={profitStagnationMinutes}
                onChange={(e) => setProfitStagnationMinutes(e.target.value)}
                placeholder="정체 시간(분)"
                style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '6px', color: '#fbbf24', fontSize: '11px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Auto Market Selection (1 Hour interval) */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#c4b5fd', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} />
            <span>4. 1시간 주기 거래대금 상위 종목 자동 발굴 (Auto Market Selection)</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                빗썸 거래대금 상위 {autoMarketCount}개 종목 자동 교체 발굴 (1시간 주기):
              </span>
              <input
                type="checkbox"
                checked={enableAutoMarket}
                onChange={(e) => setEnableAutoMarket(e.target.checked)}
                style={{ accentColor: '#c4b5fd', cursor: 'pointer' }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              빗썸 전체 마켓 중 24시간 거래대금 10억 이상 상위 {autoMarketCount}개 코인을 1시간마다 분석 대상으로 자동 선정합니다.
            </div>
          </div>
        </div>

      </div>

      {/* Bithumb API Key Modal */}
      {showKeyModal && (
        <div className="server-modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="server-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="server-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="#c4b5fd" />
                <h3>빗썸 API Key 등록</h3>
              </div>
              <button className="server-modal-close" onClick={() => setShowKeyModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  Bithumb Connect Key:
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="빗썸 Connect Key 입력"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  Bithumb Secret Key:
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="빗썸 Secret Key 입력"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {keyFeedback && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: keyFeedback.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${keyFeedback.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: keyFeedback.ok ? '#34d399' : '#f87171',
                  fontSize: '11px'
                }}>
                  {keyFeedback.message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', border: 'none', color: '#fff', fontWeight: 700 }}
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Box>
  );
}
