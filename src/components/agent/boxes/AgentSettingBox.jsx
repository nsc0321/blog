import React, { useState, useEffect } from 'react';
import { Settings, Volume2, Mic, Sliders, CheckCircle2, Save, Sparkles, UserCheck, Cpu } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function AgentSettingBox({
  ttsEnabled,
  onToggleTts,
  showAvatar,
  onToggleAvatar
}) {
  const [model, setModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_llm_model') || 'openai/gpt-oss-120b';
    }
    return 'openai/gpt-oss-120b';
  });
  const [availableModels, setAvailableModels] = useState(['openai/gpt-oss-120b']);
  const [temperature, setTemperature] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agent_temperature');
      return saved ? parseFloat(saved) : 0.7;
    }
    return 0.7;
  });
  const [voiceRate, setVoiceRate] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agent_voice_rate');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });
  const [saveAlert, setSaveAlert] = useState(false);

  const API_BASE = getApiBase();

  useEffect(() => {
    const fetchStatusModel = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/status`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.llm_model) {
            setAvailableModels([data.llm_model]);
            setModel(data.llm_model);
            localStorage.setItem('agent_llm_model', data.llm_model);
          }
        }
      } catch (e) {
        console.log('Status fetch error:', e);
      }
    };
    fetchStatusModel();
  }, [API_BASE]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_llm_model', model);
      localStorage.setItem('agent_temperature', String(temperature));
      localStorage.setItem('agent_voice_rate', String(voiceRate));
    }
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2000);
  };

  return (
    <Box
      title="5. Setting Box (Agent 환경 설정)"
      subtitle="음성(TTS/STT), AI 모델 및 아바타 렌더링 옵션 제어"
      icon={Settings}
      badge="Configuration"
      badgeType="purple"
      actions={
        <button
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            border: 'none',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Save size={13} />
          <span>설정 저장</span>
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {/* TTS Toggle Sub-Box */}
        <SubBoxCard
          title="음성 출력 (TTS) 설정"
          description="Agent 답변을 한국어 음성(Text-to-Speech)으로 자동 재생합니다."
          icon={Volume2}
          badge={ttsEnabled ? '활성화' : '비활성'}
          badgeType={ttsEnabled ? 'success' : 'default'}
        >
          <button
            onClick={onToggleTts}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${ttsEnabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              background: ttsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: ttsEnabled ? '#34d399' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {ttsEnabled ? '🔊 음성 출력(TTS) 켜짐' : '🔈 음성 출력(TTS) 꺼짐'}
          </button>
        </SubBoxCard>

        {/* 3D Avatar Toggle Sub-Box */}
        <SubBoxCard
          title="3D 인터랙티브 아바타"
          description="음성에 맞춰 입모양과 제스처를 렌더링하는 WebGL 아바타를 표시합니다."
          icon={UserCheck}
          badge={showAvatar ? '표시 중' : '숨김'}
          badgeType={showAvatar ? 'purple' : 'default'}
        >
          <button
            onClick={onToggleAvatar}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${showAvatar ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              background: showAvatar ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: showAvatar ? '#c4b5fd' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {showAvatar ? '👤 아바타 캔버스 활성' : '👤 아바타 숨기기'}
          </button>
        </SubBoxCard>
      </div>

      {/* Model & Voice Sliders */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            기본 AI 모델 (LLM Model):
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#c4b5fd',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none'
            }}
          >
            {availableModels.map((m) => (
              <option key={m} value={m} style={{ background: '#121225', color: '#f8fafc' }}>
                {m} (기존 LLM 모델)
              </option>
            ))}
          </select>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            서버 백엔드에 직접 연결된 기본 고성능 추론 LLM 모델입니다.
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            창의성 온도 (Temperature): {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#8b5cf6' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            음성 속도 (Speech Rate): {voiceRate}x
          </label>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={voiceRate}
            onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#06b6d4' }}
          />
        </div>
      </div>

      {saveAlert && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle2 size={14} />
          <span>Agent 환경 설정이 브라우저에 저장되었습니다.</span>
        </div>
      )}
    </Box>
  );
}
