import React, { useState, useEffect } from 'react';
import { Settings, Shield, Sliders, Save, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, DollarSign, Target, Key, Plus, RefreshCw, X, Sparkles, Activity } from 'lucide-react';
import { Box, SubBoxCard } from '../common/Box';
import { getApiBase } from '../../config';

export default function TradingSettingBox({ onSaveSettings }) {
  const [targetMarket, setTargetMarket] = useState('KRW-BTC');
  const [dryRun, setDryRun] = useState(true);
  const [stopLossPercent, setStopLossPercent] = useState(3.5);
  const [takeProfitPercent, setTakeProfitPercent] = useState(5.0);
  const [trailingStopPercent, setTrailingStopPercent] = useState(2.5);
  const [maxOrderAmount, setMaxOrderAmount] = useState(100000);
  const [candleUnit, setCandleUnit] = useState(15);
  const [enableAutoMarket, setEnableAutoMarket] = useState(true);
  const [maxHoldingCoins, setMaxHoldingCoins] = useState(1);

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

  // Fetch live config from server on mount
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
        if (cfg.enable_auto_market_selection !== undefined) setEnableAutoMarket(cfg.enable_auto_market_selection);
        if (cfg.candle_unit_minutes !== undefined) setCandleUnit(cfg.candle_unit_minutes);
        if (cfg.max_holding_coins !== undefined) setMaxHoldingCoins(cfg.max_holding_coins);
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
      stop_loss_pct: parseFloat(stopLossPercent),
      take_profit_pct: parseFloat(takeProfitPercent),
      trailing_stop_pct: parseFloat(trailingStopPercent),
      max_order_krw_per_trade: parseFloat(maxOrderAmount),
      candle_unit_minutes: parseInt(candleUnit, 10),
      enable_auto_market_selection: Boolean(enableAutoMarket),
      max_holding_coins: parseInt(maxHoldingCoins, 10)
    };

    try {
      const resp = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok) {
        setSavedFeedback({ ok: true, message: data.message || '트레이딩 설정이 성공적으로 저장되었습니다.' });
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
      title="5. Trading Setting Box (전략 파라미터 & 리스크 관리)"
      subtitle="손익절 %, 1회 주문 한도, 타겟 마켓 및 빗썸 API Key 연동 설정"
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
            <span>{saving ? '저장 중...' : '설정 저장'}</span>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Trading Mode Toggle */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            매매 실행 모드:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setDryRun(true)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${dryRun ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)'}`,
                background: dryRun ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                color: dryRun ? '#fbbf24' : '#94a3b8',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🛡️ 안전 모의투자 (Dry-Run)
            </button>
            <button
              type="button"
              onClick={() => setDryRun(false)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${!dryRun ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                background: !dryRun ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                color: !dryRun ? '#34d399' : '#94a3b8',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ⚡ 실전 거래 (Live)
            </button>
          </div>
        </div>

        {/* Target Market */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            기본 타겟 마켓:
          </label>
          <select
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '13px',
              outline: 'none'
            }}
          >
            <option value="KRW-BTC" style={{ background: '#121225' }}>비트코인 (BTC/KRW)</option>
            <option value="KRW-ETH" style={{ background: '#121225' }}>이더리움 (ETH/KRW)</option>
            <option value="KRW-SOL" style={{ background: '#121225' }}>솔라나 (SOL/KRW)</option>
            <option value="KRW-XRP" style={{ background: '#121225' }}>리플 (XRP/KRW)</option>
            <option value="KRW-DOGE" style={{ background: '#121225' }}>도지코인 (DOGE/KRW)</option>
            <option value="KRW-ADA" style={{ background: '#121225' }}>에이다 (ADA/KRW)</option>
            <option value="KRW-AVAX" style={{ background: '#121225' }}>아발란체 (AVAX/KRW)</option>
            <option value="KRW-SUI" style={{ background: '#121225' }}>수이 (SUI/KRW)</option>
          </select>
        </div>

        {/* Dynamic Risk Stop-Loss & Take-Profit */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            손절 & 익절 가드레일 (%):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>손절 기준 (%):</span>
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
                  fontWeight: 700,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>익절 기준 (%):</span>
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
                  fontWeight: 700,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Trailing Stop & Order Amount */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            1회 주문 한도 & 트레일링 스탑:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 600 }}>트레일링 (%):</span>
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
                  fontWeight: 700,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>주문 한도 (KRW):</span>
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
                  fontWeight: 700,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
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
