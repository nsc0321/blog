import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Bot, Database, TrendingUp, Sparkles, Menu, X, Server, Wifi, WifiOff, Settings, CheckCircle2, AlertCircle, RefreshCw, Globe, ExternalLink } from 'lucide-react';
import MainDashboard from './components/MainDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import MabinogiArchive from './components/MabinogiArchive';
import AutoTradingDashboard from './components/AutoTradingDashboard';
import { getApiBase, setCustomApiBase, getCustomApiBase, testApiConnection, DEFAULT_FALLBACK_API } from './config';

const getPageFromPath = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  
  // 1. URL search params check (?page=agent, ?page=trading, ?page=mabinogi)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const pParam = searchParams.get('page') || searchParams.get('tab');
    if (pParam) {
      const lowerP = pParam.toLowerCase();
      if (lowerP.includes('trading')) return 'trading';
      if (lowerP.includes('agent') || lowerP.includes('agnet')) return 'agent';
      if (lowerP.includes('mabinogi')) return 'mabinogi';
    }
  } catch (e) {}

  // 2. /blog/trading 또는 #trading 또는 /trading
  if (path.includes('trading') || hash.includes('trading')) {
    return 'trading';
  }

  // 3. /blog/agent 또는 /blog/agnet 또는 #agent 또는 /agent
  if (path.includes('agent') || path.includes('agnet') || hash.includes('agent') || hash.includes('agnet')) {
    return 'agent';
  }

  // 4. /blog/mabinogi 또는 #mabinogi 또는 /mabinogi
  if (path.includes('mabinogi') || hash.includes('mabinogi')) {
    return 'mabinogi';
  }

  // 기본 접속 -> 메인 대시보드
  return 'dashboard';
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Page Render Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: '#f87171' }}>⚠️ 화면을 불러오는 중 오류가 발생했습니다</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px' }}>
            {this.state.error ? this.state.error.message : '알 수 없는 오류'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            style={{
              background: 'var(--accent-gradient)',
              border: 'none',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            메인 대시보드로 돌아가기
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState(getPageFromPath);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Server Status & API Configuration State
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [showServerModal, setShowServerModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(() => getCustomApiBase());
  const [testResult, setTestResult] = useState(null); // { testing: boolean, ok: boolean, message: string }
  const [currentApiUrl, setCurrentApiUrl] = useState(() => getApiBase());

  const checkStatus = async () => {
    setServerStatus('checking');
    const res = await testApiConnection();
    if (res.ok) {
      setServerStatus('online');
    } else {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [currentApiUrl]);

  const handleTestConnection = async () => {
    setTestResult({ testing: true, ok: false, message: '연결 테스트 중...' });
    const target = customUrlInput ? customUrlInput.trim() : currentApiUrl;
    const res = await testApiConnection(target);
    if (res.ok) {
      setTestResult({ testing: false, ok: true, message: '✅ 백엔드 API 서버에 정상적으로 연결되었습니다!' });
    } else {
      setTestResult({ testing: false, ok: false, message: `❌ 연결 실패: ${res.error || '서버가 응답하지 않습니다.'}` });
    }
  };

  const handleSaveServerUrl = () => {
    setCustomApiBase(customUrlInput);
    const newBase = getApiBase();
    setCurrentApiUrl(newBase);
    setShowServerModal(false);
    setTestResult(null);
    checkStatus();
    // Reload page to rebind all static references and components cleanly
    window.location.reload();
  };

  const handleResetServerUrl = () => {
    setCustomApiBase('');
    setCustomUrlInput('');
    const newBase = getApiBase();
    setCurrentApiUrl(newBase);
    setShowServerModal(false);
    setTestResult(null);
    checkStatus();
    window.location.reload();
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);

    // 환경별 Base Path 감지 (/blog 포함 여부)
    const currentPath = window.location.pathname.toLowerCase();
    const hasBlogPrefix = currentPath.includes('/blog');
    const basePrefix = hasBlogPrefix ? '/blog' : '';

    let targetPath = basePrefix || '/blog';
    if (page === 'trading') {
      targetPath = `${basePrefix}/trading`;
    } else if (page === 'agent') {
      targetPath = `${basePrefix}/agent`;
    } else if (page === 'mabinogi') {
      targetPath = `${basePrefix}/mabinogi`;
    } else {
      targetPath = basePrefix || '/blog';
    }

    try {
      window.history.pushState({ page }, '', targetPath);
    } catch (e) {
      window.location.hash = page === 'dashboard' ? '' : page;
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setActivePage(event.state.page);
      } else {
        setActivePage(getPageFromPath());
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="app-container">
      {/* Background Glow Effects */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Main Top Navigation Header */}
      <header className="app-top-header">
        <div className="header-left">
          <div className="brand-logo" onClick={() => handleNavigate('dashboard')}>
            <Sparkles className="logo-sparkle" size={20} />
            <span className="brand-name">OCTO<span className="brand-highlight">HUB</span></span>
          </div>
          <span className="version-pill">v2.5</span>
        </div>

        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button
            className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>메인 대시보드</span>
          </button>
          <button
            className={`nav-link ${activePage === 'trading' ? 'active' : ''}`}
            onClick={() => handleNavigate('trading')}
          >
            <TrendingUp size={18} />
            <span>AI 자동거래</span>
          </button>
          <button
            className={`nav-link ${activePage === 'agent' ? 'active' : ''}`}
            onClick={() => handleNavigate('agent')}
          >
            <Bot size={18} />
            <span>Agent AI</span>
          </button>
          <button
            className={`nav-link ${activePage === 'mabinogi' ? 'active' : ''}`}
            onClick={() => handleNavigate('mabinogi')}
          >
            <Database size={18} />
            <span>마비노기 아카이브</span>
          </button>
        </nav>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Server Connection Status & Config Button */}
          <button
            className={`server-status-badge ${serverStatus === 'online' ? 'status-online' : serverStatus === 'offline' ? 'status-offline' : 'status-checking'}`}
            onClick={() => {
              setCustomUrlInput(getCustomApiBase());
              setShowServerModal(true);
            }}
            title="API 백엔드 서버 연결 상태 및 주소 변경"
          >
            {serverStatus === 'online' ? <Wifi size={14} /> : serverStatus === 'offline' ? <WifiOff size={14} /> : <RefreshCw size={14} className="animate-spin" />}
            <span>{serverStatus === 'online' ? 'API 연결됨' : serverStatus === 'offline' ? 'API 오프라인 (설정)' : '연결 확인중'}</span>
          </button>

          <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Page Content View */}
      <main className="main-content-view">
        <ErrorBoundary onReset={() => handleNavigate('dashboard')}>
          {activePage === 'dashboard' && <MainDashboard onNavigate={(page) => handleNavigate(page)} />}
          {activePage === 'trading' && <AutoTradingDashboard />}
          {activePage === 'agent' && <VoiceAssistant />}
          {activePage === 'mabinogi' && <MabinogiArchive />}
        </ErrorBoundary>
      </main>

      {/* Server Settings Modal */}
      {showServerModal && (
        <div className="server-modal-overlay" onClick={() => setShowServerModal(false)}>
          <div className="server-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="server-modal-header">
              <h3>
                <Server size={20} style={{ color: '#8b5cf6' }} />
                백엔드 API 서버 연결 설정
              </h3>
              <button className="server-modal-close" onClick={() => setShowServerModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="server-url-box">
              <div className="server-url-label">현재 적용된 API 주소:</div>
              <div className="server-url-current">{currentApiUrl || '(기본 상대 경로)'}</div>
            </div>

            <div className="server-input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                새 API 서버 주소 (ngrok / Cloudflare / OCI IP / 로컬):
              </label>
              <input
                type="text"
                className="server-input"
                placeholder="예: https://xxx.ngrok-free.dev 또는 http://localhost:8000"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                * GitHub Pages에서 터널 주소가 바뀌었을 때 새 주소를 입력하면 즉시 연결됩니다.
              </span>
            </div>

            {testResult && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                background: testResult.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${testResult.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: testResult.ok ? '#34d399' : '#f87171'
              }}>
                {testResult.message}
              </div>
            )}

            <div className="server-modal-actions">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-server-test"
                  onClick={handleTestConnection}
                  disabled={testResult?.testing}
                >
                  <RefreshCw size={14} className={testResult?.testing ? 'animate-spin' : ''} />
                  연결 테스트
                </button>
                {getCustomApiBase() && (
                  <button
                    type="button"
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={handleResetServerUrl}
                  >
                    기본값 복원
                  </button>
                )}
              </div>
              <button
                type="button"
                className="btn-server-save"
                onClick={handleSaveServerUrl}
              >
                저장 및 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
