import React, { useState } from 'react';
import { Plus, Key, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Box } from '../../common/Box';

export default function AccountEditBox({ onAddCredential, loading = false }) {
  const [serviceName, setServiceName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!serviceName || !apiKey) {
      setFeedback({ ok: false, message: '서비스명과 API Key를 모두 입력해 주세요.' });
      return;
    }
    if (onAddCredential) {
      onAddCredential({ service_name: serviceName, api_key: apiKey });
    }
    setServiceName('');
    setApiKey('');
    setFeedback({ ok: true, message: '새 자격증명이 안전하게 저장되었습니다.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <Box
      title="8-2. Account Edit Box (신규 키 등록)"
      subtitle="새로운 외부 API Key / 자격증명 등록 및 암호화 저장"
      icon={Plus}
      badge="Register"
      badgeType="info"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>
            서비스 이름 (예: OPENAI_API_KEY, NEXON_API_KEY, BITHUMB_CONNECT_KEY):
          </label>
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="OPENAI_API_KEY"
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>
            API Key / Secret Token:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-••••••••••••••••"
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#38bdf8',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !serviceName || !apiKey}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: (loading || !serviceName || !apiKey) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '4px'
          }}
        >
          <Save size={13} />
          <span>자격증명 등록</span>
        </button>
      </form>

      {feedback && (
        <div style={{
          marginTop: '10px',
          padding: '8px 10px',
          borderRadius: '8px',
          background: feedback.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.ok ? '#34d399' : '#f87171',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {feedback.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </Box>
  );
}
