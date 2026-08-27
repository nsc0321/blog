import React, { useState } from 'react';
import { Cpu, Play, Terminal, CheckCircle2, AlertCircle, RefreshCw, Layers, Code, Zap } from 'lucide-react';
import { Box, SubBoxCard } from '../common/Box';
import { getApiBase } from '../../config';

export default function CallAgentApiBox({
  skills = [],
  onExecuteSkill,
  loading = false,
  apiLogs = []
}) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [customArgs, setCustomArgs] = useState('{}');
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const handleDirectExecute = async (skill) => {
    setExecuting(true);
    setExecResult(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(customArgs);
      } catch (e) {
        parsedArgs = {};
      }

      const resp = await fetch(`${API_BASE}/api/skills/${skill.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ inputs: parsedArgs })
      });
      const data = await resp.json();
      setExecResult({
        success: resp.ok,
        status: resp.status,
        data: data
      });
    } catch (err) {
      setExecResult({
        success: false,
        error: err.message || 'API 호출 실패'
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Box
      title="Call Agent API Box"
      subtitle="등록된 Agent 스킬 및 시스템 백엔드 API 직접 호출 & 디버깅"
      icon={Cpu}
      badge="API Engine"
      badgeType="info"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>연결 상태: <strong>{skills.length}개 스킬 로드됨</strong></span>
          <span>엔드포인트: /api/skills/:id/execute</span>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {skills.slice(0, 6).map((skill) => (
          <SubBoxCard
            key={skill.id}
            title={skill.name}
            description={skill.description || '등록된 자동화 스킬'}
            icon={Zap}
            badge={skill.is_verified ? '검증됨' : '준비'}
            badgeType={skill.is_verified ? 'success' : 'default'}
            active={selectedSkill?.id === skill.id}
            onClick={() => {
              setSelectedSkill(skill);
              setExecResult(null);
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSkill(skill);
                  handleDirectExecute(skill);
                }}
                disabled={executing}
                style={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#22d3ee',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Play size={12} />
                <span>호출 실행</span>
              </button>
            </div>
          </SubBoxCard>
        ))}
      </div>

      {/* Selected Skill Execution & Output Box */}
      {selectedSkill && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginTop: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                스킬 API 호출 콘솔: <strong>{selectedSkill.name}</strong>
              </span>
            </div>
            <button
              onClick={() => handleDirectExecute(selectedSkill)}
              disabled={executing}
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: executing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {executing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              <span>API 호출 전송</span>
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
              JSON 입력 파라미터 (Inputs):
            </label>
            <input
              type="text"
              value={customArgs}
              onChange={(e) => setCustomArgs(e.target.value)}
              placeholder='{"query": "test"}'
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Response Box */}
          {execResult && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: `1px solid ${execResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              color: execResult.success ? '#34d399' : '#f87171',
              fontFamily: 'monospace',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                {execResult.success ? '✅ API 응답 성공 (200 OK)' : '❌ API 호출 실패'}
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#cbd5e1' }}>
                {JSON.stringify(execResult.data || execResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Box>
  );
}
