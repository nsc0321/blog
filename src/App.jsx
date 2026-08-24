import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Bot, Database, TrendingUp, Sparkles, Menu, X } from 'lucide-react';
import MainDashboard from './components/MainDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import MabinogiArchive from './components/MabinogiArchive';
import AutoTradingDashboard from './components/AutoTradingDashboard';

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

        <div className="header-right">
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
    </div>
  );
}
