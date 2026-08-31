import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, MessageSquare, Cpu, LayoutDashboard, Wrench, Key, History, Settings } from 'lucide-react';
import AgentTabBox from './agent/boxes/AgentTabBox';
import AgentStatusBox from './agent/boxes/AgentStatusBox';
import AgentSettingBox from './agent/boxes/AgentSettingBox';
import ChatBox from './agent/ChatBox';
import SkillWorkshopBox from './agent/boxes/SkillWorkshopBox';
import AccountManageBox from './agent/boxes/AccountManageBox';
import HistoryBox from './agent/boxes/HistoryBox';
import AvatarCanvas from './AvatarCanvas';
import { getApiBase } from '../config';

export default function VoiceAssistant() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'skills' | 'accounts' | 'history' | 'settings'
  
  // Chat State
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('agent_chat_messages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [
      { sender: 'assistant', text: '안녕하세요! OctoHub Agent AI입니다. 대화형 AI 어시스턴트 및 커스텀 스킬 엔진을 사용하실 수 있습니다.' }
    ];
  });

  // Save session messages to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('agent_chat_messages', JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages]);

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
  const [currentModel, setCurrentModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_llm_model') || 'Qwen/Qwen3.8-Flash-Next';
    }
    return 'Qwen/Qwen3.8-Flash-Next';
  });

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  });

  // Fetch Status
  const fetchStatus = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/status`, { headers: getHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        if (data.llm_model) {
          setCurrentModel(data.llm_model);
          if (typeof window !== 'undefined') {
            localStorage.setItem('agent_llm_model', data.llm_model);
          }
        }
      }
    } catch (e) {
      console.log('Fetch status note:', e);
    }
  };

  // Fetch Skills
  const fetchSkills = async () => {
    setSkillsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/skills`, { headers: getHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setSkills(Array.isArray(data) ? data : (data.skills || []));
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
        setCredentials(Array.isArray(data) ? data : (data.credentials || []));
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
    fetchStatus();
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
  const handleSendMessage = async (imageAttachment = null) => {
    if ((!inputPrompt.trim() && !imageAttachment) || chatLoading) return;
    const userText = inputPrompt.trim();
    setInputPrompt('');
    
    // Extract conversational history payload from previous turns
    const historyPayload = messages
      .filter(m => m.text && m.text.trim())
      .slice(-15) // Keep last 15 turns for optimal context memory
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    // Add user message and empty placeholder for streaming assistant message
    setMessages(prev => [
      ...prev, 
      { 
        sender: 'user', 
        text: userText, 
        image: imageAttachment?.dataUrl || null,
        imageName: imageAttachment?.name || ''
      },
      {
        sender: 'assistant',
        text: '',
        isStreaming: true
      }
    ]);
    
    setChatLoading(true);
    setChatStatusText(imageAttachment ? '이미지 분석 및 응답 생성 중...' : '응답 확인 중...');

    try {
      // 1. Send to /api/chat with streaming or /api/agent/prompt fallback
      const activeModel = typeof window !== 'undefined' ? localStorage.getItem('agent_llm_model') || currentModel : currentModel;
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          message: userText, 
          model: activeModel,
          image: imageAttachment?.dataUrl || null,
          chat_history: historyPayload
        })
      });

      if (!resp.ok) {
        const fallbackResp = await fetch(`${API_BASE}/api/agent/prompt`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ 
            prompt: userText, 
            model: activeModel,
            image: imageAttachment?.dataUrl || null,
            chat_history: historyPayload
          })
        });
        const fallbackData = await fallbackResp.json();
        const reply = fallbackData.reply || fallbackData.response || '응답을 생성하지 못했습니다.';
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === 'assistant') {
            last.text = reply;
            last.isStreaming = false;
          } else {
            updated.push({ sender: 'assistant', text: reply });
          }
          return updated;
        });
        speakText(reply);
        return;
      }

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/x-ndjson') && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedAnswer = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.type === 'chunk') {
                accumulatedAnswer += parsed.content;
                const currentChunkText = accumulatedAnswer;
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.sender === 'assistant') {
                    last.text = currentChunkText;
                  }
                  return updated;
                });
              } else if (parsed.type === 'log') {
                setChatStatusText(parsed.content);
              } else if (parsed.type === 'answer') {
                if (parsed.content) {
                  accumulatedAnswer = parsed.content;
                }
              } else if (parsed.type === 'error') {
                accumulatedAnswer = `⚠️ ${parsed.content}`;
              }
            } catch (e) {
              if (line.trim()) accumulatedAnswer = line.trim();
            }
          }
        }

        const reply = accumulatedAnswer || '응답이 완료되었습니다.';
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === 'assistant') {
            last.text = reply;
            last.isStreaming = false;
          }
          return updated;
        });
        speakText(reply);
      } else {
        const data = await resp.json();
        const reply = data.reply || data.response || (typeof data === 'string' ? data : JSON.stringify(data));
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === 'assistant') {
            last.text = reply;
            last.isStreaming = false;
          }
          return updated;
        });
        speakText(reply);
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.sender === 'assistant') {
          last.text = `⚠️ 응답 실패: ${err.message || '서버 통신 오류'}`;
          last.isStreaming = false;
        }
        return updated;
      });
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

  // Clear chat / Start fresh session
  const handleClearChat = () => {
    const initial = [
      { sender: 'assistant', text: '안녕하세요! 새로운 대화 세션이 시작되었습니다. 무엇이든 물어보세요.' }
    ];
    setMessages(initial);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('agent_chat_messages', JSON.stringify(initial));
      } catch (e) {}
    }
  };

  return (
    <div className="agent-container-box">
      
      {/* Status Box (Hidden on Mobile) */}
      <div className="agent-status-section mobile-hidden">
        <AgentStatusBox
          status="ONLINE"
          skillsCount={skills.length}
          activeTasksCount={0}
          currentModel={currentModel}
        />
      </div>

      {/* 5. Tab Box: Dynamic Box Group Switcher (Hidden on Mobile) */}
      <div className="agent-tab-section mobile-hidden">
        <AgentTabBox
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />
      </div>

      {/* Dynamic Sub-Box Rendering according to Tab Box */}
      <div className="agent-active-box-view">
        
        {/* 1. Chat Box View */}
        {activeTab === 'chat' && (
          <div className="agent-chat-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%', flex: 1 }}>
            <ChatBox
              messages={messages}
              inputPrompt={inputPrompt}
              setInputPrompt={setInputPrompt}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
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

            {showAvatar && (
              <div className="avatar-canvas-wrapper mobile-hidden" style={{
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

        {/* 2. Skill Workshop Box (2-1. Edit + 2-2. Info + 2-3. Test) */}
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
