import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, Play, ShieldAlert,
  Sliders, Activity, CheckCircle, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Layers, Clock, DollarSign, Cpu, Search, Filter,
  ChevronDown, ChevronUp, AlertCircle, Info, Sparkles,
  Wallet, PieChart, Coins, Banknote, Percent, ArrowRight,
  Key, ShieldCheck, ShieldX, Settings, X, Plus, Check, Eye, EyeOff,
  Lock, LogOut, User
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'https://ragweed-blighted-skylight.ngrok-free.dev' : '');

export default function AutoTradingDashboard() {
  // Authentication State
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_auth_token') || '';
    }
    return '';
  });
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_auth_username') || '';
    }
    return '';
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15); // seconds
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL'); // 'ALL' | 'DRY_RUN' | 'LIVE'
  const [resettingVirtual, setResettingVirtual] = useState(false);
  const [resettingLive, setResettingLive] = useState(false);
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

  // Order Limits & Strategy Engine Modal State
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [limitsForm, setLimitsForm] = useState({
    dry_run: true,
    min_order_krw: 5000,
    stop_loss_pct: 10.0,
    take_profit_pct: 0.0,
    daily_max_loss_pct: 0.0,
    cooldown_minutes_after_sell: 0,
    enable_trend_filter: true,
    enable_breakeven_stop: false,
    breakeven_trigger_pct: 0.0,
    enable_partial_take_profit: false,
    partial_take_profit_pct: 0.0,
    partial_take_profit_ratio: 0.0,
    trailing_stop_pct: 0.0,
    max_rsi_for_buy: 68.0,
    min_rsi_for_buy: 38.0,
    enable_profit_reversal_exit: true,
    profit_reversal_threshold_pct: 1.0,
    profit_reversal_drop_pct: 1.0,
    enable_profit_stagnation_exit: true,
    profit_stagnation_minutes: 30
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
  // Weekly Summary & Folding State
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState(false);
  const [foldedSections, setFoldedSections] = useState({
    account: false,
    kpi: false,
    assets: false,
    weekly: false,
    marketCards: false,
    logs: false
  });

  const toggleSectionFold = (sectionKey) => {
    setFoldedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const timerRef = useRef(null);

  // Helper for auth headers
  const getAuthHeaders = (extra = {}) => {
    const headers = {
      'ngrok-skip-browser-warning': 'true',
      ...extra
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('agent_auth_token');
    localStorage.removeItem('agent_auth_username');
    setToken('');
    setUsername('');
    setLoginError('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
  };

  // Login Handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(loginForm)
      });
      const data = await resp.json();
      if (resp.ok && data.token) {
        localStorage.setItem('agent_auth_token', data.token);
        localStorage.setItem('agent_auth_username', data.username);
        setToken(data.token);
        setUsername(data.username);
        setLoginForm({ username: '', password: '' });
      } else {
        setLoginError(data.detail || data.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('로그인 요청 중 서버 통신 오류가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('agent_auth_token');
      localStorage.removeItem('agent_auth_username');
      setToken('');
      setUsername('');
      setStatus(null);
      setAccountStatus(null);
      setLogs([]);
    }
  };

  // Reset Virtual / Paper Trading Data
  const handleResetVirtualData = async () => {
    if (!window.confirm("가상 매매(모의투자) 기록과 포지션을 모두 초기화하고 가상 잔고를 1,000,000 KRW로 리셋하시겠습니까?\n(실제 빗썸 계좌 자산에는 전혀 영향을 주지 않습니다.)")) {
      return;
    }
    setResettingVirtual(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/reset-virtual`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: data.message || '가상 매매 데이터가 성공적으로 초기화되었습니다.' });
        await handleRefreshAll();
      } else {
        setAlertMsg({ type: 'error', text: data.message || '가상 데이터 초기화 실패' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `가상 데이터 초기화 오류: ${err.message}` });
    } finally {
      setResettingVirtual(false);
      setTimeout(() => setAlertMsg(null), 6000);
    }
  };

  // Reset Live Trading Data
  const handleResetLiveData = async () => {
    if (!window.confirm("실전 매매 분석 및 주문 실행 기록을 초기화하시겠습니까?\n\n⚠️ 주의: 빗썸 거래소의 실제 원화 잔고 및 보유 중인 코인은 안전하게 그대로 유지되며, 대시보드의 실전 매매 기록(로그)만 초기화됩니다.")) {
      return;
    }
    setResettingLive(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/reset-live`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: data.message || '실전 매매 기록이 성공적으로 초기화되었습니다.' });
        await handleRefreshAll();
      } else {
        setAlertMsg({ type: 'error', text: data.message || '실전 기록 초기화 실패' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `실전 기록 초기화 오류: ${err.message}` });
    } finally {
      setResettingLive(false);
      setTimeout(() => setAlertMsg(null), 6000);
    }
  };

  // Fetch Status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trading/status`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch trading status:', err);
    }
  };

  // Open Limits Modal with latest synced status values
  const openLimitsModal = () => {
    if (status) {
      setLimitsForm({
        dry_run: status.is_dry_run ?? true,
        min_order_krw: status.min_order_krw ?? 5000,
        stop_loss_pct: status.stop_loss_pct ?? 10.0,
        take_profit_pct: status.take_profit_pct ?? 0.0,
        daily_max_loss_pct: status.daily_max_loss_pct ?? 0.0,
        cooldown_minutes_after_sell: status.cooldown_minutes_after_sell ?? 0,
        enable_trend_filter: status.enable_trend_filter ?? true,
        enable_breakeven_stop: status.enable_breakeven_stop ?? false,
        breakeven_trigger_pct: status.breakeven_trigger_pct ?? 0.0,
        enable_partial_take_profit: status.enable_partial_take_profit ?? false,
        partial_take_profit_pct: status.partial_take_profit_pct ?? 0.0,
        partial_take_profit_ratio: status.partial_take_profit_ratio ?? 0.0,
        trailing_stop_pct: status.trailing_stop_pct ?? 0.0,
        max_rsi_for_buy: status.max_rsi_for_buy ?? 68.0,
        min_rsi_for_buy: status.min_rsi_for_buy ?? 38.0,
        enable_profit_reversal_exit: status.enable_profit_reversal_exit ?? true,
        profit_reversal_threshold_pct: status.profit_reversal_threshold_pct ?? 1.0,
        profit_reversal_drop_pct: status.profit_reversal_drop_pct ?? 1.0,
        enable_profit_stagnation_exit: status.enable_profit_stagnation_exit ?? true,
        profit_stagnation_minutes: status.profit_stagnation_minutes ?? 30
      });
    }
    setShowLimitsModal(true);
  };

  // Open Market Modal with latest synced status values
  const openMarketModal = () => {
    if (status?.target_markets && status.target_markets.length > 0) {
      setSelectedMarkets(status.target_markets);
    }
    if (status?.candle_unit_minutes) {
      setCandleUnit(status.candle_unit_minutes);
    }
    setShowMarketModal(true);
    fetchAvailableMarkets();
  };

  // Fetch Account Check
  const fetchAccountStatus = async () => {
    setAccountLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/account/check`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
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
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
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
  const fetchLogs = async (currentPage = page, currentMode = modeFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        page_size: 20
      });
      if (marketFilter !== 'ALL') params.append('market', marketFilter);
      if (decisionFilter !== 'ALL') params.append('decision', decisionFilter);
      if (currentMode !== 'ALL') params.append('mode', currentMode);

      const res = await fetch(`${API_BASE}/api/trading/logs?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
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

  // Fetch Weekly Summary
  const fetchWeeklySummary = async (currentMode = modeFilter) => {
    setWeeklyLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/summary/weekly?mode=${currentMode}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setWeeklySummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch weekly summary:', err);
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Cleanup Old Logs or Clear All
  const handleCleanupLogs = async (daysToKeep = 7, clearAll = false) => {
    const confirmMsg = clearAll
      ? '정말로 모든 거래 분석 및 처리 로그 기록을 영구 삭제(초기화)하시겠습니까?'
      : `${daysToKeep}일 이전의 오래된 상세 로그를 정리하시겠습니까?\n(최근 7일간의 기록은 안전하게 보존됩니다)`;
    if (!window.confirm(confirmMsg)) return;

    setCleaningLogs(true);
    try {
      const res = await fetch(`${API_BASE}/api/trading/logs/cleanup`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          days_to_keep: daysToKeep,
          clear_all: clearAll,
          is_dry_run: modeFilter === 'DRY_RUN' ? true : (modeFilter === 'LIVE' ? false : undefined)
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: data.message || '로그 정리가 완료되었습니다.' });
        await Promise.all([fetchLogs(1, modeFilter), fetchWeeklySummary(modeFilter)]);
      } else {
        setAlertMsg({ type: 'error', text: data.message || '로그 정리 실패' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `로그 정리 오류: ${err.message}` });
    } finally {
      setCleaningLogs(false);
      setTimeout(() => setAlertMsg(null), 5000);
    }
  };

  const handleRefreshAll = async () => {
    if (!token) return;
    await Promise.all([fetchStatus(), fetchAccountStatus(), fetchLogs(page, modeFilter), fetchWeeklySummary(modeFilter)]);
  };

  // Trigger Manual Trading Loop
  const handleTriggerRun = async () => {
    setTriggering(true);
    setAlertMsg({ type: 'info', text: '실시간 시장 분석 및 트레이딩 루프를 실행 중입니다...' });
    try {
      const res = await fetch(`${API_BASE}/api/trading/trigger`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
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
        headers: getAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          access_key: accessKeyInput.trim() || undefined,
          secret_key: secretKeyInput.trim() || undefined
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
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

  // Save Strategy Engine & Risk Management Configuration
  const handleSaveLimits = async (e) => {
    e.preventDefault();
    setSavingLimits(true);
    const payload = {
      dry_run: Boolean(limitsForm.dry_run),
      min_order_krw: Number(limitsForm.min_order_krw) || 5000,
      max_order_krw_per_trade: 0,
      max_holding_coins: 0,
      max_portfolio_ratio_per_coin: 1.0,
      stop_loss_pct: Number(limitsForm.stop_loss_pct) || 10.0,
      take_profit_pct: 0.0,
      daily_max_loss_pct: 0.0,
      cooldown_minutes_after_sell: 0,
      enable_trend_filter: Boolean(limitsForm.enable_trend_filter),
      enable_breakeven_stop: false,
      breakeven_trigger_pct: 0.0,
      enable_partial_take_profit: false,
      partial_take_profit_pct: 0.0,
      partial_take_profit_ratio: 0.0,
      trailing_stop_pct: 0.0,
      max_rsi_for_buy: Number(limitsForm.max_rsi_for_buy) || 68.0,
      min_rsi_for_buy: Number(limitsForm.min_rsi_for_buy) || 38.0,
      enable_profit_reversal_exit: Boolean(limitsForm.enable_profit_reversal_exit),
      profit_reversal_threshold_pct: Number(limitsForm.profit_reversal_threshold_pct) || 1.0,
      profit_reversal_drop_pct: Number(limitsForm.profit_reversal_drop_pct) || 1.0,
      enable_profit_stagnation_exit: Boolean(limitsForm.enable_profit_stagnation_exit),
      profit_stagnation_minutes: Number(limitsForm.profit_stagnation_minutes) || 30
    };

    // Optimistic UI state sync
    setStatus(prev => prev ? { ...prev, ...payload } : prev);

    try {
      const res = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'POST',
        headers: getAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: '자동매매 전략 및 리스크 관리 설정이 저장되었습니다.' });
        setShowLimitsModal(false);
        await fetchStatus();
      } else {
        setAlertMsg({ type: 'error', text: data.message || '설정 저장 실패' });
        await fetchStatus();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `설정 저장 실패: ${err.message}` });
      await fetchStatus();
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
    
    // Optimistic UI state sync
    setStatus(prev => prev ? {
      ...prev,
      target_markets: selectedMarkets,
      candle_unit_minutes: candleUnit,
      max_holding_coins: 0
    } : prev);

    try {
      const res = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'POST',
        headers: getAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          target_markets: selectedMarkets,
          candle_unit_minutes: candleUnit,
          max_holding_coins: 0
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({
          type: 'success',
          text: `거래 품목(${selectedMarkets.length}개) 및 캔들 주기(${candleUnit}분) 설정이 저장되었습니다.`
        });
        setShowMarketModal(false);
        await fetchStatus();
      } else {
        setAlertMsg({ type: 'error', text: data.message || '품목 저장 실패' });
        await fetchStatus();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: `품목 저장 실패: ${err.message}` });
      await fetchStatus();
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
    if (!token) return;

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
  }, [token, autoRefresh, refreshInterval, marketFilter, decisionFilter, modeFilter, page]);

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

  const getMarketKoreanName = (marketCode, symbol) => {
    if (status?.positions?.[marketCode]?.korean_name) return status.positions[marketCode].korean_name;
    const inHoldings = status?.assets?.holdings?.find(h => h.market === marketCode);
    if (inHoldings?.korean_name) return inHoldings.korean_name;
    const inAvail = availableMarkets.find(m => m.market === marketCode || m.symbol === symbol);
    if (inAvail?.korean_name) return inAvail.korean_name;
    const inFallback = FALLBACK_BITHUMB_MARKETS.find(m => m.market === marketCode || m.symbol === symbol);
    if (inFallback?.korean_name) return inFallback.korean_name;
    return symbol || (marketCode ? marketCode.replace('KRW-', '') : '-');
  };

  const getCoinBgColor = (symbol = '') => {
    const sym = symbol.toUpperCase();
    if (sym === 'BTC') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (sym === 'ETH') return 'linear-gradient(135deg, #8b5cf6, #6366f1)';
    if (sym === 'XRP') return 'linear-gradient(135deg, #0284c7, #0369a1)';
    if (sym === 'SOL') return 'linear-gradient(135deg, #14b8a6, #06b6d4)';
    if (sym === 'DOGE') return 'linear-gradient(135deg, #eab308, #ca8a04)';
    if (sym === 'ADA') return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    if (sym === 'AVAX') return 'linear-gradient(135deg, #ef4444, #b91c1c)';
    if (sym === 'DOT') return 'linear-gradient(135deg, #ec4899, #be185d)';
    if (sym === 'LINK') return 'linear-gradient(135deg, #2563eb, #1e40af)';
    if (sym === 'SUI') return 'linear-gradient(135deg, #38bdf8, #0284c7)';
    if (sym === 'SHIB' || sym === 'PEPE') return 'linear-gradient(135deg, #f97316, #ea580c)';
    
    // Hash-based vibrant gradient for other altcoins
    let hash = 0;
    for (let i = 0; i < sym.length; i++) {
      hash = sym.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 75%, 50%), hsl(${hue2}, 75%, 40%))`;
  };

  // If not authenticated, display modern cyber/fintech login panel
  if (!token) {
    return (
      <div className="trading-dashboard-container" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '24px',
          padding: '44px 32px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.55), 0 0 25px rgba(16, 185, 129, 0.1)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Decorative Glow */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          {/* Glowing Lock Icon */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            padding: '18px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
          }}>
            <Lock size={32} style={{ color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={20} className="text-emerald-400" />
            <h2 style={{
              fontSize: '22px',
              fontWeight: '800',
              margin: 0,
              background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              AI 자동거래 통제 센터
            </h2>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, margin: '0 0 28px 0', maxWidth: '340px' }}>
            실시간 빗썸 시세 분석 및 자동 주문 집행 시스템입니다. 접근하려면 관리자 로그인이 필요합니다.
          </p>

          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>사용자 아이디 (ID)</label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>비밀번호 (Password)</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {loginError && (
              <div style={{
                fontSize: '12px',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.12)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                color: '#fff',
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                marginTop: '6px',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoggingIn ? 0.7 : 1,
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={(e) => {
                if (!isLoggingIn) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!isLoggingIn) e.currentTarget.style.transform = 'none';
              }}
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="spin-anim" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>로그인 및 대시보드 진입</span>
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)'
          }}>
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>256-bit 암호화 및 비인가 트레이딩 차단 보안 적용</span>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Logged in User Badge & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '13px'
          }}>
            <User size={14} className="text-emerald-400" />
            <span style={{ fontWeight: 600, color: '#34d399' }}>{username || '관리자'}</span>
            <button
              onClick={handleLogout}
              title="로그아웃"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                marginLeft: '4px',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.color = '#fca5a5';
              }}
            >
              <LogOut size={12} />
              <span>로그아웃</span>
            </button>
          </div>

          <button
            className="trading-btn btn-settings"
            onClick={openLimitsModal}
            title="1회 거래 제한 및 보유 품목 제한 설정"
          >
            <Sliders size={16} />
            <span>주문한도·품목제한 설정</span>
          </button>

          <button
            className="trading-btn btn-settings"
            onClick={openMarketModal}
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

      {/* 1. Account Verification Check Banner (Foldable) */}
      <div className="account-check-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }} onClick={() => toggleSectionFold('account')}>
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
              {!foldedSections.account && (
                <p className="account-check-desc">
                  {accountLoading ? 'Bithumb API 연결 및 계정 권한을 검증하고 있습니다...' :
                   accountStatus?.message || '거래소 API 접근 권한 상태를 확인했습니다.'}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
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
            <button
              type="button"
              className="fold-toggle-btn"
              onClick={() => toggleSectionFold('account')}
              title={foldedSections.account ? '펼치기' : '접기'}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {foldedSections.account ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
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

      {/* 2. KPI Cards Grid & Quick Selector (Foldable) */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: foldedSections.kpi ? '0' : '10px',
            cursor: 'pointer'
          }}
          onClick={() => toggleSectionFold('kpi')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} className="text-blue-400" />
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>핵심 운영 지표 & 전략 설정</span>
            {foldedSections.kpi && (
              <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                총 분석 {status?.total_logs_count || 0}회 | 손절 -{status?.stop_loss_pct || 10}% / 익절 (AI 자율 판단) | 대상 마켓 {status?.target_markets?.length || 0}종
              </span>
            )}
          </div>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {foldedSections.kpi ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {!foldedSections.kpi && (
          <>
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

              <div className="kpi-card kpi-card-interactive" onClick={openLimitsModal} title="클릭하여 전략 및 리스크 관리 설정 변경">
                <div className="kpi-icon-box bg-emerald-glow">
                  <DollarSign size={20} className="text-emerald-400" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">자동 투자 전략 ⚙️</span>
                  <span className="kpi-value text-emerald-300">
                    잔고 비례 자동 분할 매매
                  </span>
                  <span className="kpi-sub font-semibold text-emerald-400">
                    ✨ 품목 및 금액 제한 없음 (자유 투자)
                  </span>
                </div>
              </div>

              <div className="kpi-card kpi-card-interactive" onClick={openLimitsModal} title="클릭하여 리스크 관리 설정 변경">
                <div className="kpi-icon-box bg-amber-glow">
                  <ShieldAlert size={20} className="text-amber-400" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">리스크 및 익절 관리 ⚙️</span>
                  <span className="kpi-value text-amber-300">
                    손절 -{status?.stop_loss_pct || 10.0}% / 꺾임 및 체류 자동정리
                  </span>
                  <span className="kpi-sub">고점 대비 꺾임(-1.0%p) 및 이익 상태 장기 체류(30분) 감지 시 안전 익절</span>
                </div>
              </div>

              <div className="kpi-card kpi-card-interactive" onClick={openMarketModal} title="클릭하여 거래 마켓 및 품목 관리">
                <div className="kpi-icon-box bg-purple-glow">
                  <Layers size={20} className="text-purple-400" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">대상 마켓 & 캔들 주기 ⚙️</span>
                  <span className="kpi-value text-purple-300">
                    {status?.target_markets?.join(', ') || 'KRW-BTC'}
                  </span>
                  <span className="kpi-sub">{status?.candle_unit_minutes || 15}분봉 기준 분석 (총 {status?.target_markets?.length || 0}개 마켓)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Current Asset & Portfolio Summary Section (Foldable) */}
      <div className="trading-asset-section" style={{ marginBottom: '16px' }}>
        <div className="asset-section-header" style={{ cursor: 'pointer' }} onClick={() => toggleSectionFold('assets')}>
          <div className="asset-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                <Wallet size={20} className="text-emerald-400" />
                <span>현재 보유 자산 및 포트폴리오 현황</span>
              </h2>
              <span className={`mode-pill ${status?.is_dry_run ? 'mode-dry-run' : 'mode-live'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                {status?.is_dry_run ? '🟢 가상 모의투자' : '🔴 빗썸 실계좌 실시간'}
              </span>
            </div>
            <span className="asset-subtitle">
              {status?.is_dry_run
                ? '모의투자 가상 잔고 기준 (초기 자본: ₩ 1,000,000)'
                : (status?.assets?.is_live_connected
                    ? '빗썸 실제 거래소 실시간 계좌 잔고 및 보유 코인 연동'
                    : '빗썸 계정 상태 확인 필요 (API 키 및 허용 IP 확인)')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
            {status?.is_dry_run ? (
              <button
                type="button"
                className="reset-virtual-btn"
                onClick={handleResetVirtualData}
                disabled={resettingVirtual}
                title="가상 매매 시뮬레이션 데이터를 초기화하고 100만원으로 리셋합니다"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: resettingVirtual ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
              >
                <RefreshCw size={13} className={resettingVirtual ? 'spin-anim' : ''} />
                <span>{resettingVirtual ? '초기화 중...' : '가상 데이터 초기화'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="reset-live-btn"
                onClick={handleResetLiveData}
                disabled={resettingLive}
                title="실전 매매 분석 및 체결 기록(로그)을 초기화합니다. (빗썸 거래소 실자산은 안전하게 유지됩니다)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  color: '#fda4af',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: resettingLive ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)'; }}
              >
                <RefreshCw size={13} className={resettingLive ? 'spin-anim' : ''} />
                <span>{resettingLive ? '초기화 중...' : '실전 기록 초기화'}</span>
              </button>
            )}

            {status?.assets?.total_return_pct !== undefined && status?.assets?.total_return_pct !== null && (
              <div className={`total-return-badge ${(status?.assets?.total_return_pct || 0) >= 0 ? 'badge-profit' : 'badge-loss'}`}>
                <span>총 누적 수익률:</span>
                <strong>{(status?.assets?.total_return_pct || 0) >= 0 ? '+' : ''}{(status?.assets?.total_return_pct || 0).toFixed(2)}%</strong>
              </div>
            )}

            <button
              type="button"
              className="fold-toggle-btn"
              onClick={() => toggleSectionFold('assets')}
              title={foldedSections.assets ? '펼치기' : '접기'}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {foldedSections.assets ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {!foldedSections.assets && (
          <>
            {/* Real-time Dynamic Holdings Showcase Widget */}
            {(() => {
              const heldCoins = status?.assets?.held_coins_summary || status?.assets?.holdings?.filter(h => (h.volume || 0) > 0) || [];
              const heldCount = heldCoins.length;

              return (
                <div className="dynamic-holdings-showcase-card" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  marginBottom: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        padding: '6px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Layers size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                          ⚡ 실시간 보유 포트폴리오 현황
                        </span>
                        <span style={{
                          fontSize: '11px',
                          marginLeft: '8px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          fontWeight: 700,
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          {heldCount}개 종목 보유 중 (품목 수/금액 제한 없음)
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        ✅ 자동 매매 정상 가동 중 (실시간 시그널 탐색)
                      </span>
                    </div>
                  </div>

                  {heldCoins.length === 0 ? (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.65)',
                      fontSize: '13px',
                      border: '1px dashed rgba(255, 255, 255, 0.12)'
                    }}>
                      💡 현재 보유 중인 암호화폐가 없습니다. (전액 원화 100% 현금 대기 중 / 최적 진입 시그널 탐색 중)
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: '12px'
                    }}>
                      {heldCoins.map((hc) => {
                        const sym = hc.symbol || hc.market.replace('KRW-', '');
                        const korName = hc.korean_name || getMarketKoreanName(hc.market, sym);
                        const isProfit = (hc.pnl_pct || 0) >= 0;

                        return (
                          <div key={hc.market} style={{
                            background: 'rgba(15, 23, 42, 0.75)',
                            border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                            borderRadius: '10px',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Coin Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: getCoinBgColor(sym),
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                }}>
                                  {sym.slice(0, 1)}
                                </span>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#fff' }}>{korName}</div>
                                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{hc.market}</div>
                                </div>
                              </div>

                              <span style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background: isProfit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: isProfit ? '#34d399' : '#f87171',
                                border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                              }}>
                                {hc.status_tag || '보유중'}
                              </span>
                            </div>

                            {/* Evaluation & PnL */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              background: 'rgba(0, 0, 0, 0.25)',
                              padding: '8px 10px',
                              borderRadius: '8px'
                            }}>
                              <div>
                                <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>평가 금액</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9' }}>
                                  ₩ {(hc.eval_krw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>평가 손익 (수익률)</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  color: isProfit ? '#34d399' : '#f87171'
                                }}>
                                  {isProfit ? '+' : ''}₩ {(hc.pnl_krw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  {' '}({isProfit ? '+' : ''}{(hc.pnl_pct || 0).toFixed(2)}%)
                                </span>
                              </div>
                            </div>

                            {/* Volume & Avg Price Sub */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                              <span>수량: <strong>{(hc.volume || 0).toFixed(4)} {sym}</strong></span>
                              <span>평단: <strong>₩ {(hc.avg_price || 0).toLocaleString()}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

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
                  ₩ {(status?.assets?.total_net_assets || (status?.is_dry_run ? 1000000 : 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                  ₩ {(status?.assets?.krw_balance || (status?.is_dry_run ? 1000000 : 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                  {status?.assets?.holdings?.filter(h => (h.weight_pct || 0) > 0).map((h) => (
                    <div key={h.market} className="legend-item">
                      <span className="legend-dot" style={{ background: getCoinBgColor(h.symbol) }}></span>
                      <span>{h.korean_name || getMarketKoreanName(h.market, h.symbol)} ({(h.weight_pct || 0).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="allocation-progress-bar">
                <div
                  className="bar-segment bar-krw"
                  style={{ width: `${Math.max(status?.assets?.krw_weight_pct ?? 100, (status?.assets?.holdings?.some(h => (h.weight_pct || 0) > 0) ? 0 : 100))}%` }}
                  title={`KRW: ${(status?.assets?.krw_weight_pct || 100).toFixed(1)}%`}
                />
                {status?.assets?.holdings?.map((h) => (
                  (h.weight_pct || 0) > 0 ? (
                    <div
                      key={h.market}
                      className="bar-segment"
                      style={{ width: `${h.weight_pct}%`, background: getCoinBgColor(h.symbol) }}
                      title={`${h.korean_name || h.symbol}: ${(h.weight_pct || 0).toFixed(1)}%`}
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
                    <th>상태</th>
                    <th>보유 수량</th>
                    <th>매수 평균가</th>
                    <th>현재가 (24h)</th>
                    <th>매수 금액</th>
                    <th>평가 금액</th>
                    <th>평가 손익 (수익률)</th>
                    <th>비중</th>
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
                          <span className="asset-symbol">KRW (현금)</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        fontWeight: 700
                      }}>
                        보유중
                      </span>
                    </td>
                    <td>{(status?.assets?.krw_balance || (status?.is_dry_run ? 1000000 : 0)).toLocaleString()} KRW</td>
                    <td>-</td>
                    <td>1 KRW</td>
                    <td>₩ {(status?.assets?.krw_balance || (status?.is_dry_run ? 1000000 : 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td><strong>₩ {(status?.assets?.krw_balance || (status?.is_dry_run ? 1000000 : 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></td>
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
                  {status?.assets?.holdings?.map((h) => {
                    const isHeld = (h.volume || 0) > 0;
                    const korName = h.korean_name || getMarketKoreanName(h.market, h.symbol);
                    const isProfit = (h.pnl_krw || 0) >= 0;

                    return (
                      <tr key={h.market} style={{ opacity: isHeld ? 1 : 0.65, background: isHeld ? 'rgba(16, 185, 129, 0.03)' : undefined }}>
                        <td>
                          <div className="asset-name-cell">
                            <span
                              className="asset-circle"
                              style={{ background: getCoinBgColor(h.symbol), color: '#fff', fontWeight: 800 }}
                            >
                              {h.symbol.slice(0, 1)}
                            </span>
                            <div>
                              <strong>{korName}</strong>
                              <span className="asset-symbol">{h.market}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {isHeld ? (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              fontWeight: 700,
                              border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                              🟢 보유중
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#94a3b8',
                              fontWeight: 600
                            }}>
                              ⚪ 관망 (0)
                            </span>
                          )}
                        </td>
                        <td>{isHeld ? `${(h.volume || 0).toFixed(6)} ${h.symbol}` : '0.000000'}</td>
                        <td>{(h.avg_price || 0) > 0 ? `₩ ${(h.avg_price || 0).toLocaleString()}` : '-'}</td>
                        <td>
                          <div>
                            <span>{(h.current_price || 0) > 0 ? `₩ ${(h.current_price || 0).toLocaleString()}` : '-'}</span>
                            {h.change_rate_24h !== undefined && (
                              <span style={{
                                fontSize: '10px',
                                marginLeft: '4px',
                                fontWeight: 700,
                                color: (h.change_rate_24h || 0) >= 0 ? '#34d399' : '#f87171'
                              }}>
                                ({(h.change_rate_24h || 0) >= 0 ? '+' : ''}{(h.change_rate_24h || 0).toFixed(2)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{isHeld ? `₩ ${(h.buy_krw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'}</td>
                        <td>{isHeld ? <strong>₩ ${(h.eval_krw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> : '-'}</td>
                        <td>
                          {isHeld ? (
                            <span className={`pnl-tag ${isProfit ? 'tag-profit' : 'tag-loss'}`}>
                              {isProfit ? '+' : ''}₩ {(h.pnl_krw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              {' '}({isProfit ? '+' : ''}{(h.pnl_pct || 0).toFixed(2)}%)
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
                                className="mini-bar-fill"
                                style={{ width: `${h.weight_pct || 0}%`, background: getCoinBgColor(h.symbol) }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 4. Weekly Performance Summary & Log Cleanup Section (NEW - Foldable) */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '16px',
        padding: '18px 22px',
        marginBottom: '16px',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.35)'
      }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: foldedSections.weekly ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: foldedSections.weekly ? '0' : '14px',
            marginBottom: foldedSections.weekly ? '0' : '16px'
          }}
          onClick={() => toggleSectionFold('weekly')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <TrendingUp size={20} className="text-purple-400" />
            <h2 className="section-title" style={{ margin: 0 }}>
              최근 7일간 거래 성과 요약 & 로그 정리 (일주일 리포트)
            </h2>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#c4b5fd',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              fontWeight: 600
            }}>
              7 Days Summary
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleCleanupLogs(7, false)}
              disabled={cleaningLogs}
              title="7일 이전의 오래된 상세 로그를 삭제하여 시스템을 최적화합니다"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                color: '#fde047',
                fontSize: '12px',
                fontWeight: 600,
                cursor: cleaningLogs ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={12} className={cleaningLogs ? 'spin-anim' : ''} />
              <span>7일 이전 로그 정리</span>
            </button>

            <button
              type="button"
              onClick={() => handleCleanupLogs(0, true)}
              disabled={cleaningLogs}
              title="과거 모든 거래 로그를 초기화합니다"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '12px',
                fontWeight: 600,
                cursor: cleaningLogs ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span>전체 로그 초기화</span>
            </button>

            <button
              type="button"
              className="fold-toggle-btn"
              onClick={() => toggleSectionFold('weekly')}
              title={foldedSections.weekly ? '펼치기' : '접기'}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {foldedSections.weekly ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {!foldedSections.weekly && (
          <>
            {/* 7-Day Metric Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px 16px'
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>주간 총 실현 손익</span>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  marginTop: '4px',
                  color: (weeklySummary?.total_pnl_7d_krw || 0) >= 0 ? '#34d399' : '#f87171'
                }}>
                  {(weeklySummary?.total_pnl_7d_krw || 0) >= 0 ? '+' : ''}₩ {(weeklySummary?.total_pnl_7d_krw || 0).toLocaleString()}
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>최근 7일 체결 기준</span>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px 16px'
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>주간 승률 (Win Rate)</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                  {weeklySummary?.win_rate_7d ?? 0}%
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  성공 {weeklySummary?.win_trades_7d || 0}회 / 손실 {weeklySummary?.loss_trades_7d || 0}회
                </span>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px 16px'
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>주간 매수 / 매도 건수</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
                  매수 {weeklySummary?.total_buys_7d || 0}회 / 매도 {weeklySummary?.total_sells_7d || 0}회
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>총 체결 횟수</span>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="holdings-table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>분석 횟수</th>
                    <th>매수 (BUY)</th>
                    <th>매도 (SELL)</th>
                    <th>관망 (HOLD)</th>
                    <th>당일 실현 손익</th>
                    <th>당일 승률</th>
                  </tr>
                </thead>
                <tbody>
                  {(!weeklySummary?.daily_summary || weeklySummary.daily_summary.length === 0) ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        {weeklyLoading ? '주간 통계를 집계하고 있습니다...' : '최근 7일간의 기록된 데이터가 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    (weeklySummary?.daily_summary || []).map((day) => {
                      if (!day) return null;
                      const pnl = Number(day.realized_pnl_krw) || 0;
                      const winRate = Number(day.win_rate) || 0;
                      return (
                        <tr key={day.date || Math.random()}>
                          <td><strong>{day.date || '-'}</strong></td>
                          <td>{day.total_cycles ?? 0} 회</td>
                          <td><span className="text-emerald-400 font-bold">{day.buys ?? 0}</span></td>
                          <td><span className="text-rose-400 font-bold">{day.sells ?? 0}</span></td>
                          <td><span className="text-gray-400">{day.holds ?? 0}</span></td>
                          <td>
                            <span className={`font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {pnl >= 0 ? '+' : ''}₩ {pnl.toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: winRate >= 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: winRate >= 50 ? '#34d399' : '#94a3b8',
                              fontWeight: 700,
                              fontSize: '11px'
                            }}>
                              {winRate}% ({day.win_trades ?? 0}승 {day.loss_trades ?? 0}패)
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 5. Target Market Live Positions (Foldable) */}
      {status?.positions && Object.keys(status.positions).length > 0 && (
        <div className="market-cards-section" style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: foldedSections.marketCards ? '0' : '12px'
            }}
            onClick={() => toggleSectionFold('marketCards')}
          >
            <h2 className="section-title" style={{ margin: 0 }}>
              <Activity size={18} />
              <span>실시간 마켓 현황 & 포지션</span>
            </h2>
            <button
              type="button"
              className="fold-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleSectionFold('marketCards');
              }}
              title={foldedSections.marketCards ? '펼치기' : '접기'}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {foldedSections.marketCards ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          {!foldedSections.marketCards && (
            <div className="market-cards-grid">
              {Object.entries(status?.positions || {})
                .sort(([m1, p1], [m2, p2]) => (((p2?.holding_volume) || 0) > 0 ? 1 : 0) - (((p1?.holding_volume) || 0) > 0 ? 1 : 0))
                .map(([mkt, pos]) => {
                  if (!pos) return null;
                  const sym = pos.symbol || mkt.replace('KRW-', '');
                  const korName = pos.korean_name || getMarketKoreanName(mkt, sym);
                  const isHolding = (pos.holding_volume || 0) > 0;
                  const isProfit = (pos.pnl_pct || 0) >= 0;

                  return (
                    <div
                      key={mkt}
                      className="market-card"
                      style={{
                        borderColor: isHolding
                          ? 'rgba(52, 211, 153, 0.55)'
                          : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: isHolding
                          ? '0 6px 20px rgba(16, 185, 129, 0.12), 0 0 12px rgba(16, 185, 129, 0.1)'
                          : undefined,
                        background: isHolding
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(15, 23, 42, 0.8) 100%)'
                          : undefined
                      }}
                    >
                      <div className="market-card-header">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: getCoinBgColor(sym),
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '11px'
                            }}>
                              {sym.slice(0, 1)}
                            </span>
                            <strong style={{ fontSize: '15px', color: '#fff' }}>{korName}</strong>
                            <span className="market-name" style={{ fontSize: '11px', color: '#94a3b8' }}>{mkt}</span>

                            {isHolding && (
                              <span style={{
                                fontSize: '10px',
                                background: 'rgba(16, 185, 129, 0.25)',
                                color: '#34d399',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 800,
                                border: '1px solid rgba(16, 185, 129, 0.45)'
                              }}>
                                🎯 보유 중
                              </span>
                            )}
                          </div>
                          <span className="market-last-update">최근 갱신: {pos.last_updated ? new Date(pos.last_updated).toLocaleTimeString() : '-'}</span>
                        </div>
                        {getTrendBadge(pos.trend)}
                      </div>

                      <div className="market-price-row">
                        <span className="price-label">현재가</span>
                        <div className="flex items-center gap-2">
                          <span className="price-value">{(pos.current_price || 0) > 0 ? `${(pos.current_price || 0).toLocaleString()} KRW` : '-'}</span>
                          {pos.change_rate_24h !== undefined && pos.change_rate_24h !== null && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${(pos.change_rate_24h || 0) >= 0 ? 'text-emerald-400 bg-emerald-950/50' : 'text-rose-400 bg-rose-950/50'}`}>
                              {(pos.change_rate_24h || 0) >= 0 ? '+' : ''}{(pos.change_rate_24h || 0).toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Holding Position Highlight Card if Held */}
                      {isHolding && (
                        <div style={{
                          background: 'rgba(15, 23, 42, 0.65)',
                          border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          borderRadius: '8px',
                          padding: '8px 10px',
                          margin: '8px 0',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                          fontSize: '11px'
                        }}>
                          <div>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>보유 수량 / 평단</span>
                            <span style={{ fontWeight: 700, color: '#f1f5f9' }}>
                              {(pos.holding_volume || 0).toFixed(4)} {sym}
                            </span>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                              ₩ {(pos.holding_avg_price || 0).toLocaleString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>평가 손익 (수익률)</span>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '12px',
                              color: isProfit ? '#34d399' : '#f87171'
                            }}>
                              {isProfit ? '+' : ''}₩ {Math.round(pos.pnl_krw || 0).toLocaleString()}
                            </span>
                            <div style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: isProfit ? '#34d399' : '#f87171'
                            }}>
                              ({isProfit ? '+' : ''}{(pos.pnl_pct || 0).toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="indicator-mini-grid">
                        <div className="mini-stat">
                          <span className="mini-stat-label">RSI (14)</span>
                          <span className={`mini-stat-val ${pos.rsi > 68 ? 'text-red-400 font-bold' : pos.rsi < 38 ? 'text-blue-400 font-bold' : 'text-emerald-400'}`}>
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
                          <span className="mini-stat-val">{(pos.holding_volume || 0) > 0 ? (pos.holding_volume).toFixed(4) : '0'}</span>
                        </div>
                        <div className="mini-stat">
                          <span className="mini-stat-label">수익률</span>
                          <span className={`mini-stat-val font-bold ${(pos.pnl_pct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(pos.pnl_pct || 0) >= 0 ? '+' : ''}{(pos.pnl_pct || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 6. Logs Table Section (Foldable) */}
      <div className="trading-logs-section">
        <div className="logs-header-row" style={{ cursor: 'pointer' }} onClick={() => toggleSectionFold('logs')}>
          <div className="logs-title-area">
            <h2 className="section-title" style={{ margin: 0 }}>
              <Clock size={18} />
              <span>실시간 처리 및 시장 분석 로그 ({totalCount}건)</span>
            </h2>
          </div>

          {/* Filters & Actions */}
          <div className="filter-controls" onClick={(e) => e.stopPropagation()}>
            <div className="filter-group">
              <select
                className="trading-select"
                value={modeFilter}
                onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
                style={{
                  borderColor: modeFilter === 'LIVE' ? 'rgba(244, 63, 94, 0.5)' : modeFilter === 'DRY_RUN' ? 'rgba(16, 185, 129, 0.5)' : undefined
                }}
              >
                <option value="ALL">전체 매매 모드</option>
                <option value="DRY_RUN">🟢 모의투자 (가상) 로그</option>
                <option value="LIVE">🔴 실전매매 (실계좌) 로그</option>
              </select>
            </div>

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

            <button
              type="button"
              className="fold-toggle-btn"
              onClick={() => toggleSectionFold('logs')}
              title={foldedSections.logs ? '펼치기' : '접기'}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {foldedSections.logs ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {!foldedSections.logs && (
          <>
            {/* Logs Table */}
            <div className="table-responsive-container">
          <table className="trading-logs-table">
            <thead>
              <tr>
                <th>일시</th>
                <th>마켓 / 모드</th>
                <th>현재가</th>
                <th>보조지표 (RSI / Trend)</th>
                <th>LLM 판단 & 신뢰도</th>
                <th>실행 액션</th>
                <th>실현 손익 (수익률)</th>
                <th>상세 사유</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    {loading ? '로그를 불러오는 중입니다...' : '기록된 처리 로그가 없습니다.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const hasPnl = log.pnl_krw != null && log.pnl_krw !== 0;
                  const isSellAction = log.action_taken && (
                    log.action_taken.includes('SELL') ||
                    log.action_taken.includes('PROFIT') ||
                    log.action_taken.includes('LOSS')
                  );
                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`log-row ${isExpanded ? 'row-expanded' : ''}`} onClick={() => toggleExpandLog(log.id)}>
                        <td className="time-cell">{log.timestamp || '-'}</td>
                        <td className="market-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="market-tag">{log.market}</span>
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              background: log.is_dry_run ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                              color: log.is_dry_run ? '#34d399' : '#fb7185',
                              border: `1px solid ${log.is_dry_run ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}>
                              {log.is_dry_run ? '모의' : '실전'}
                            </span>
                          </div>
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
                        <td className="pnl-cell font-mono">
                          {hasPnl ? (
                            <span className={`pnl-tag ${log.pnl_krw >= 0 ? 'tag-profit' : 'tag-loss'}`}>
                              {log.pnl_krw >= 0 ? '+' : ''}₩ {Math.round(log.pnl_krw).toLocaleString()}
                              {' '}({(log.pnl_pct || 0) >= 0 ? '+' : ''}{(log.pnl_pct || 0).toFixed(2)}%)
                            </span>
                          ) : isSellAction ? (
                            <span className="pnl-tag tag-profit" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                              0 ₩ (0.00%)
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
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
                          <td colSpan="8">
                            <div className="log-detail-box">
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <span className="detail-label">실현 손익 (수익률)</span>
                                  <span className={`detail-val ${hasPnl ? (log.pnl_krw >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold') : ''}`}>
                                    {hasPnl
                                      ? `${log.pnl_krw >= 0 ? '+' : ''}${Math.round(log.pnl_krw).toLocaleString()} KRW (${(log.pnl_pct || 0) >= 0 ? '+' : ''}${(log.pnl_pct || 0).toFixed(2)}%)`
                                      : (isSellAction ? '0 KRW (0.00%)' : '-')}
                                  </span>
                                </div>
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
          </>
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
                <h2>자동매매 전략 & 리스크 관리 설정</h2>
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

                {/* 비상 손절 및 AI 자율 익절 설정 */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ShieldAlert size={18} className="text-rose-400" />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#fda4af' }}>
                      비상 하드 손절 (Stop Loss) 설정
                    </span>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">
                      <span className="text-rose-400 font-bold">손절 기준선 (%)</span>
                    </label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="trading-input font-mono text-rose-400"
                        min="1.0"
                        max="50.0"
                        step="0.5"
                        value={limitsForm.stop_loss_pct}
                        onChange={(e) => setLimitsForm({ ...limitsForm, stop_loss_pct: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
                      />
                      <span className="suffix">%</span>
                    </div>
                    <div className="amt-chips mt-2">
                      {[5, 7, 10, 15, 20].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          className={`amt-chip ${Number(limitsForm.stop_loss_pct) === pct ? 'active font-bold text-rose-300' : ''}`}
                          onClick={() => setLimitsForm({ ...limitsForm, stop_loss_pct: pct })}
                        >
                          -{pct}% {pct === 10 ? '(기본 권장)' : ''}
                        </button>
                      ))}
                    </div>
                    <span className="input-hint mt-1">진입가 대비 해당 손실률에 도달하면 2초 이내 즉시 시장가로 전량 손절합니다.</span>
                  </div>
                </div>

                {/* 이익 상태 하락 꺾임 & 장기 체류 정리 설정 */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <TrendingUp size={18} className="text-emerald-400" />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#6ee7b7' }}>
                      수익 보존: 하락 반전 꺾임 & 장기 체류 정리
                    </span>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group mb-2">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label mb-0">
                          <span className="text-emerald-400 font-bold">고점 대비 꺾임 되밀림 폭 (%)</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={limitsForm.enable_profit_reversal_exit}
                          onChange={(e) => setLimitsForm({ ...limitsForm, enable_profit_reversal_exit: e.target.checked })}
                        />
                      </div>
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          className="trading-input font-mono text-emerald-400"
                          min="0.5"
                          max="10.0"
                          step="0.5"
                          disabled={!limitsForm.enable_profit_reversal_exit}
                          value={limitsForm.profit_reversal_drop_pct}
                          onChange={(e) => setLimitsForm({ ...limitsForm, profit_reversal_drop_pct: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
                        />
                        <span className="suffix">%p</span>
                      </div>
                      <span className="input-hint">수익 중 최고 수익률 대비 해당 수치 이상 되밀릴 시 즉시 익절</span>
                    </div>

                    <div className="form-group mb-2">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label mb-0">
                          <span className="text-blue-300 font-bold">수익 상태 장기 체류 한도 (분)</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={limitsForm.enable_profit_stagnation_exit}
                          onChange={(e) => setLimitsForm({ ...limitsForm, enable_profit_stagnation_exit: e.target.checked })}
                        />
                      </div>
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          className="trading-input font-mono text-blue-300"
                          min="10"
                          max="360"
                          step="10"
                          disabled={!limitsForm.enable_profit_stagnation_exit}
                          value={limitsForm.profit_stagnation_minutes}
                          onChange={(e) => setLimitsForm({ ...limitsForm, profit_stagnation_minutes: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                        />
                        <span className="suffix">분</span>
                      </div>
                      <span className="input-hint">수익 상태에서 추가 고점 돌파 없이 횡보 지속 시 익절 청산</span>
                    </div>
                  </div>
                </div>

                {/* AI 자율 익절 및 청산 안내 카드 */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#6ee7b7' }}>
                      AI 실시간 자율 익절 & 분할 매도
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                    기계적인 고정 익절선 대신 <strong>LLM 인공지능</strong>이 실시간 캔들 프라이스 액션, 저항/지지 레벨, 유동성 수급 흐름을 분석하여 <strong>최적의 타이밍에 전량 익절 및 50% 분할 매도</strong>를 자율적으로 집행합니다.
                  </p>
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
                  {savingLimits ? '저장 중...' : '설정 저장'}
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
                    🎯 단일 1종 (BTC 전용)
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
