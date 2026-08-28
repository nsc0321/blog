import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Search, CheckCircle2, Clock, Filter, Eye, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function TradingLogBox() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL'); // 'ALL' | 'DRY_RUN' | 'LIVE'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const mParam = marketFilter !== 'ALL' ? `&market=${encodeURIComponent(marketFilter)}` : '';
      const dParam = decisionFilter !== 'ALL' ? `&decision=${encodeURIComponent(decisionFilter)}` : '';
      const modeParam = modeFilter !== 'ALL' ? `&mode=${encodeURIComponent(modeFilter)}` : '';
      const resp = await fetch(`${API_BASE}/api/trading/logs?page=${page}&page_size=15${mParam}${dParam}${modeParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await resp.json();
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total_count || data.logs.length);
      }
    } catch (err) {
      console.log('Fetch trading logs note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, marketFilter, decisionFilter, modeFilter]);

  return (
    <Box
      title="4. Trading Log Box (자동매매 & 시장 분석 실시간 감사 로그)"
      subtitle="실시간 8차원 벡터 총합(v_net), 매도 시 실현 거래 차익(손익 KRW) 및 주문 집행 감사 이력"
      icon={Terminal}
      badge="Audit Trail"
      badgeType="info"
      actions={
        <button
          onClick={fetchLogs}
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
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <select
          value={decisionFilter}
          onChange={(e) => { setDecisionFilter(e.target.value); setPage(1); }}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 10px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="ALL" style={{ background: '#121225' }}>전체 신호 (BUY/SELL/HOLD)</option>
          <option value="BUY" style={{ background: '#121225' }}>🟢 매수 (BUY)</option>
          <option value="SELL" style={{ background: '#121225' }}>🔴 매도 (SELL)</option>
          <option value="HOLD" style={{ background: '#121225' }}>🟡 관망 (HOLD)</option>
        </select>

        <select
          value={modeFilter}
          onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 10px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="ALL" style={{ background: '#121225' }}>전체 모드</option>
          <option value="DRY_RUN" style={{ background: '#121225' }}>🛡️ 모의투자 (Dry-Run)</option>
          <option value="LIVE" style={{ background: '#121225' }}>⚡ 실전투자 (Live)</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
          총 {totalCount}개 기록
        </span>
      </div>

      {/* Logs Table */}
      <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px' }}>일시</th>
              <th style={{ padding: '8px 10px' }}>마켓</th>
              <th style={{ padding: '8px 10px' }}>신호</th>
              <th style={{ padding: '8px 10px' }}>체결/현재가</th>
              <th style={{ padding: '8px 10px' }}>벡터 총합 (v_net)</th>
              <th style={{ padding: '8px 10px' }}>매도 실현 차익 (손익 KRW / %)</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>상세</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isBuy = log.decision === 'BUY';
              const isSell = log.decision === 'SELL';

              // Extract Directional Vector Total (v_net)
              const rawDec = log.raw_decision || {};
              let vNet = rawDec.net_directional_score !== undefined
                ? rawDec.net_directional_score
                : (rawDec.predicted_net !== undefined
                  ? rawDec.predicted_net
                  : (rawDec.vector?.v_net !== undefined ? rawDec.vector.v_net : null));
              
              if (vNet === null && log.rsi) {
                vNet = (log.rsi - 50.0) / 50.0;
              }

              const vNetNum = typeof vNet === 'number' ? vNet : parseFloat(vNet || 0);
              const isVNetPos = vNetNum >= 0;

              // Check if actual SELL occurred (Decision == SELL or action_taken contains SELL/STOP_LOSS/TAKE_PROFIT/PROFIT_REVERSAL)
              const actionStr = (log.action_taken || '').toUpperCase();
              const isActualSell = isSell || actionStr.includes('SELL') || actionStr.includes('STOP_LOSS') || actionStr.includes('TAKE_PROFIT') || actionStr.includes('PROFIT_REVERSAL') || actionStr.includes('STAGNATION_EXIT');

              // Calculate Trade Profit ONLY on actual Sell
              const curPrice = parseFloat(log.current_price || 0);
              const avgPrice = parseFloat(log.holding_avg_price || 0);
              const volume = parseFloat(log.holding_volume || 0);

              let pnlKrw = log.pnl_krw;
              let pnlPct = log.pnl_pct;

              if (isActualSell) {
                if ((pnlKrw === undefined || pnlKrw === null || pnlKrw === 0) && avgPrice > 0 && curPrice > 0) {
                  pnlKrw = (curPrice - avgPrice) * (volume > 0 ? volume : 1.0);
                }
                if ((pnlPct === undefined || pnlPct === null || pnlPct === 0) && avgPrice > 0 && curPrice > 0) {
                  pnlPct = ((curPrice - avgPrice) / avgPrice) * 100.0;
                }
              }

              const hasSellPnl = isActualSell && (pnlKrw !== undefined && pnlKrw !== null);
              const isPnlPos = (pnlKrw || 0) >= 0;

              return (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '8px 10px', color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f8fafc' }}>
                    {log.market}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isBuy ? 'rgba(16, 185, 129, 0.2)' : isSell ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: isBuy ? '#34d399' : isSell ? '#f87171' : '#fbbf24'
                    }}>
                      {log.decision}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                    ₩{Number(log.current_price || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isVNetPos ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isVNetPos ? '#34d399' : '#f87171',
                      fontFamily: 'monospace'
                    }}>
                      {isVNetPos ? `+${vNetNum.toFixed(2)}` : vNetNum.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {isActualSell && hasSellPnl ? (
                      <span style={{
                        color: isPnlPos ? '#34d399' : '#f87171',
                        fontWeight: 800,
                        fontSize: '12px'
                      }}>
                        {isPnlPos ? `+₩${Math.round(pnlKrw).toLocaleString()}` : `-₩${Math.round(Math.abs(pnlKrw)).toLocaleString()}`}
                        <span style={{ opacity: 0.85, marginLeft: '4px', fontSize: '11px' }}>
                          ({isPnlPos ? `+${(pnlPct || 0).toFixed(2)}%` : `${(pnlPct || 0).toFixed(2)}%`})
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '11px' }}>
                        -
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#c4b5fd',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Eye size={12} />
                      <span>보기</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: '#cbd5e1',
            cursor: page <= 1 ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
          페이지 <strong>{page}</strong> / {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: '#cbd5e1',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Detail JSON Modal */}
      {selectedLog && (
        <div className="server-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="server-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="server-modal-header">
              <h3>분석 판단 & 거래 상세 로그 (#{selectedLog.id} - {selectedLog.market})</h3>
              <button className="server-modal-close" onClick={() => setSelectedLog(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>판단 사유 (Reason):</div>
                <div style={{ fontSize: '13px', color: '#f8fafc', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedLog.reason}
                </div>
              </div>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                color: '#38bdf8',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
