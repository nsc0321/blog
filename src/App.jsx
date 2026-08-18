import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Bot, Database, TrendingUp, Sparkles, Menu, X } from 'lucide-react';
import MainDashboard from './components/MainDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import MabinogiArchive from './components/MabinogiArchive';
import AutoTradingDashboard from './components/AutoTradingDashboard';

const getPageFromPath = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase();

  // /blog/trading 또는 #trading -> 자동거래 페이지
  if (path.endsWith('/trading') || hash === '#trading') {
    return 'trading';
  }

  // /blog/agent 또는 /blog/agnet 또는 #agent -> Agent 페이지
  if (path.endsWith('/agent') || path.endsWith('/agnet') || hash === '#agent') {
    return 'agent';
  }

  // /blog/mabinogi 또는 #mabinogi -> 마비노기 페이지
  if (path.endsWith('/mabinogi') || hash === '#mabinogi') {
    return 'mabinogi';
  }

  // /blog 또는 /blog/ 또는 기본 접속 -> 메인 대시보드
  return 'dashboard';
};

export default function App() {
  const [activePage, setActivePage] = useState(getPageFromPath);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);

    // 경로 설정 (/blog, /blog/trading, /blog/agent, /blog/mabinogi)
    let targetPath = '/blog';
    if (page === 'trading') {
      targetPath = '/blog/trading';
    } else if (page === 'agent') {
      targetPath = '/blog/agent';
    } else if (page === 'mabinogi') {
      targetPath = '/blog/mabinogi';
    } else {
      targetPath = '/blog';
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
        {activePage === 'dashboard' && <MainDashboard onNavigate={(page) => handleNavigate(page)} />}
        {activePage === 'trading' && <AutoTradingDashboard />}
        {activePage === 'agent' && <VoiceAssistant />}
        {activePage === 'mabinogi' && <MabinogiArchive />}
      </main>
    </div>
  );
}
