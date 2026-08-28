import React, { useState } from 'react';
import { Play, Terminal, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function SkillTestBox({ selectedSkill }) {
  const [testArgs, setTestArgs] = useState('{}');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const handleRunTest = async () => {
    if (!selectedSkill) return;
    setTesting(true);
    setTestResult(null);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(testArgs);
      } catch (e) {
        parsed = {};
      }

      const resp = await fetch(`${API_BASE}/api/skills/${selectedSkill.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ inputs: parsed })
      });
      const data = await resp.json();
      setTestResult({
        ok: resp.ok,
        status: resp.status,
        data: data
      });
    } catch (err) {
      setTestResult({
        ok: false,
        error: err.message || '스킬 테스트 호출 실패'
      });
    } finally {
      setTesting(false);
    }
  };

  if (!selectedSkill) {
    return (
      <Box
        title="Skill Test Box"
        subtitle="스킬 단위 실행 및 실시간 출력 검증"
        icon={Play}
      >
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          스킬을 선택하면 즉시 테스트할 수 있습니다.
        </div>
      </Box>
    );
  }

  return (
    <Box
      title={`Skill Test Box: ${selectedSkill.name}`}
      subtitle="테스트 인자 주입 및 실행 결과 샌드박스"
      icon={Play}
      badge="Sandbox"
      badgeType="info"
      actions={
        <button
          onClick={handleRunTest}
          disabled={testing}
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            border: 'none',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: testing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {testing ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
          <span>테스트 실행</span>
        </button>
      }
    >
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
          테스트 JSON 인자 (Arguments):
        </label>
        <input
          type="text"
          value={testArgs}
          onChange={(e) => setTestArgs(e.target.value)}
          placeholder='{"param": "value"}'
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '8px 10px',
            color: '#38bdf8',
            fontFamily: 'monospace',
            fontSize: '12px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {testResult && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: `1px solid ${testResult.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          color: testResult.ok ? '#34d399' : '#f87171',
          fontFamily: 'monospace',
          maxHeight: '140px',
          overflowY: 'auto'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>
            {testResult.ok ? '✅ 테스트 성공 (200 OK)' : '❌ 실행 오류'}
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
            {JSON.stringify(testResult.data || testResult.error, null, 2)}
          </pre>
        </div>
      )}
    </Box>
  );
}
