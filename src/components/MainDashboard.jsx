import React, { useState, useEffect } from 'react';
import { Bot, Database, TrendingUp, Sparkles, Activity, ShieldCheck, Cpu, ArrowRight, Search, FileText, Layers, RefreshCw, Bookmark, Zap, Server } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'https://ragweed-blighted-skylight.ngrok-free.dev' : '');

export default function MainDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    agentTasks: 12,
    agentSkills: 8,
    mabiChars: 3,
    mabiItems: 14,
    mabiNotes: 5,
    serverStatus: 'Online'
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/stats/summary`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          mabiChars: data.characters_count || prev.mabiChars,
          mabiItems: data.items_count || prev.mabiItems,
          mabiNotes: data.notes_count || prev.mabiNotes,
          serverStatus: data.system_status || 'Online'
        }));
      }
    } catch (err) {
      console.log('Failed to fetch summary stats, using fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="main-dashboard-container">
      {/* Hero Welcome Section */}
      <div className="dashboard-hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="badge-icon" size={14} />
            <span>Multi-System Control Center v2.0</span>
          </div>
          <h1 className="hero-title">
            통합 블로그 대시보드 <span className="gradient-text">Hub</span>
          </h1>
          <p className="hero-subtitle">
            AI 에이전트 시스템 제어 및 마비노기 아카이브 데이터 관리/실시간 API 조회 시스템
          </p>
          <div className="hero-actions">
            <button className="primary-btn pulse-glow" onClick={() => onNavigate('agent')}>
              <Bot size={18} />
              <span>Agent AI 시스템</span>
              <ArrowRight size={16} />
            </button>
            <button className="secondary-btn" onClick={() => onNavigate('mabinogi')}>
              <Database size={18} />
              <span>마비노기 아카이브</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick System Metrics Cards */}
        <div className="hero-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper agent">
              <Bot size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">AI Agent 상태</span>
              <div className="stat-val-group">
                <span className="stat-value">정상 가동 중</span>
                <span className="status-dot online"></span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper server">
              <Server size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">백엔드 API 서버</span>
              <div className="stat-val-group">
                <span className="stat-value">{stats.serverStatus}</span>
                <button className="refresh-mini-btn" onClick={fetchStats} title="새로고침">
                  <RefreshCw size={12} className={loading ? 'spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper mabi">
              <Database size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">마비노기 아카이브</span>
              <span className="stat-value">{stats.mabiItems + stats.mabiChars + stats.mabiNotes} 개 수집</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Cards Navigation */}
      <div className="section-header">
        <h2>시스템 모듈 선택</h2>
        <p>이동하고자 하는 대시보드 모듈을 선택하세요.</p>
      </div>

      <div className="module-cards-grid">
        {/* Module Card 1: Agent AI */}
        <div className="module-card agent-card" onClick={() => onNavigate('agent')}>
          <div className="module-card-header">
            <div className="module-tag agent">AI Autonomous</div>
            <Bot size={32} className="module-main-icon" />
          </div>
          <h3>Agent AI 기능 페이지</h3>
          <p>
            음성 대화 및 텍스트 프롬프트 기반 자율 실행 에이전트. Skill 스토어, 백그라운드 태스크 모니터링, 실시간 로그 및 자격증명 관리.
          </p>
          <div className="module-highlights">
            <div className="highlight-item">
              <Zap size={14} />
              <span>실시간 Voice / Chat Assistant</span>
            </div>
            <div className="highlight-item">
              <Cpu size={14} />
              <span>Custom Skill 워크숍 및 샌드박스</span>
            </div>
            <div className="highlight-item">
              <Activity size={14} />
              <span>백그라운드 프로세스 실시간 텔레메트리</span>
            </div>
          </div>
          <div className="module-footer">
            <span>Agent 페이지로 이동</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Module Card 2: AI Auto Trading */}
        <div className="module-card trading-card" onClick={() => onNavigate('trading')}>
          <div className="module-card-header">
            <div className="module-tag trading">Bithumb Quant AI</div>
            <TrendingUp size={32} className="module-main-icon" />
          </div>
          <h3>AI 빗썸 자동거래</h3>
          <p>
            실시간 빗썸 시세와 보조지표(RSI, MACD 등)를 수집하여 LLM 시장 분석 기반으로 안전하게 주문을 집행하는 퀀트 자동거래 시스템.
          </p>
          <div className="module-highlights">
            <div className="highlight-item">
              <Zap size={14} />
              <span>실시간 보조지표 연산 & LLM 의사결정</span>
            </div>
            <div className="highlight-item">
              <ShieldCheck size={14} />
              <span>손절/익절/서킷브레이커 리스크 가드레일</span>
            </div>
            <div className="highlight-item">
              <Activity size={14} />
              <span>모의투자(Dry-Run) 및 실시간 처리 로그</span>
            </div>
          </div>
          <div className="module-footer">
            <span>자동거래 페이지로 이동</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Module Card 3: Mabinogi Archive */}
        <div className="module-card mabi-card" onClick={() => onNavigate('mabinogi')}>
          <div className="module-card-header">
            <div className="module-tag mabi">Nexon Open API</div>
            <Database size={32} className="module-main-icon" />
          </div>
          <h3>마비노기 아카이브 및 실시간 API</h3>
          <p>
            넥슨 마비노기 Open API를 활용한 캐릭터/경매장 실시간 정보 조회 및 데이터 아카이브 관리 시스템 (아이템, 스냅샷, 빌드 노트).
          </p>
          <div className="module-highlights">
            <div className="highlight-item">
              <Search size={14} />
              <span>넥슨 Open API 실시간 캐릭터 & 경매장 조회</span>
            </div>
            <div className="highlight-item">
              <Layers size={14} />
              <span>아이템 & 장비 아카이브 데이터베이스</span>
            </div>
            <div className="highlight-item">
              <FileText size={14} />
              <span>공략 노트 및 빌드 스크랩북 관리</span>
            </div>
          </div>
          <div className="module-footer">
            <span>마비노기 페이지로 이동</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* Overview & Quick Metrics Dashboard Row */}
      <div className="dashboard-metrics-section">
        <div className="metrics-box">
          <div className="box-header">
            <Activity size={18} />
            <h4>아카이브 수집 현황 요약</h4>
          </div>
          <div className="metrics-list">
            <div className="metric-row">
              <span className="metric-name">저장된 캐릭터 스냅샷</span>
              <span className="metric-num">{stats.mabiChars} 건</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">아카이브 등록 아이템</span>
              <span className="metric-num">{stats.mabiItems} 건</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">작성된 아카이브 노트</span>
              <span className="metric-num">{stats.mabiNotes} 건</span>
            </div>
          </div>
        </div>

        <div className="metrics-box">
          <div className="box-header">
            <ShieldCheck size={18} />
            <h4>시스템 연결 정보</h4>
          </div>
          <div className="system-status-list">
            <div className="status-row">
              <span>백엔드 API 엔드포인트</span>
              <code>{API_BASE || 'Relative Proxy (/api)'}</code>
            </div>
            <div className="status-row">
              <span>DB 스키마 타겟</span>
              <span className="badge-tag">SQLite / PostgreSQL</span>
            </div>
            <div className="status-row">
              <span>Nexon Open API 상태</span>
              <span className="badge-tag green">Open API V1 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
