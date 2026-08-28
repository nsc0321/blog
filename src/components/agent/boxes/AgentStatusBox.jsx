import React from 'react';
import { Activity, Cpu, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Box } from '../../common/Box';

export default function AgentStatusBox({
  status = 'ONLINE',
  skillsCount = 40,
  activeTasksCount = 0,
  latency = '24ms',
  currentModel = 'Gemini 2.5 Pro / GPT-4o'
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px', color: '#34d399' }}>
          <Activity size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Agent 엔진 상태</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#34d399' }}>● {status}</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', color: '#a78bfa' }}>
          <Cpu size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>로드된 스킬</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>{skillsCount}개 스킬</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '10px', color: '#22d3ee' }}>
          <Zap size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>백그라운드 태스크</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#22d3ee' }}>{activeTasksCount}개 실행 중</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '8px', borderRadius: '10px', color: '#cbd5e1' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>활성 LLM 모델</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentModel}
          </div>
        </div>
      </div>
    </div>
  );
}
