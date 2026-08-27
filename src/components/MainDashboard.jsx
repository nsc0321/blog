import React from 'react';
import { Bot, TrendingUp, Database, ShieldCheck, Sparkles, ArrowRight, MessageSquare, Cpu, DollarSign, Settings, Search, Layers, Users, Zap, Terminal } from 'lucide-react';
import { Box, SubBoxCard } from './common/Box';

export default function MainDashboard({ onNavigate }) {
  const currentRole = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_role') || 'user' : 'user';
  const username = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_username') || '' : '';
  const isAdmin = currentRole === 'admin' || username.toLowerCase() === 'yuha69' || username.toLowerCase() === 'admin';

  return (
    <div className="main-dashboard-container" style={{ padding: '28px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Root Header */}
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
          marginBottom: '10px'
        }}>
          <Sparkles size={14} />
          <span>OCTOHUB HIERARCHICAL BOX SYSTEM</span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
          시스템 모듈 & Box 관리
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          모든 기능은 상위 Box와 연결된 하위 Sub-Box 구조로 관리 및 실행됩니다.
        </p>
      </div>

      {/* Main Boxes Hierarchy Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* 1. Agent Link Box */}
        <Box
          title="Agent Link Box"
          subtitle="AI Assistant & Autonomous Skills Engine"
          icon={Bot}
          badge="Interactive AI"
          badgeType="purple"
          actions={
            <button
              onClick={() => onNavigate('agent')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: 'none',
                color: '#fff',
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
              <span>Agent Box로 이동</span>
              <ArrowRight size={14} />
            </button>
          }
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>하위 Box: <strong>Chat Box</strong> + <strong>Call Agent API Box</strong></span>
              <span style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('agent')}>
                전체 열기 &rarr;
              </span>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SubBoxCard
              title="Chat Box (대화/음성 인터페이스)"
              description="실시간 음성인식(STT) 및 텍스트 프롬프트를 통한 양방향 대화와 음성 출력(TTS)"
              icon={MessageSquare}
              badge="Active"
              badgeType="success"
              onClick={() => onNavigate('agent')}
            />

            <SubBoxCard
              title="Call Agent API Box (스킬 실행 엔진)"
              description="40개 커스텀 스킬 및 백엔드 API 직접 호출, MCP 도구 연동 및 결과 파싱"
              icon={Cpu}
              badge="Ready"
              badgeType="info"
              onClick={() => onNavigate('agent')}
            />
          </div>
        </Box>

        {/* 2. AI Trading Box */}
        <Box
          title="AI Trading Box"
          subtitle="Bithumb Quant Trading & Risk Guardrails"
          icon={TrendingUp}
          badge="Quant Trading"
          badgeType="info"
          actions={
            <button
              onClick={() => onNavigate('trading')}
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                border: 'none',
                color: '#fff',
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
              <span>Trading Box로 이동</span>
              <ArrowRight size={14} />
            </button>
          }
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>하위 Box: <strong>Call Trading API Box</strong> + <strong>Trading Setting Box</strong></span>
              <span style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('trading')}>
                전체 열기 &rarr;
              </span>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SubBoxCard
              title="Call Trading API Box (시세 연산 & 주문 집행)"
              description="실시간 빗썸 호가/체결가 수집, RSI/MACD 보조지표 연산 및 LLM 매매 신호 집행"
              icon={DollarSign}
              badge="API Live"
              badgeType="success"
              onClick={() => onNavigate('trading')}
            />

            <SubBoxCard
              title="Trading Setting Box (리스크 가드레일 & 전략 설정)"
              description="타겟 마켓 선택, 손절/익절 %, 분할 주문 비율 및 모의투자(Dry-Run) 모드 통제"
              icon={Settings}
              badge="Configurable"
              badgeType="warning"
              onClick={() => onNavigate('trading')}
            />
          </div>
        </Box>

        {/* 3. Mabinogi Archive Link Box */}
        <Box
          title="Mabinogi Archive Box"
          subtitle="Nexon Open API & Big Data Repository"
          icon={Database}
          badge="Nexon API"
          badgeType="default"
          actions={
            <button
              onClick={() => onNavigate('mabinogi')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
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
              <span>아카이브로 이동</span>
              <ArrowRight size={14} />
            </button>
          }
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>하위 Box: <strong>Open API Search Box</strong> + <strong>Archive DB Box</strong></span>
              <span style={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('mabinogi')}>
                전체 열기 &rarr;
              </span>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SubBoxCard
              title="Open API Box (캐릭터 & 경매장 조회)"
              description="넥슨 공식 Open API를 연동한 실시간 캐릭터 장비/스탯 및 경매장 시세 검색"
              icon={Search}
              onClick={() => onNavigate('mabinogi')}
            />

            <SubBoxCard
              title="Archive DB Box (아이템 & 인챈트 데이터)"
              description="수집된 장비, 인챈트 옵션 및 사용자 맞춤 빌드 스크랩북 데이터베이스"
              icon={Layers}
              onClick={() => onNavigate('mabinogi')}
            />
          </div>
        </Box>

        {/* 4. Admin Management Box (if admin) */}
        {isAdmin && (
          <Box
            title="Admin Management Box"
            subtitle="Integrated User Directory & RBAC Security"
            icon={ShieldCheck}
            badge="Admin Only"
            badgeType="purple"
            actions={
              <button
                onClick={() => onNavigate('admin')}
                style={{
                  background: 'rgba(139, 92, 246, 0.25)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
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
                <span>관리자 센터로 이동</span>
                <ArrowRight size={14} />
              </button>
            }
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>하위 Box: <strong>User List Box</strong> + <strong>Role & Security Box</strong></span>
                <span style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('admin')}>
                  전체 열기 &rarr;
                </span>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <SubBoxCard
                title="User Directory Box (계정 목록 & 세션 제어)"
                description="전체 등록 회원 목록 조회, 활성화/비활성화 통제 및 비밀번호 강제 재설정"
                icon={Users}
                onClick={() => onNavigate('admin')}
              />

              <SubBoxCard
                title="RBAC Security Box (역할 및 권한 관리)"
                description="일반 회원 ↔ 관리자 역할 전환 및 감사 로그 관리"
                icon={ShieldCheck}
                onClick={() => onNavigate('admin')}
              />
            </div>
          </Box>
        )}

      </div>
    </div>
  );
}
