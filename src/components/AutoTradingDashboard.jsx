import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, Play, ShieldAlert,
  Sliders, Activity, CheckCircle, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Layers, Clock, DollarSign, Cpu, Search, Filter,
  ChevronDown, ChevronUp, AlertCircle, Info, Sparkles,
  Wallet, PieChart, Coins, Banknote, Percent, ArrowRight,
  Key, ShieldCheck, ShieldX, Settings, X, Plus, Check, Eye, EyeOff
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function AutoTradingDashboard() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15); // seconds
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  // Account Check State
  const [accountStatus, setAccountStatus] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  // Order Limits Modal State
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [limitsForm, setLimitsForm] = useState({
    dry_run: true,
    min_order_krw: 5000,
    max_order_krw_per_trade: 50000,
    max_holding_coins: 1,
    max_portfolio_ratio_per_coin: 0.3,
    stop_loss_pct: 3.0,
    take_profit_pct: 5.0,
    daily_max_loss_pct: 5.0,
    cooldown_minutes_after_sell: 15
  });
  const [savingLimits, setSavingLimits] = useState(false);

  // Market / Item Management Modal State
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState(['KRW-BTC', 'KRW-ETH']);
  const [candleUnit, setCandleUnit] = useState(15);
  const [availableMarkets, setAvailableMarkets] = useState([]);
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [savingMarkets, setSavingMarkets] = useState(false);

  const timerRef = useRef(null);

  // Fetch Status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trading/status`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        // Sync limits form
        setLimitsForm(prev => ({
          ...prev,
          dry_run: data.is_dry_run ?? true,
          min_order_krw: data.min_order_krw ?? 5000,
          max_order_krw_per_trade: data.max_order_krw ?? 50000,
          max_holding_coins: data.max_holding_coins ?? 1,
          max_portfolio_ratio_per_coin: data.max_portfolio_ratio_per_coin ?? 0.3,
          stop_loss_pct: data.stop_loss_pct ?? 3.0,
          take_profit_pct: data.take_profit_pct ?? 5.0,
          daily_max_loss_pct: data.daily_max_loss_pct ?? 5.0,
          cooldown_minutes_after_sell: data.cooldown_minutes_after_sell ?? 15
        }));
        if (data.target_markets) {
          setSelectedMarkets(data.target_markets);
        }
        if (data.candle_unit_minutes) {
          setCandleUnit(data.candle_unit_minutes);
        }
      }
    } catch (err) {
      console.error('Failed to fetch trading status:', err);
    }
  };

  // Fetch Account Check
  const fetchAccountStatus = async () => {
    setAccountLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/account/check`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setAccountStatus(data);
      }
    } catch (err) {
      console.error('Failed to check account status:', err);
      setAccountStatus({
        status: 'NETWORK_ERROR',
        is_connected: false,
        message: '서버와 통신할 수 없습니다.'
      });
    } finally {
      setAccountLoading(false);
    }
  };

const FALLBACK_BITHUMB_MARKETS = [
  { market: 'KRW-BTC', symbol: 'BTC', korean_name: '비트코인', english_name: 'Bitcoin' },
  { market: 'KRW-ETH', symbol: 'ETH', korean_name: '이더리움', english_name: 'Ethereum' },
  { market: 'KRW-XRP', symbol: 'XRP', korean_name: '리플', english_name: 'Ripple' },
  { market: 'KRW-SOL', symbol: 'SOL', korean_name: '솔라나', english_name: 'Solana' },
  { market: 'KRW-DOGE', symbol: 'DOGE', korean_name: '도지코인', english_name: 'Dogecoin' },
  { market: 'KRW-ADA', symbol: 'ADA', korean_name: '에이다', english_name: 'Cardano' },
  { market: 'KRW-AVAX', symbol: 'AVAX', korean_name: '아발란체', english_name: 'Avalanche' },
  { market: 'KRW-DOT', symbol: 'DOT', korean_name: '폴카닷', english_name: 'Polkadot' },
  { market: 'KRW-LINK', symbol: 'LINK', korean_name: '체인링크', english_name: 'Chainlink' },
  { market: 'KRW-SUI', symbol: 'SUI', korean_name: '수이', english_name: 'Sui' },
  { market: 'KRW-APT', symbol: 'APT', korean_name: '앱토스', english_name: 'Aptos' },
  { market: 'KRW-SHIB', symbol: 'SHIB', korean_name: '시바이누', english_name: 'Shiba Inu' },
  { market: 'KRW-PEPE', symbol: 'PEPE', korean_name: '페페', english_name: 'Pepe' },
  { market: 'KRW-NEAR', symbol: 'NEAR', korean_name: '니어프로토콜', english_name: 'NEAR Protocol' },
  { market: 'KRW-ETC', symbol: 'ETC', korean_name: '이더리움클래식', english_name: 'Ethereum Classic' },
  { market: 'KRW-BCH', symbol: 'BCH', korean_name: '비트코인캐시', english_name: 'Bitcoin Cash' },
  { market: 'KRW-XLM', symbol: 'XLM', korean_name: '스텔라루멘', english_name: 'Stellar Lumens' },
  { market: 'KRW-TRX', symbol: 'TRX', korean_name: '트론', english_name: 'TRON' },
  { market: 'KRW-SAND', symbol: 'SAND', korean_name: '샌드박스', english_name: 'The Sandbox' },
  { market: 'KRW-MANA', symbol: 'MANA', korean_name: '디센트럴랜드', english_name: 'Decentraland' },
  { market: 'KRW-WLD', symbol: 'WLD', korean_name: '월드코인', english_name: 'Worldcoin' },
  { market: 'KRW-STX', symbol: 'STX', korean_name: '스택스', english_name: 'Stacks' },
  { market: 'KRW-ARB', symbol: 'ARB', korean_name: '아비트럼', english_name: 'Arbitrum' },
  { market: 'KRW-OP', symbol: 'OP', korean_name: '옵티미즘', english_name: 'Optimism' }
];

  // Fetch Available Markets
  const fetchAvailableMarkets = async (query = '') => {
    setLoadingMarkets(true);
    try {
      const q = query ? `?query=${encodeURIComponent(query)}` : '';
      const res = await fetch(`${API_BASE}/api/trading/markets/available${q}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.markets && data.markets.length > 0) {
          setAvailableMarkets(data.markets);
          return;
        }
      }

      // Fallback 1: Query Bithumb Public Market API directly
      try {
        const bRes = await fetch('https://api.bithumb.com/v1/market/all');
        if (bRes.ok) {
          const raw = await bRes.json();
          const krwMarkets = (raw || [])
            .filter(m => m.market?.startsWith('KRW-'))
            .map(m => ({
              market: m.market,
              symbol: m.market.replace('KRW-', ''),
              korean_name: m.korean_name || m.market,
              english_name: m.english_name || m.market
            }));
          const filtered = query
            ? krwMarkets.filter(m =>
                m.market.toUpperCase().includes(query.toUpperCase()) ||
                m.symbol.toUpperCase().includes(query.toUpperCase()) ||
                m.korean_name.includes(query)
              )
            : krwMarkets;
          if (filtered.length > 0) {
            setAvailableMarkets(filtered);
            return;
          }
        }
      } catch (_) {}

      // Fallback 2: Local Built-in Popular Markets List
      const staticFiltered = query
        ? FALLBACK_BITHUMB_MARKETS.filter(m =>
            m.market.toUpperCase().includes(query.toUpperCase()) ||
            m.symbol.toUpperCase().includes(query.toUpperCase()) ||
            m.korean_name.includes(query)
          )
        : FALLBACK_BITHUMB_MARKETS;
      setAvailableMarkets(staticFiltered);
    } catch (err) {
      console.error('Failed to fetch available markets, using fallback list:', err);
      setAvailableMarkets(FALLBACK_BITHUMB_MARKETS);
    } finally {
      setLoadingMarkets(false);
    }
  };

  // Fetch Logs
  const fetchLogs = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        page_size: 20
      });
      if (marketFilter !== 'ALL') params.append('market', marketFilter);
      if (decisionFilter !== 'ALL') params.append('decision', decisionFilter);

      const res = await fetch(`${API_BASE}/api/trading/logs?${params.toString()}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch trading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([fetchStatus(), fetchAccountStatus(), fetchLogs(page)]);
  };

  // Trigger Manual Trading Loop
  const handleTriggerRun = async () => {
    setTriggering(true);
    setAlertMsg({ type: 'info', text: '실시간 시장 분석 및 트레이딩 루프를 실행 중입니다...' });
    try {
      const res = await fetch(`${API_BASE}/api/trading/trigger`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: data.message || '분석 사이클이 시작되었습니다.' });
        setTimeout(() => {
          handleRefreshAll();
        }, 3000);
      } else {
        setAlertMsg({ type: 'error', text: data.message || '실행 요청 실패' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `실행 실패: ${err.message}` });
    } finally {
      setTriggering(false);
      setTimeout(() => setAlertMsg(null), 6000);
    }
  };

  // Save Account Credentials
  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/account/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          access_key: accessKeyInput.trim() || undefined,
          secret_key: secretKeyInput.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: data.message || 'API 키가 성공적으로 저장되었습니다.' });
        setShowAccountModal(false);
        setAccessKeyInput('');
        setSecretKeyInput('');
        await fetchAccountStatus();
        await fetchStatus();
      } else {
        setAlertMsg({ type: 'error', text: data.message || '저장 실패' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `API 키 저장 오류: ${err.message}` });
    } finally {
      setSavingAccount(false);
      setTimeout(() => setAlertMsg(null), 6000);
    }
  };

  // Save Order Limits Configuration
  const handleSaveLimits = async (e) => {
    e.preventDefault();
    setSavingLimits(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(limitsForm)
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: '1회 거래 한도 및 1품목 제한 설정이 저장되었습니다.' });
        setShowLimitsModal(false);
        await fetchStatus();
      } else {
        setAlertMsg({ type: 'error', text: data.message || '설정 저장 실패' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `설정 저장 실패: ${err.message}` });
    } finally {
      setSavingLimits(false);
      setTimeout(() => setAlertMsg(null), 6000);
    }
  };

  // Save Target Markets and Candle Unit
  const handleSaveMarkets = async () => {
    if (selectedMarkets.length === 0) {
      alert('최소 1개 이상의 거래 품목(마켓)을 선택해야 합니다.');
      return;
    }
    setSavingMarkets(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          target_markets: selectedMarkets,
          candle_unit_minutes: candleUnit
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: `거래 품목(${selectedMarkets.length}개) 및 캔들 주기(${candleUnit}분)가 저장되었습니다.` });
        setShowMarketModal(false);
        await fetchStatus();
      } else {
        setAlertMsg({ type: 'error', text: data.message || '품목 저장 실패' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `품목 저장 실패: ${err.message}` });
    } finally {
      setSavingMarkets(false);
      setTimeout(() => setAlertMsg(null), 6000);
    }
  };

  // Toggle Market Selection
  const toggleMarketSelection = (marketCode) => {
    if (selectedMarkets.includes(marketCode)) {
      if (selectedMarkets.length <= 1) {
        alert('최소 1개 이상의 거래 품목이 필요합니다.');
        return;
      }
      setSelectedMarkets(selectedMarkets.filter(m => m !== marketCode));
    } else {
      setSelectedMarkets([...selectedMarkets, marketCode]);
    }
  };

  // Apply Presets
  const applyPreset = (presetList) => {
    setSelectedMarkets(presetList);
  };

  // Auto-refresh interval effect
  useEffect(() => {
    handleRefreshAll();
    fetchAvailableMarkets();

    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        handleRefreshAll();
      }, refreshInterval * 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, refreshInterval, marketFilter, decisionFilter, page]);

  const toggleExpandLog = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getDecisionBadge = (decision) => {
    switch (decision?.toUpperCase()) {
      case 'BUY':
        return <span className="trade-badge badge-buy"><ArrowUpRight size={14} /> BUY</span>;
      case 'SELL':
        return <span className="trade-badge badge-sell"><ArrowDownRight size={14} /> SELL</span>;
      case 'HOLD':
      default:
        return <span className="trade-badge badge-hold"><Activity size={14} /> HOLD</span>;
    }
  };

  const getActionBadge = (action) => {
    if (!action) return <span className="action-pill action-none">-</span>;
    if (action.includes('BUY')) return <span className="action-pill action-buy">⚡ {action}</span>;
    if (action.includes('SELL')) return <span className="action-pill action-sell">🔻 {action}</span>;
    if (action.includes('STOP_LOSS')) return <span className="action-pill action-danger">⚠️ 손절 청산</span>;
    if (action.includes('TAKE_PROFIT')) return <span className="action-pill action-profit">🎯 익절 청산</span>;
    return <span className="action-pill action-hold">{action}</span>;
  };

  const getTrendBadge = (trend) => {
    if (trend === 'STRONG_BULLISH' || trend === 'BULLISH') {
      return <span className="trend-badge trend-bullish">상승 추세 ({trend})</span>;
    }
    if (trend === 'STRONG_BEARISH' || trend === 'BEARISH') {
      return <span className="trend-badge trend-bearish">하락 추세 ({trend})</span>;
    }
    return <span className="trend-badge trend-neutral">중립 ({trend || 'NEUTRAL'})</span>;
  };

  return (
    <div className="trading-dashboard-container">
      {/* Top Header */}
      <div className="trading-header-card">
        <div className="header-title-section">
          <div className="header-icon-wrapper">
            <TrendingUp size={28} className="text-emerald-400" />
          </div>
          <div>
            <div className="title-row">
              <h1 className="trading-title">빗썸 AI 자동거래 대시보드</h1>
              <span className={`mode-pill ${status?.is_dry_run ? 'mode-dry-run' : 'mode-live'}`}>
                {status?.is_dry_run ? '🟢 모의투자 (Dry-Run)' : '🔴 실전매매 (Live)'}
              </span>
            </div>
            <p className="trading-subtitle">
              실시간 빗썸 시세 수집 ➔ 보조지표 연산 ➔ LLM 시장 분석 ➔ 리스크 가드레일 주문 집행
            </p>
          </div>
        </div>

        {/* Action Controls & Modal Buttons */}
        <div className="header-controls">
          <button
            className="trading-btn btn-settings"
            onClick={() => setShowLimitsModal(true)}
            title="1회 거래 제한 및 1품목 제한 설정"
          >
            <Sliders size={16} />
            <span>주문한도·품목제한 설정</span>
          </button>

          <button
            className="trading-btn btn-settings"
            onClick={() => {
              setShowMarketModal(true);
              fetchAvailableMarkets();
            }}
            title="거래 대상 코인 및 캔들 주기 관리"
          >
            <Layers size={16} />
            <span>품목 관리 ({selectedMarkets.length})</span>
          </button>

          <button
            className="trading-btn btn-trigger"
            onClick={handleTriggerRun}
            disabled={triggering}
          >
            <Play size={16} className={triggering ? 'spin-anim' : ''} />
            <span>{triggering ? '분석 진행 중...' : '즉시 분석 트리거'}</span>
          </button>

          <button
            className="trading-btn btn-refresh"
            onClick={handleRefreshAll}
            disabled={loading || accountLoading}
          >
            <RefreshCw size={16} className={(loading || accountLoading) ? 'spin-anim' : ''} />
            <span>새로고침</span>
          </button>

          <div className="auto-refresh-box">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>자동 갱신 ({refreshInterval}s)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Account Verification Check Banner */}
      <div className="account-check-card">
        <div className="account-check-left">
          <div className={`account-status-icon-box ${
            accountStatus?.status === 'CONNECTED' ? 'bg-emerald-glow' :
            accountStatus?.status === 'IP_RESTRICTED' ? 'bg-amber-glow' :
            accountStatus?.status === 'INVALID_KEY' ? 'bg-rose-glow' : 'bg-blue-glow'
          }`}>
            {accountStatus?.status === 'CONNECTED' ? (
              <ShieldCheck size={22} className="text-emerald-400" />
            ) : accountStatus?.status === 'IP_RESTRICTED' ? (
              <ShieldAlert size={22} className="text-amber-400" />
            ) : accountStatus?.status === 'INVALID_KEY' ? (
              <ShieldX size={22} className="text-rose-400" />
            ) : (
              <Key size={22} className="text-blue-400" />
            )}
          </div>
          <div className="account-check-info">
            <div className="account-title-row">
              <span className="account-check-title">빗썸 거래소 API 계정 상태</span>
              <span className={`account-status-badge status-${accountStatus?.status?.toLowerCase() || 'checking'}`}>
                {accountLoading ? '상태 확인 중...' :
                 accountStatus?.status === 'CONNECTED' ? '🟢 API 연동 완료 (실계좌)' :
                 accountStatus?.status === 'IP_RESTRICTED' ? '🟡 허용 IP 제한 (모의투자 권장)' :
                 accountStatus?.status === 'INVALID_KEY' ? '🔴 API 인증 오류' :
                 accountStatus?.status === 'CONFIG_MISSING' ? '⚪ API Key 미설정' :
                 '검증 완료'}
              </span>
              {accountStatus?.masked_key && (
                <span className="account-key-pill">
                  <Key size={12} /> Key: {accountStatus.masked_key}
                </span>
              )}
            </div>
            <p className="account-check-desc">
              {accountLoading ? 'Bithumb API 연결 및 계정 권한을 검증하고 있습니다...' :
               accountStatus?.message || '거래소 API 접근 권한 상태를 확인했습니다.'}
            </p>
          </div>
        </div>

        <div className="account-check-actions">
          <button
            className="account-btn btn-recheck"
            onClick={fetchAccountStatus}
            disabled={accountLoading}
            title="계정 접근 권한 즉시 재확인"
          >
            <RefreshCw size={14} className={accountLoading ? 'spin-anim' : ''} />
            <span>상태 재검사</span>
          </button>
          <button
            className="account-btn btn-edit-keys"
            onClick={() => setShowAccountModal(true)}
          >
            <Key size={14} />
            <span>API 키 관리</span>
          </button>
        </div>
      </div>

      {/* Alert Notice */}
      {alertMsg && (
        <div className={`trading-alert-banner alert-${alertMsg.type}`}>
          {alertMsg.type === 'success' && <CheckCircle size={18} />}
          {alertMsg.type === 'error' && <AlertCircle size={18} />}
          {alertMsg.type === 'info' && <Info size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="kpi-cards-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-glow">
            <Cpu size={20} className="text-blue-400" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">총 분석 사이클</span>
            <span className="kpi-value">{status?.total_logs_count?.toLocaleString() || 0} 회</span>
            <span className="kpi-sub">매수 {status?.total_buys || 0} / 매도 {status?.total_sells || 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-glow">
            <DollarSign size={20} className="text-emerald-400" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">1회 거래 제한 & 보유 제한</span>
            <span className="kpi-value">
              ₩ {(status?.max_order_krw || 50000).toLocaleString()} (1회)
            </span>
            <span className="kpi-sub font-semibold text-emerald-400">
              최대 {status?.max_holding_coins || 1}품목 보유 제한 적용
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-glow">
            <ShieldAlert size={20} className="text-amber-400" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">리스크 가드레일</span>
            <span className="kpi-value text-amber-300">
              손절 -{status?.stop_loss_pct || 3.0}% / 익절 +{status?.take_profit_pct || 5.0}%
            </span>
            <span className="kpi-sub">일일 손실 한도: {status?.daily_max_loss_pct || 5.0}%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-glow">
            <Layers size={20} className="text-purple-400" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">대상 마켓 & 캔들 주기</span>
            <span className="kpi-value text-purple-300">
              {status?.target_markets?.join(', ') || 'KRW-BTC'}
            </span>
            <span className="kpi-sub">{status?.candle_unit_minutes || 15}분봉 기준 분석</span>
          </div>
        </div>
      </div>

      {/* Current Asset & Portfolio Summary Section */}
      <div className="trading-asset-section">
        <div className="asset-section-header">
          <div className="asset-title-group">
            <h2 className="section-title">
              <Wallet size={20} className="text-emerald-400" />
              <span>현재 보유 자산 및 포트폴리오 현황</span>
            </h2>
            <span className="asset-subtitle">
              {status?.is_dry_run ? '모의투자 가상 잔고 기준 (초기 자본: ₩ 1,000,000)' : '빗썸 실제 계좌 실시간 연동'}
            </span>
          </div>
          {status?.assets?.total_return_pct !== undefined && status?.assets?.total_return_pct !== null && (
            <div className={`total-return-badge ${(status.assets.total_return_pct || 0) >= 0 ? 'badge-profit' : 'badge-loss'}`}>
              <span>총 누적 수익률:</span>
              <strong>{(status.assets.total_return_pct || 0) >= 0 ? '+' : ''}{(status.assets.total_return_pct || 0).toFixed(2)}%</strong>
            </div>
          )}
        </div>

        {/* 4 Hero Asset Metrics */}
        <div className="asset-hero-grid">
          {/* Card 1: Total Net Worth */}
          <div className="asset-hero-card card-total">
            <div className="asset-card-top">
              <span className="asset-card-label">총 추정 자산</span>
              <div className="asset-icon-pill bg-emerald-glow">
                <Coins size={18} className="text-emerald-400" />
              </div>
            </div>
            <div className="asset-card-main-val">
              ₩ {(status?.assets?.total_net_assets || 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="asset-card-sub-info">
              <span>원화 잔고 + 보유 코인 평가액 합산</span>
            </div>
          </div>

          {/* Card 2: KRW Balance */}
          <div className="asset-hero-card card-krw">
            <div className="asset-card-top">
              <span className="asset-card-label">보유 원화 잔고</span>
              <div className="asset-icon-pill bg-blue-glow">
                <Banknote size={18} className="text-blue-400" />
              </div>
            </div>
            <div className="asset-card-main-val">
              ₩ {(status?.assets?.krw_balance || 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="asset-card-sub-info">
              <span className="text-blue-300">주문 가능 자금 (비중 {(status?.assets?.krw_weight_pct || 100).toFixed(1)}%)</span>
            </div>
          </div>

          {/* Card 3: Crypto Evaluation */}
          <div className="asset-hero-card card-crypto">
            <div className="asset-card-top">
              <span className="asset-card-label">코인 평가 금액</span>
              <div className="asset-icon-pill bg-purple-glow">
                <PieChart size={18} className="text-purple-400" />
              </div>
            </div>
            <div className="asset-card-main-val">
              ₩ {(status?.assets?.crypto_eval_total || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="asset-card-sub-info">
              <span>총 매수 원금: ₩ {(status?.assets?.crypto_buy_total || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Card 4: Total PnL */}
          <div className="asset-hero-card card-pnl">
            <div className="asset-card-top">
              <span className="asset-card-label">총 평가 손익</span>
              <div className="asset-icon-pill bg-amber-glow">
                {(status?.assets?.total_pnl_krw || 0) >= 0 ? (
                  <TrendingUp size={18} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={18} className="text-rose-400" />
                )}
              </div>
            </div>
            <div className={`asset-card-main-val ${(status?.assets?.total_pnl_krw || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(status?.assets?.total_pnl_krw || 0) >= 0 ? '+' : ''}₩ {(status?.assets?.total_pnl_krw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="asset-card-sub-info">
              <span className={(status?.assets?.total_pnl_pct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                수익률: {(status?.assets?.total_pnl_pct || 0) >= 0 ? '+' : ''}{(status?.assets?.total_pnl_pct || 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Asset Allocation Bar */}
        <div className="asset-allocation-box">
          <div className="allocation-header">
            <div className="alloc-title">
              <Percent size={15} />
              <span>자산 포트폴리오 비중 구성</span>
            </div>
            <div className="alloc-legend">
              <div className="legend-item">
                <span className="legend-dot dot-krw"></span>
                <span>원화(KRW) {(status?.assets?.krw_weight_pct || 100).toFixed(1)}%</span>
              </div>
              {status?.assets?.holdings?.map((h) => (
                <div key={h.market} className="legend-item">
                  <span className={`legend-dot dot-${h.symbol.toLowerCase()}`}></span>
                  <span>{h.symbol} {(h.weight_pct || 0).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="allocation-progress-bar">
            <div
              className="bar-segment bar-krw"
              style={{ width: `${Math.max(status?.assets?.krw_weight_pct ?? 100, (status?.assets?.holdings?.some(h => h.weight_pct > 0) ? 0 : 100))}%` }}
              title={`KRW: ${(status?.assets?.krw_weight_pct || 100).toFixed(1)}%`}
            />
            {status?.assets?.holdings?.map((h) => (
              (h.weight_pct || 0) > 0 ? (
                <div
                  key={h.market}
                  className={`bar-segment bar-${h.symbol.toLowerCase()}`}
                  style={{ width: `${h.weight_pct}%` }}
                  title={`${h.symbol}: ${h.weight_pct.toFixed(1)}%`}
                />
              ) : null
            ))}
          </div>
        </div>

        {/* Holdings Breakdown Table */}
        <div className="holdings-table-wrapper">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>자산 종목</th>
                <th>보유 수량</th>
                <th>매수 평균가</th>
                <th>현재가</th>
                <th>매수 금액</th>
                <th>평가 금액</th>
                <th>평가 손익 (수익률)</th>
                <th>포트폴리오 비중</th>
              </tr>
            </thead>
            <tbody>
              {/* KRW Row */}
              <tr className="krw-row">
                <td>
                  <div className="asset-name-cell">
                    <span className="asset-circle circle-krw">₩</span>
                    <div>
                      <strong>대한민국 원화</strong>
                      <span className="asset-symbol">KRW</span>
                    </div>
                  </div>
                </td>
                <td>{(status?.assets?.krw_balance || 1000000).toLocaleString()} KRW</td>
                <td>-</td>
                <td>1 KRW</td>
                <td>₩ {(status?.assets?.krw_balance || 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td>₩ {(status?.assets?.krw_balance || 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td><span className="text-gray-400">-</span></td>
                <td>
                  <div className="weight-cell">
                    <span>{(status?.assets?.krw_weight_pct || 100).toFixed(1)}%</span>
                    <div className="mini-weight-bar">
                      <div className="mini-bar-fill bg-blue-500" style={{ width: `${status?.assets?.krw_weight_pct || 100}%` }}></div>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Crypto Holdings Rows */}
              {status?.assets?.holdings?.map((h) => (
                <tr key={h.market}>
                  <td>
                    <div className="asset-name-cell">
                      <span className={`asset-circle circle-${h.symbol.toLowerCase()}`}>{h.symbol.slice(0, 1)}</span>
                      <div>
                        <strong>{h.symbol === 'BTC' ? '비트코인' : h.symbol === 'ETH' ? '이더리움' : h.symbol}</strong>
                        <span className="asset-symbol">{h.market}</span>
                      </div>
                    </div>
                  </td>
                  <td>{h.volume > 0 ? h.volume.toFixed(6) : '0.000000'} {h.symbol}</td>
                  <td>{h.avg_price > 0 ? `₩ ${h.avg_price.toLocaleString()}` : '-'}</td>
                  <td>{h.current_price > 0 ? `₩ ${h.current_price.toLocaleString()}` : '-'}</td>
                  <td>₩ {h.buy_krw.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td><strong>₩ {h.eval_krw.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></td>
                  <td>
                    {h.volume > 0 ? (
                      <span className={`pnl-tag ${(h.pnl_krw || 0) >= 0 ? 'tag-profit' : 'tag-loss'}`}>
                        {(h.pnl_krw || 0) >= 0 ? '+' : ''}₩ {(h.pnl_krw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        {' '}({(h.pnl_pct || 0) >= 0 ? '+' : ''}{(h.pnl_pct || 0).toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>
                    <div className="weight-cell">
                      <span>{(h.weight_pct || 0).toFixed(1)}%</span>
                      <div className="mini-weight-bar">
                        <div
                          className={`mini-bar-fill bg-${h.symbol.toLowerCase()}`}
                          style={{ width: `${h.weight_pct || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Market Live Positions */}
      {status?.positions && Object.keys(status.positions).length > 0 && (
        <div className="market-cards-section">
          <h2 className="section-title">
            <Activity size={18} />
            <span>실시간 마켓 현황 & 포지션</span>
          </h2>
          <div className="market-cards-grid">
            {Object.entries(status.positions).map(([mkt, pos]) => (
              <div key={mkt} className="market-card">
                <div className="market-card-header">
                  <div>
                    <span className="market-name">{mkt}</span>
                    <span className="market-last-update">최근 갱신: {pos.last_updated ? new Date(pos.last_updated).toLocaleTimeString() : '-'}</span>
                  </div>
                  {getTrendBadge(pos.trend)}
                </div>

                <div className="market-price-row">
                  <span className="price-label">현재가</span>
                  <div className="flex items-center gap-2">
                    <span className="price-value">{pos.current_price > 0 ? `${pos.current_price.toLocaleString()} KRW` : '-'}</span>
                    {pos.change_rate_24h !== undefined && pos.change_rate_24h !== null && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${pos.change_rate_24h >= 0 ? 'text-emerald-400 bg-emerald-950/50' : 'text-rose-400 bg-rose-950/50'}`}>
                        {pos.change_rate_24h >= 0 ? '+' : ''}{pos.change_rate_24h.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="indicator-mini-grid">
                  <div className="mini-stat">
                    <span className="mini-stat-label">RSI (14)</span>
                    <span className={`mini-stat-val ${pos.rsi > 70 ? 'text-red-400' : pos.rsi < 30 ? 'text-emerald-400' : ''}`}>
                      {pos.rsi !== null && pos.rsi !== undefined ? pos.rsi : '-'}
                    </span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-label">MACD Hist</span>
                    <span className={`mini-stat-val ${pos.macd_hist > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.macd_hist !== null && pos.macd_hist !== undefined ? pos.macd_hist : '-'}
                    </span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-label">보유 수량</span>
                    <span className="mini-stat-val">{pos.holding_volume || 0}</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-label">수익률</span>
                    <span className={`mini-stat-val ${(pos.pnl_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(pos.pnl_pct || 0) >= 0 ? '+' : ''}{(pos.pnl_pct || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Table Section */}
      <div className="trading-logs-section">
        <div className="logs-header-row">
          <div className="logs-title-area">
            <h2 className="section-title">
              <Clock size={18} />
              <span>실시간 처리 및 시장 분석 로그 ({totalCount}건)</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={14} className="text-gray-400" />
              <select
                className="trading-select"
                value={marketFilter}
                onChange={(e) => { setMarketFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">전체 마켓</option>
                {selectedMarkets.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                className="trading-select"
                value={decisionFilter}
                onChange={(e) => { setDecisionFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">전체 판단</option>
                <option value="BUY">BUY (매수)</option>
                <option value="SELL">SELL (매도)</option>
                <option value="HOLD">HOLD (관망)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="table-responsive-container">
          <table className="trading-logs-table">
            <thead>
              <tr>
                <th>일시</th>
                <th>마켓</th>
                <th>현재가</th>
                <th>보조지표 (RSI / Trend)</th>
                <th>LLM 판단 & 신뢰도</th>
                <th>실행 액션</th>
                <th>상세 사유</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    {loading ? '로그를 불러오는 중입니다...' : '기록된 처리 로그가 없습니다.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`log-row ${isExpanded ? 'row-expanded' : ''}`} onClick={() => toggleExpandLog(log.id)}>
                        <td className="time-cell">{log.timestamp || '-'}</td>
                        <td className="market-cell">
                          <span className="market-tag">{log.market}</span>
                        </td>
                        <td className="price-cell font-mono">
                          {log.current_price ? `${log.current_price.toLocaleString()} ₩` : '-'}
                        </td>
                        <td className="indicator-cell">
                          <span className="mr-2">RSI: <strong>{log.rsi ?? '-'}</strong></span>
                          <span className="text-xs text-gray-400">({log.trend || 'NEUTRAL'})</span>
                        </td>
                        <td className="decision-cell">
                          <div className="decision-wrapper">
                            {getDecisionBadge(log.decision)}
                            <span className="confidence-pill">{( (log.confidence || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="action-cell">
                          {getActionBadge(log.action_taken)}
                        </td>
                        <td className="reason-cell">
                          <div className="reason-summary">
                            <span>{log.reason || '-'}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="expanded-details-row">
                          <td colSpan="7">
                            <div className="log-detail-box">
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <span className="detail-label">MACD Hist</span>
                                  <span className="detail-val">{log.macd_hist ?? '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">볼린저밴드 %B</span>
                                  <span className="detail-val">{log.bollinger_pb ?? '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">거래량 비율</span>
                                  <span className="detail-val">{log.volume_ratio ? `${log.volume_ratio}x` : '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">목표 투입 비중</span>
                                  <span className="detail-val">{( (log.target_ratio || 0) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">주문 실행 금액</span>
                                  <span className="detail-val">{log.order_amount_krw ? `${log.order_amount_krw.toLocaleString()} KRW` : '0 KRW'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">보유 수량 / 평단가</span>
                                  <span className="detail-val">{log.holding_volume || 0} / {log.holding_avg_price ? `${log.holding_avg_price.toLocaleString()} KRW` : '-'}</span>
                                </div>
                              </div>
                              <div className="reason-full-box">
                                <span className="reason-full-title"><Sparkles size={14} className="text-amber-300 inline mr-1" /> LLM 상세 분석 근거:</span>
                                <p className="reason-full-text">{log.reason}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              이전
            </button>
            <span className="pagination-info">{page} / {totalPages} 페이지</span>
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* ====================================================
          MODAL 1: Account Settings Modal
          ==================================================== */}
      {showAccountModal && (
        <div className="trading-modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="trading-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Key size={20} className="text-blue-400" />
                <h2>Bithumb 거래소 API 연동 설정</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAccountModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount}>
              <div className="modal-body">
                <div className="modal-info-box">
                  <Info size={16} className="text-blue-400 flex-shrink-0" />
                  <div className="text-xs text-gray-300 leading-relaxed">
                    빗썸(Bithumb) API Key는 <strong>자산조회, 주문조회, 주문하기</strong> 권한이 활성화되어 있어야 합니다.
                    보안을 위해 허용 IP를 OCI 서버 IP로 등록해 주세요.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Bithumb Access Key (Connect Key)</span>
                    {accountStatus?.masked_key && (
                      <span className="text-xs text-gray-400">현재 등록: {accountStatus.masked_key}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="trading-input"
                    placeholder="새 Access Key 입력 (변경 시에만 입력)"
                    value={accessKeyInput}
                    onChange={(e) => setAccessKeyInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Bithumb Secret Key</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      className="trading-input"
                      placeholder="새 Secret Key 입력 (변경 시에만 입력)"
                      value={secretKeyInput}
                      onChange={(e) => setSecretKeyInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                    >
                      {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="account-current-detail-card">
                  <div className="detail-row">
                    <span className="text-gray-400">연결 상태:</span>
                    <strong className={accountStatus?.is_connected ? 'text-emerald-400' : 'text-amber-400'}>
                      {accountStatus?.status || 'UNKNOWN'}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span className="text-gray-400">상태 상세:</span>
                    <span className="text-xs text-gray-300">{accountStatus?.message || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn btn-cancel"
                  onClick={() => setShowAccountModal(false)}
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="modal-btn btn-save"
                  disabled={savingAccount}
                >
                  {savingAccount ? '저장 및 검증 중...' : 'API 키 저장 및 검증'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL 2: Order Limits & Risk Guardrails Modal (1회 거래 제한, 1품목 제한)
          ==================================================== */}
      {showLimitsModal && (
        <div className="trading-modal-overlay" onClick={() => setShowLimitsModal(false)}>
          <div className="trading-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Sliders size={20} className="text-emerald-400" />
                <h2>1회 거래 제한 & 1품목 제한 리스크 관리</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowLimitsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLimits}>
              <div className="modal-body">
                {/* Trading Mode Switch */}
                <div className="mode-toggle-card">
                  <div>
                    <span className="font-bold text-sm text-gray-200">투자 모드 선택</span>
                    <p className="text-xs text-gray-400 mt-1">
                      {limitsForm.dry_run
                        ? '🟢 모의투자 (Dry-Run): 가상 잔고 100만원으로 안전하게 시뮬레이션 매매를 수행합니다.'
                        : '🔴 실전매매 (Live): 빗썸 실제 계좌의 원화 잔고로 실제 코인을 매수/매도합니다.'}
                    </p>
                  </div>
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={!limitsForm.dry_run}
                      onChange={(e) => setLimitsForm({ ...limitsForm, dry_run: !e.target.checked })}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                {/* 1회 거래 제한 & 1품목 제한 Highlights */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="text-emerald-400 font-bold">1회 최대 거래(주문) 한도 (KRW)</span>
                    </label>
                    <input
                      type="number"
                      className="trading-input font-mono font-bold"
                      min="5000"
                      step="10000"
                      value={limitsForm.max_order_krw_per_trade}
                      onChange={(e) => setLimitsForm({ ...limitsForm, max_order_krw_per_trade: parseFloat(e.target.value) || 0 })}
                    />
                    <div className="quick-amount-chips">
                      {[30000, 50000, 100000, 300000, 500000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          className="amt-chip"
                          onClick={() => setLimitsForm({ ...limitsForm, max_order_krw_per_trade: amt })}
                        >
                          {(amt / 10000)}만원
                        </button>
                      ))}
                    </div>
                    <span className="input-hint">1회 매수 실행 시 투입되는 최대 주문 금액 제한</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="text-purple-400 font-bold">동시 보유 품목 수 제한 (개)</span>
                    </label>
                    <input
                      type="number"
                      className="trading-input font-bold font-mono"
                      min="1"
                      max="50"
                      step="1"
                      placeholder="예: 1"
                      value={limitsForm.max_holding_coins}
                      onChange={(e) => setLimitsForm({ ...limitsForm, max_holding_coins: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                    <div className="amt-chips mt-1">
                      {[1, 2, 3, 5, 10].map((count) => (
                        <button
                          key={count}
                          type="button"
                          className={`amt-chip ${limitsForm.max_holding_coins === count ? 'active font-bold text-purple-300' : ''}`}
                          onClick={() => setLimitsForm({ ...limitsForm, max_holding_coins: count })}
                        >
                          {count === 1 ? '🔒 1개(단일)' : `${count}개`}
                        </button>
                      ))}
                    </div>
                    <span className="input-hint">설정한 개수만큼만 동시에 포지션을 보유하며, 도달 시 추가 매수를 제한합니다.</span>
                  </div>
                </div>

                <div className="form-grid-2 mt-2">
                  <div className="form-group">
                    <label className="form-label">
                      <span>1회 최소 주문 금액 (KRW)</span>
                    </label>
                    <input
                      type="number"
                      className="trading-input font-mono"
                      min="1000"
                      step="1000"
                      value={limitsForm.min_order_krw}
                      onChange={(e) => setLimitsForm({ ...limitsForm, min_order_krw: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="input-hint">빗썸 최소 주문액 기준 5,000원 이상 권장</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>코인별 포트폴리오 최대 비중: <strong>{((limitsForm.max_portfolio_ratio_per_coin || 0.3) * 100).toFixed(0)}%</strong></span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      className="trading-range"
                      value={limitsForm.max_portfolio_ratio_per_coin}
                      onChange={(e) => setLimitsForm({ ...limitsForm, max_portfolio_ratio_per_coin: parseFloat(e.target.value) })}
                    />
                    <span className="input-hint">단일 코인이 전체 자산에서 차지할 수 있는 상한선</span>
                  </div>
                </div>

                <div className="form-grid-2 mt-2">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="text-rose-400 font-bold">손절 기준 (Stop Loss %)</span>
                    </label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="trading-input font-mono text-rose-400"
                        min="0.5"
                        max="30"
                        step="0.5"
                        value={limitsForm.stop_loss_pct}
                        onChange={(e) => setLimitsForm({ ...limitsForm, stop_loss_pct: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="suffix">%</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="text-emerald-400 font-bold">익절 기준 (Take Profit %)</span>
                    </label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="trading-input font-mono text-emerald-400"
                        min="1"
                        max="100"
                        step="0.5"
                        value={limitsForm.take_profit_pct}
                        onChange={(e) => setLimitsForm({ ...limitsForm, take_profit_pct: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="suffix">%</span>
                    </div>
                  </div>
                </div>

                <div className="form-grid-2 mt-2">
                  <div className="form-group">
                    <label className="form-label">
                      <span>일일 최대 손실 서킷브레이커 (%)</span>
                    </label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="trading-input font-mono text-amber-400"
                        min="1"
                        max="30"
                        step="0.5"
                        value={limitsForm.daily_max_loss_pct}
                        onChange={(e) => setLimitsForm({ ...limitsForm, daily_max_loss_pct: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="suffix">%</span>
                    </div>
                    <span className="input-hint">당일 누적 손실 도달 시 거래 즉시 중단</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>매도 후 재진입 쿨다운 (분)</span>
                    </label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="trading-input font-mono"
                        min="1"
                        max="180"
                        step="1"
                        value={limitsForm.cooldown_minutes_after_sell}
                        onChange={(e) => setLimitsForm({ ...limitsForm, cooldown_minutes_after_sell: parseInt(e.target.value) || 1 })}
                      />
                      <span className="suffix">분</span>
                    </div>
                    <span className="input-hint">포지션 청산 후 성급한 재진입 방지</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn btn-cancel"
                  onClick={() => setShowLimitsModal(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="modal-btn btn-save"
                  disabled={savingLimits}
                >
                  {savingLimits ? '저장 중...' : '1회 거래 & 1품목 제한 설정 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL 3: Market / Item Management Modal
          ==================================================== */}
      {showMarketModal && (
        <div className="trading-modal-overlay" onClick={() => setShowMarketModal(false)}>
          <div className="trading-modal-content market-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Layers size={20} className="text-purple-400" />
                <h2>거래 품목(마켓) 및 캔들 주기 관리</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowMarketModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Currently Selected Markets */}
              <div className="selected-markets-box">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-gray-200">
                    현재 자동거래 대상 품목 ({selectedMarkets.length}개)
                  </span>
                  <span className="text-xs text-gray-400">클릭하여 제외 가능</span>
                </div>
                <div className="selected-tags-container">
                  {selectedMarkets.map(mkt => (
                    <span key={mkt} className="market-pill-tag">
                      <strong>{mkt}</strong>
                      <button
                        type="button"
                        className="pill-remove-btn"
                        onClick={() => toggleMarketSelection(mkt)}
                        title="제거"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Candle Unit Selection */}
              <div className="candle-unit-section mt-3">
                <span className="font-bold text-sm text-gray-200 block mb-2">
                  분석 캔들 주기 선택
                </span>
                <div className="candle-buttons-grid">
                  {[1, 3, 5, 15, 30, 60, 240].map(unit => (
                    <button
                      key={unit}
                      type="button"
                      className={`candle-btn ${candleUnit === unit ? 'active' : ''}`}
                      onClick={() => setCandleUnit(unit)}
                    >
                      {unit >= 60 ? `${unit / 60}시간봉` : `${unit}분봉`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div className="presets-box mt-3">
                <span className="text-xs text-gray-400 font-bold block mb-1">빠른 추천 프리셋:</span>
                <div className="preset-buttons-row">
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => applyPreset(['KRW-BTC'])}
                  >
                    🔒 단일 1종 (BTC 전용)
                  </button>
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => applyPreset(['KRW-BTC', 'KRW-ETH'])}
                  >
                    💎 메이저 2종 (BTC + ETH)
                  </button>
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => applyPreset(['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-SOL'])}
                  >
                    🚀 메이저 4종 (+XRP, SOL)
                  </button>
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => applyPreset(['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-DOGE', 'KRW-SOL'])}
                  >
                    ⚡ 인기 5종 (+DOGE)
                  </button>
                </div>
              </div>

              {/* Market Search and Add */}
              <div className="market-search-section mt-4">
                <span className="font-bold text-sm text-gray-200 block mb-2">
                  빗썸 원화 마켓 검색 및 추가 (400+ 종목)
                </span>
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="trading-input pl-9"
                    placeholder="코인명 (예: 리플, 솔라나, 도지) 또는 심볼 (XRP, SOL, DOGE) 검색..."
                    value={marketSearchQuery}
                    onChange={(e) => {
                      setMarketSearchQuery(e.target.value);
                      fetchAvailableMarkets(e.target.value);
                    }}
                  />
                </div>

                <div className="available-markets-list">
                  {loadingMarkets ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      마켓 목록을 검색하는 중...
                    </div>
                  ) : availableMarkets.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      일치하는 빗썸 원화 마켓이 없습니다.
                    </div>
                  ) : (
                    availableMarkets.slice(0, 30).map(m => {
                      const isSelected = selectedMarkets.includes(m.market);
                      return (
                        <div
                          key={m.market}
                          className={`available-market-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleMarketSelection(m.market)}
                        >
                          <div className="market-item-left">
                            <span className="coin-symbol">{m.symbol}</span>
                            <div className="coin-names">
                              <strong>{m.korean_name}</strong>
                              <span className="text-xs text-gray-400">{m.market}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`market-action-btn ${isSelected ? 'btn-remove' : 'btn-add'}`}
                          >
                            {isSelected ? (
                              <>
                                <Check size={12} />
                                <span>선택됨</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>추가</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn btn-cancel"
                onClick={() => setShowMarketModal(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="modal-btn btn-save"
                onClick={handleSaveMarkets}
                disabled={savingMarkets}
              >
                {savingMarkets ? '저장 중...' : `설정 저장 (${selectedMarkets.length}개 마켓)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
