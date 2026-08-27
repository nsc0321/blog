import React from 'react';
import { Bot, Database, TrendingUp, Sparkles, Activity, ShieldCheck, Cpu, ArrowRight, Search, FileText, Layers, Users, Zap } from 'lucide-react';

export default function MainDashboard({ onNavigate }) {
  const currentRole = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_role') || 'user' : 'user';
  const username = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_username') || '' : '';
  const isAdmin = currentRole === 'admin' || username.toLowerCase() === 'yuha69' || username.toLowerCase() === 'admin';

  return (
    <div className="main-dashboard-container" style={{ padding: '32px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Section Header: 시스템 모듈 선택 */}
      <div className="section-header" style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#c4b5fd',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={14} />
          <span>OCTOHUB CONTROL CENTER</span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
          시스템 모듈 선택
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
          이동하고자 하는 핵심 플랫폼 모듈을 선택하세요.
        </p>
      </div>

      {/* Main Module Cards Grid */}
      <div className="module-cards-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Module Card 1: AI Auto Trading */}
        <div className="module-card trading-card" onClick={() => onNavigate('trading')}>
          <div className="module-card-header">
            <div className="module-tag trading">Bithumb Quant AI</div>
            <TrendingUp size={32} className="module-main-icon" />
          </div>
          <h3>AI 빗썸 자동거래</h3>
          <p>
            실시간 빗썸 시세와 보조지표(RSI, MACD, 볼린저 밴드)를 수집하여 LLM 기반 시장 분석 및 안전한 분할 주문을 집행하는 퀀트 자동거래 시스템.
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

        {/* Module Card 2: Agent AI */}
        <div className="module-card agent-card" onClick={() => onNavigate('agent')}>
          <div className="module-card-header">
            <div className="module-tag agent">AI Autonomous</div>
            <Bot size={32} className="module-main-icon" />
          </div>
          <h3>Agent AI 시스템</h3>
          <p>
            음성 대화 및 텍스트 프롬프트 기반 자율 실행 AI 어시스턴트. 커스텀 스킬 워크숍, 백그라운드 태스크 모니터링, 실시간 로그 및 자격증명 관리.
          </p>
          <div className="module-highlights">
            <div className="highlight-item">
              <Zap size={14} />
              <span>실시간 Voice / Chat Assistant</span>
            </div>
            <div className="highlight-item">
              <Cpu size={14} />
              <span>Custom Skill 워크숍 및 MCP 구동 엔진</span>
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

        {/* Module Card 4: Admin Management (Active for Admins) */}
        {isAdmin && (
          <div className="module-card admin-card" onClick={() => onNavigate('admin')} style={{
            background: 'linear-gradient(145deg, rgba(18, 18, 37, 0.9), rgba(30, 20, 50, 0.9))',
            borderColor: 'rgba(139, 92, 246, 0.3)'
          }}>
            <div className="module-card-header">
              <div className="module-tag" style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#c4b5fd' }}>
                Admin & RBAC
              </div>
              <Users size={32} className="module-main-icon" style={{ color: '#a78bfa' }} />
            </div>
            <h3>통합 계정 & 관리자 센터</h3>
            <p>
              전체 등록 사용자 목록 조회, Role(일반 회원 ↔ 관리자) 변경, 계정 활성화/비활성화 통제, 비밀번호 강제 재설정 및 보안 감사.
            </p>
            <div className="module-highlights">
              <div className="highlight-item">
                <ShieldCheck size={14} />
                <span>회원 권한 (Role-Based Access) 통제</span>
              </div>
              <div className="highlight-item">
                <Users size={14} />
                <span>계정 상태(활성/비활성) 및 세션 제어</span>
              </div>
              <div className="highlight-item">
                <Activity size={14} />
                <span>보안 정책 감사 및 비밀번호 재설정</span>
              </div>
            </div>
            <div className="module-footer">
              <span>관리자 센터로 이동</span>
              <ArrowRight size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
