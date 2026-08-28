import React from 'react';
import { Bot, TrendingUp, Database, ShieldCheck, Sparkles, ArrowRight, MessageSquare, Cpu, DollarSign, Settings, Search, Layers, Users, Zap, Terminal, Activity, Key, History } from 'lucide-react';
import { Box, SubBoxCard } from './common/Box';

export default function MainDashboard({ onNavigate }) {
  const currentRole = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_role') || 'user' : 'user';
  const username = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_username') || '' : '';
  const isAdmin = currentRole === 'admin' || username.toLowerCase() === 'yuha69' || username.toLowerCase() === 'admin';

  return (
    <div className="main-dashboard-container" style={{ padding: '32px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Root Header */}
      <div className="section-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#c4b5fd',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={14} />
          <span>OCTOHUB ENCAPSULATED BOX ARCHITECTURE</span>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
          통합 Box 매니지먼트
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
          각 기능이 독립된 Box로 캡슐화되어 상위 Link Box를 통해 상호 연결 및 전환됩니다.
        </p>
      </div>

      {/* Main Link Boxes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* 1. Agent Link Box */}
        <div
          onClick={() => onNavigate('agent')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          className="link-box-wrapper"
        >
          <Box
            title="Agent Link Box"
            subtitle="AI 대화, 커스텀 스킬 워크숍, 실시간 태스크 모니터링"
            icon={Bot}
            badge="Agent Module"
            badgeType="purple"
            actions={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#c4b5fd',
                fontWeight: 700,
                fontSize: '13px',
                background: 'rgba(139, 92, 246, 0.2)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.4)'
              }}>
                <span>Agent Box로 이동</span>
                <ArrowRight size={14} />
              </div>
            }
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>포함된 하위 Box: 9개 캡슐</span>
                <span style={{ color: '#c4b5fd', fontWeight: 700 }}>클릭하여 열기 &rarr;</span>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    <MessageSquare size={14} color="#a78bfa" />
                    <span>1. Chat Box</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>실시간 음성/텍스트 대화</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    <Cpu size={14} color="#38bdf8" />
                    <span>2. Call API Box</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>스킬/프롬프트 직접 호출</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    <Layers size={14} color="#34d399" />
                    <span>6. Dashboard Box</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Task Box + Log Box</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    <Zap size={14} color="#fbbf24" />
                    <span>7. Skill Box</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Edit + Info + Test</div>
                </div>
              </div>
            </div>
          </Box>
        </div>

        {/* 2. AI Trading Link Box */}
        <div
          onClick={() => onNavigate('trading')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          className="link-box-wrapper"
        >
          <Box
            title="AI Trading Link Box"
            subtitle="실시간 빗썸 시세, 퀀트 보조지표 연산 & LLM 매매 가드레일"
            icon={TrendingUp}
            badge="Quant Trading"
            badgeType="info"
            actions={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '13px',
                background: 'rgba(6, 182, 212, 0.2)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.4)'
              }}>
                <span>Trading Box로 이동</span>
                <ArrowRight size={14} />
              </div>
            }
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>포함된 하위 Box: API 호출 + 전략 설정</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>클릭하여 열기 &rarr;</span>
              </div>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  <DollarSign size={14} color="#34d399" />
                  <span>Call Trading API</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>실시간 시세 & 주문 집행</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  <Settings size={14} color="#fbbf24" />
                  <span>Trading Setting</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>손익절 & 모의투자 통제</div>
              </div>
            </div>
          </Box>
        </div>

        {/* 3. Mabinogi Link Box */}
        <div
          onClick={() => onNavigate('mabinogi')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          className="link-box-wrapper"
        >
          <Box
            title="Mabinogi Link Box"
            subtitle="넥슨 공식 Open API 캐릭터/경매장 실시간 조회 & 아이템 빅데이터"
            icon={Database}
            badge="Nexon API"
            badgeType="default"
            actions={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: '13px',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <span>Mabinogi Box로 이동</span>
                <ArrowRight size={14} />
              </div>
            }
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>포함된 하위 Box: Open API + Archive DB</span>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>클릭하여 열기 &rarr;</span>
              </div>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  <Search size={14} color="#38bdf8" />
                  <span>Open API Box</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>캐릭터/경매장 실시간 검색</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  <Layers size={14} color="#a78bfa" />
                  <span>Archive DB Box</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>장비/인챈트 아카이브</div>
              </div>
            </div>
          </Box>
        </div>

        {/* 4. Admin Link Box (if Admin) */}
        {isAdmin && (
          <div
            onClick={() => onNavigate('admin')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            className="link-box-wrapper"
          >
            <Box
              title="Admin Link Box"
              subtitle="전체 사용자 권한(RBAC) 관리, 세션 활성화 및 비밀번호 재설정"
              icon={ShieldCheck}
              badge="Admin Only"
              badgeType="purple"
              actions={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c4b5fd',
                  fontWeight: 700,
                  fontSize: '13px',
                  background: 'rgba(139, 92, 246, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.5)'
                }}>
                  <span>Admin Box로 이동</span>
                  <ArrowRight size={14} />
                </div>
              }
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#94a3b8' }}>포함된 하위 Box: User Directory + RBAC Control</span>
                  <span style={{ color: '#c4b5fd', fontWeight: 700 }}>클릭하여 열기 &rarr;</span>
                </div>
              }
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    <Users size={14} color="#a78bfa" />
                    <span>User Directory</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>계정 목록 & 활성화 제어</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    <ShieldCheck size={14} color="#34d399" />
                    <span>RBAC Security</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>역할 및 보안 감사</div>
                </div>
              </div>
            </Box>
          </div>
        )}

      </div>
    </div>
  );
}
