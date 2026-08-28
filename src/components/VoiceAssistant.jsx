import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, MessageSquare, Cpu, LayoutDashboard, Wrench, Key, History, Settings } from 'lucide-react';
import AgentTabBox from './agent/boxes/AgentTabBox';
import AgentStatusBox from './agent/boxes/AgentStatusBox';
import AgentSettingBox from './agent/boxes/AgentSettingBox';
import ChatBox from './agent/ChatBox';
import CallAgentApiBox from './agent/CallAgentApiBox';
import DashboardBox from './agent/boxes/DashboardBox';
import SkillWorkshopBox from './agent/boxes/SkillWorkshopBox';
import AccountManageBox from './agent/boxes/AccountManageBox';
import HistoryBox from './agent/boxes/HistoryBox';
import AvatarCanvas from './AvatarCanvas';
import { getApiBase } from '../config';

export default function VoiceAssistant() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'dashboard' | 'skills' | 'accounts' | 'history' | 'settings'
  
  // Chat State
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: '안녕하세요! OctoHub Agent AI입니다. 대화형 AI 어시스턴트 및 커스텀 스킬 엔진을 사용하실 수 있습니다.' }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStatusText, setChatStatusText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Settings State
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_tts_enabled') === 'true';
    }
    return false;
  });
  const [showAvatar, setShowAvatar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_show_avatar') === 'true';
    }
    return false;
  });

  // Skills & Credentials State
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  });

  // Fetch Skills
  const fetchSkills = async () => {
    setSkillsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/skills`, { headers: getHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setSkills(data.skills || []);
      }
    } catch (err) {
      console.log('Fetch skills note:', err);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Fetch Credentials
  const fetchCredentials = async () => {
    setCredentialsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/credentials`, { headers: getHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setCredentials(data.credentials || []);
      }
    } catch (err) {
      console.log('Fetch credentials note:', err);
    } finally {
      setCredentialsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCredentials();
  }, []);

  // Web Speech STT setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'ko-KR';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('현재 브라우저에서 음성 인식을 지원하지 않습니다.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // TTS helper
  const speakText = (text) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || chatLoading) return;
    const userText = inputPrompt.trim();
    setInputPrompt('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);
    setChatStatusText('Agent AI가 응답을 생성하고 있습니다...');

    try {
      const resp = await fetch(`${API_BASE}/api/agent/prompt`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt: userText, stream: false })
      });
      const data = await resp.json();
      const reply = data.reply || data.response || (typeof data === 'string' ? data : JSON.stringify(data));
      setMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
      speakText(reply);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: `⚠️ 응답 실패: ${err.message || '서버 통신 오류'}` }]);
    } finally {
      setChatLoading(false);
      setChatStatusText('');
    }
  };

  // Add credential
  const handleAddCredential = async (credData) => {
    try {
      const resp = await fetch(`${API_BASE}/api/credentials`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credData)
      });
      if (resp.ok) {
        fetchCredentials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete credential
  const handleDeleteCredential = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const resp = await fetch(`${API_BASE}/api/credentials/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (resp.ok) {
        fetchCredentials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save skill
  const handleSaveSkill = async (skillData) => {
    try {
      const resp = await fetch(`${API_BASE}/api/skills/${skillData.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(skillData)
      });
      if (resp.ok) {
        fetchSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="agent-container-box" style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 4. Status Box */}
      <AgentStatusBox
        status="ONLINE"
        skillsCount={skills.length}
        activeTasksCount={1}
      />

      {/* 5. Tab Box: Dynamic Box Group Switcher */}
      <AgentTabBox
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Dynamic Sub-Box Rendering according to Tab Box */}
      <div className="agent-active-box-view">
        
        {/* 1 & 2. Chat Box + Call Agent API Box View */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <ChatBox
              messages={messages}
              inputPrompt={inputPrompt}
              setInputPrompt={setInputPrompt}
              onSendMessage={handleSendMessage}
              isListening={isListening}
              toggleListening={toggleListening}
              ttsEnabled={ttsEnabled}
              setTtsEnabled={(val) => {
                setTtsEnabled(val);
                localStorage.setItem('agent_tts_enabled', String(val));
              }}
              loading={chatLoading}
              statusText={chatStatusText}
            />

            <CallAgentApiBox
              skills={skills}
              loading={skillsLoading}
            />

            {showAvatar && (
              <div style={{
                gridColumn: '1 / -1',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <AvatarCanvas />
              </div>
            )}
          </div>
        )}

        {/* 6. Dashboard Box (6-1. Task Box + 6-2. Log Box) */}
        {activeTab === 'dashboard' && (
          <DashboardBox />
        )}

        {/* 7. Skill Workshop Box (7-1. Edit + 7-2. Info + 7-3. Test) */}
        {activeTab === 'skills' && (
          <SkillWorkshopBox
            skills={skills}
            onRefresh={fetchSkills}
            onSaveSkill={handleSaveSkill}
            loading={skillsLoading}
          />
        )}

        {/* 8. Account Manage Box (8-1. List + 8-2. Edit) */}
        {activeTab === 'accounts' && (
          <AccountManageBox
            credentials={credentials}
            onDeleteCredential={handleDeleteCredential}
            onAddCredential={handleAddCredential}
            onRefresh={fetchCredentials}
            loading={credentialsLoading}
          />
        )}

        {/* 9. History Box */}
        {activeTab === 'history' && (
          <HistoryBox />
        )}

        {/* 3. Setting Box */}
        {activeTab === 'settings' && (
          <AgentSettingBox
            ttsEnabled={ttsEnabled}
            onToggleTts={() => {
              const nextVal = !ttsEnabled;
              setTtsEnabled(nextVal);
              localStorage.setItem('agent_tts_enabled', String(nextVal));
            }}
            showAvatar={showAvatar}
            onToggleAvatar={() => {
              const nextVal = !showAvatar;
              setShowAvatar(nextVal);
              localStorage.setItem('agent_show_avatar', String(nextVal));
            }}
          />
        )}

      </div>
    </div>
  );
}
