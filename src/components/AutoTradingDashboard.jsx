import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, Play, ShieldAlert,
  Sliders, Activity, CheckCircle, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Layers, Clock, DollarSign, Cpu, Search, Filter,
  ChevronDown, ChevronUp, AlertCircle, Info, Sparkles,
  Wallet, PieChart, Coins, Banknote, Percent, ArrowRight
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
      }
    } catch (err) {
      console.error('Failed to fetch trading status:', err);
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
    await Promise.all([fetchStatus(), fetchLogs(page)]);
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

  // Auto-refresh interval effect
  useEffect(() => {
    handleRefreshAll();

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

        {/* Action Controls */}
        <div className="header-controls">
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
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
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
            <span className="kpi-label">1회 최대 주문 한도</span>
            <span className="kpi-value">{status?.max_order_krw?.toLocaleString() || '50,000'} KRW</span>
            <span className="kpi-sub">캔들 주기: {status?.candle_unit_minutes || 15}분봉</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-glow">
            <ShieldAlert size={20} className="text-amber-400" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">리스크 가드레일</span>
            <span className="kpi-value text-amber-300">손절 -{status?.stop_loss_pct || 3.0}% / 익절 +{status?.take_profit_pct || 5.0}%</span>
            <span className="kpi-sub">하드 리스크 컷 자동 감시</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-glow">
            <Layers size={20} className="text-purple-400" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">대상 마켓</span>
            <span className="kpi-value text-purple-300">{status?.target_markets?.join(', ') || 'KRW-BTC, KRW-ETH'}</span>
            <span className="kpi-sub">빗썸 원화(KRW) 마켓</span>
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
                  <span className="price-value">{pos.current_price > 0 ? `${pos.current_price.toLocaleString()} KRW` : '-'}</span>
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
                <option value="KRW-BTC">KRW-BTC</option>
                <option value="KRW-ETH">KRW-ETH</option>
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
    </div>
  );
}
