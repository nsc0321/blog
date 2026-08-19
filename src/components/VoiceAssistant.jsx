import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Menu, X, ChevronLeft, ChevronRight, Key, Plus, Trash2, Edit2, Save, Link2, Lock, LogOut, User, Eye, EyeOff, Activity, AlertCircle, CheckCircle, Loader, StopCircle, Clock, History, Calendar, Filter, Search, ArrowUpDown, Bot, Globe, RefreshCw, AlertTriangle } from 'lucide-react';
import AvatarCanvas from './AvatarCanvas';
import AgentChat from './AgentChat';
import SkillWorkshop from './SkillWorkshop';
import CredentialsManager from './CredentialsManager';
import RealtimeMonitor from './RealtimeMonitor';
import ExecutionHistory from './ExecutionHistory';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'https://ragweed-blighted-skylight.ngrok-free.dev' : '');

export default function VoiceAssistant() {
  // Show/Hide Avatar State
  const [showAvatar, setShowAvatar] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agent_show_avatar');
      return saved === null ? false : saved === 'true';
    }
    return false;
  });

  const handleToggleAvatar = () => {
    setShowAvatar(prev => {
      const newVal = !prev;
      localStorage.setItem('agent_show_avatar', String(newVal));
      return newVal;
    });
  };

  const handleToggleTts = () => {
    setTtsEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('agent_tts_enabled', String(newVal));
      return newVal;
    });
  };

  // Auth states
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_auth_token') || '';
    }
    return '';
  });
  const [usernameState, setUsernameState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_auth_username') || '';
    }
    return '';
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginError("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(loginForm)
      });
      const data = await resp.json();
      if (resp.ok) {
        localStorage.setItem('agent_auth_token', data.token);
        localStorage.setItem('agent_auth_username', data.username);
        setToken(data.token);
        setUsernameState(data.username);
        setLoginForm({ username: '', password: '' });
      } else {
        setLoginError(data.detail || data.message || "로그인 정보가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agent_auth_token');
    localStorage.removeItem('agent_auth_username');
    setToken('');
    setUsernameState('');
    alert("로그아웃 되었습니다.");
  };

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'ngrok-skip-browser-warning': 'true',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const targetUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const resp = await fetch(targetUrl, {
      ...options,
      headers
    });
    
    if (resp.status === 401) {
      localStorage.removeItem('agent_auth_token');
      localStorage.removeItem('agent_auth_username');
      setToken('');
      setUsernameState('');
    }
    
    return resp;
  }, [token]);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요!' }
  ]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agent_tts_enabled');
      return saved === null ? false : saved === 'true';
    }
    return false;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState('ko-KR');

  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agent_audio_output_device') || '';
    }
    return '';
  });

  const updateAudioDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices.filter(d => d.kind === 'audiooutput');
      setAudioDevices(outputs);
    } catch (err) {
      console.warn("Failed to enumerate audio devices:", err);
    }
  }, []);

  useEffect(() => {
    updateAudioDevices();
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', updateAudioDevices);
    }
    return () => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', updateAudioDevices);
      }
    };
  }, [updateAudioDevices]);

  const [activeTab, setActiveTab] = useState('agent');
  const [skills, setSkills] = useState([]);
  const [selectedSkillName, setSelectedSkillName] = useState('');
  const [skillCode, setSkillCode] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [skillRunnerArgs, setSkillRunnerArgs] = useState('');
  const [skillRunnerOutput, setSkillRunnerOutput] = useState('');
  
  const [isRunningSkill, setIsRunningSkill] = useState(false);
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  // Agent Control Center states (integrated from agentCli)
  const [dbConnected, setDbConnected] = useState(false);
  const [llmConnected, setLlmConnected] = useState(false);
  const [llmModel, setLlmModel] = useState(null);
  const [maxSteps, setMaxSteps] = useState(50);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Credentials Management states
  const [credentials, setCredentials] = useState([]);
  const [isCredLoading, setIsCredLoading] = useState(false);
  const [selectedCredId, setSelectedCredId] = useState(null); // null means creating new
  const [credForm, setCredForm] = useState({
    site_name: '',
    domain: '',
    username: '',
    secret_key: '',
    description: ''
  });
  const [isSavingCred, setIsSavingCred] = useState(false);
  const [isNewCredFormOpen, setIsNewCredFormOpen] = useState(false);

  // Monitor tab states
  const [monitorTasks, setMonitorTasks] = useState([]);
  const [monitorLogs, setMonitorLogs] = useState([]);
  const [isCancellingTask, setIsCancellingTask] = useState({});
  const monitorLogsEndRef = useRef(null);
  const monitorPollRef = useRef(null);



  const fetchCredentials = useCallback(async () => {
    setIsCredLoading(true);
    try {
      const resp = await authFetch('/api/credentials');
      if (resp.ok) {
        const data = await resp.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    } finally {
      setIsCredLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (activeTab === 'credentials') {
      fetchCredentials();
    }
  }, [activeTab, fetchCredentials]);

  // Monitor: polling
  const fetchMonitorData = useCallback(async () => {
    try {
      const [tasksResp, logsResp] = await Promise.all([
        fetch(`${API_BASE}/api/agent/tasks`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
        fetch(`${API_BASE}/api/agent/logs?limit=100`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
      ]);
      if (tasksResp.ok) setMonitorTasks(await tasksResp.json());
      if (logsResp.ok) setMonitorLogs(await logsResp.json());
    } catch (e) {
      console.warn('Monitor poll failed:', e);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'monitor') {
      fetchMonitorData();
      monitorPollRef.current = setInterval(fetchMonitorData, 3000);
    } else {
      if (monitorPollRef.current) clearInterval(monitorPollRef.current);
    }
    return () => { if (monitorPollRef.current) clearInterval(monitorPollRef.current); };
  }, [activeTab, fetchMonitorData]);

  useEffect(() => {
    if (activeTab === 'monitor' && monitorLogsEndRef.current) {
      monitorLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [monitorLogs, activeTab]);

  const handleCancelTask = async (taskId) => {
    setIsCancellingTask(prev => ({ ...prev, [taskId]: true }));
    try {
      const resp = await authFetch(`/api/agent/tasks/${taskId}`, { method: 'DELETE' });
      if (resp.ok) {
        await fetchMonitorData();
        fetchHistoryData();
      } else {
        const data = await resp.json();
        alert(data.detail || '중단 요청 실패');
      }
    } catch (e) {
      alert('중단 요청 중 오류: ' + e.message);
    } finally {
      setIsCancellingTask(prev => ({ ...prev, [taskId]: false }));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get('google_auth');
    if (googleAuth) {
      if (googleAuth === 'success') {
        alert("구글 계정 인증이 완료되었습니다! 이제 챗봇이 이메일을 가져올 수 있습니다.");
        setActiveTab('credentials');
      } else if (googleAuth === 'error') {
        const errorMsg = params.get('error_msg') || '알 수 없는 오류가 발생했습니다.';
        alert("구글 계정 인증에 실패하였습니다: " + errorMsg);
      }
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: newUrl }, '', newUrl);
      return;
    }

    const code = params.get('code');
    if (code) {
      const exchangeCode = async () => {
        try {
          const currentUrl = window.location.origin + window.location.pathname;
          const resp = await authFetch('/api/auth/google/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirect_uri: currentUrl })
          });
          const data = await resp.json();
          if (resp.ok) {
            alert("구글 계정 인증이 완료되었습니다! 이제 챗봇이 이메일을 가져올 수 있습니다.");
            setActiveTab('credentials');
            if (fetchCredentials) {
              fetchCredentials();
            }
          } else {
            alert("구글 계정 인증에 실패하였습니다: " + (data.detail || '알 수 없는 오류'));
          }
        } catch (err) {
          console.error(err);
          alert("인증 요청 중 오류가 발생했습니다: " + err.message);
        } finally {
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }
      };
      exchangeCode();
    }
  }, [authFetch, fetchCredentials]);

  const handleSaveCredential = async (e) => {
    if (e) e.preventDefault();
    if (!credForm.site_name) {
      alert("사이트 식별명을 입력해 주세요.");
      return;
    }
    setIsSavingCred(true);
    try {
      const url = selectedCredId 
        ? `/api/credentials/${selectedCredId}` 
        : '/api/credentials';
      const method = selectedCredId ? 'PUT' : 'POST';

      const resp = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credForm)
      });
      const data = await resp.json();
      if (resp.ok) {
        alert(selectedCredId ? "성공적으로 수정되었습니다." : "성공적으로 추가되었습니다.");
        setCredForm({ site_name: '', domain: '', username: '', secret_key: '', description: '' });
        setSelectedCredId(null);
        setIsNewCredFormOpen(false);
        fetchCredentials();
      } else {
        alert("실패: " + (data.detail || data.message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error(err);
      alert("오류 발생: " + err.message);
    } finally {
      setIsSavingCred(false);
    }
  };

  const handleDeleteCredential = async (id, siteName) => {
    if (!confirm(`정말로 '${siteName}' 계정 연결 정보를 삭제하시겠습니까?`)) return;
    try {
      const resp = await authFetch(`/api/credentials/${id}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        alert("삭제되었습니다.");
        fetchCredentials();
      } else {
        const data = await resp.json();
        alert("삭제 실패: " + (data.detail || data.message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error(err);
      alert("오류 발생: " + err.message);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await authFetch('/api/status');
      if (resp.ok) {
        const data = await resp.json();
        setDbConnected(data.db_connected);
        setLlmConnected(data.llm_connected);
        setLlmModel(data.llm_model);
      }
    } catch (err) {
      console.error("Failed to fetch system status:", err);
      setDbConnected(false);
      setLlmConnected(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const recognitionRef = useRef(null);
  const logEndRef = useRef(null);
  const messageEndRef = useRef(null);

  const [voices, setVoices] = useState([]);

  // Auto-scroll to bottom of logs and messages
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'agent') {
      const timer = setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Load available speech voices asynchronously
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find the most natural/neural voice available
  const selectVoice = useCallback((langCode) => {
    if (voices.length === 0) return null;
    
    const targetLang = langCode.toLowerCase();
    const langPrefix = targetLang.split('-')[0];
    
    // Keywords for premium/neural voices
    const preferredNameParts = ["natural", "online", "neural", "google", "microsoft", "sunhi", "heami", "yuna", "aria", "jenny", "samantha"];
    
    const matchedVoices = voices.filter(v => v.lang.toLowerCase() === targetLang || v.lang.toLowerCase().startsWith(langPrefix));
    
    if (matchedVoices.length === 0) return null;
    
    const scored = matchedVoices.map(voice => {
      const name = voice.name.toLowerCase();
      let score = 0;
      
      if (voice.lang.toLowerCase() === targetLang) {
        score += 100;
      } else if (voice.lang.toLowerCase().startsWith(langPrefix)) {
        score += 50;
      }
      
      preferredNameParts.forEach(part => {
        if (name.includes(part)) {
          score += 15;
        }
      });
      
      return { voice, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.voice;
  }, [voices]);

  const audioRef = useRef(null);
  const audioQueueRef = useRef([]);
  const currentQueueIndexRef = useRef(0);
  const isPlayingQueueRef = useRef(false);

  // Fallback Web Speech API Speak
  const fallbackSpeak = useCallback((cleanText) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const selectedVoice = selectVoice(lang);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = lang;
    }

    utterance.rate = lang.startsWith('ko') ? 0.92 : 0.96;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [lang, selectVoice]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (e) {
        console.warn(e);
      }
      audioRef.current = null;
    }
    
    // Revoke and clear all queued audios
    if (audioQueueRef.current) {
      audioQueueRef.current.forEach(item => {
        if (item.audio) {
          try {
            item.audio.pause();
          } catch (e) {}
        }
        if (item.audioUrl) {
          URL.revokeObjectURL(item.audioUrl);
        }
      });
      audioQueueRef.current = [];
    }

    isPlayingQueueRef.current = false;
    setIsSpeaking(false);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Text to Speech using Supertonic API with sentence-splitting and sequential queue playback
  const speak = useCallback(async (text) => {
    if (!ttsEnabled || typeof window === 'undefined') return;

    // Stop any current playback
    stopSpeaking();
    
    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*#`_\-\[\]()]/g, '')
      .trim();

    if (!cleanText) return;

    // Split text into sentences using lookbehind pattern (splits at . ! ? (not preceded by digits) followed by space, or newlines)
    const sentences = cleanText.split(/(?<=(?<!\d)[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 0);
    if (sentences.length === 0) return;

    const voiceName = lang.startsWith('ko') ? 'F1' : 'M1';

    setIsSpeaking(true);
    isPlayingQueueRef.current = true;
    currentQueueIndexRef.current = 0;

    // Initialize the execution queue
    const queue = sentences.map(s => ({
      text: s,
      audioUrl: null,
      audio: null,
      status: 'pending' // 'pending' | 'loading' | 'ready' | 'error'
    }));
    audioQueueRef.current = queue;

    // Play fallback Web Speech synthesis for a single sentence
    const playFallback = (sentenceText) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        currentQueueIndexRef.current += 1;
        playNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentenceText);
      const selectedVoice = selectVoice(lang);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = lang;
      }

      utterance.onend = () => {
        currentQueueIndexRef.current += 1;
        playNext();
      };

      utterance.onerror = () => {
        currentQueueIndexRef.current += 1;
        playNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    // Sequential Queue Runner
    const playNext = () => {
      if (!isPlayingQueueRef.current) return;

      const index = currentQueueIndexRef.current;
      if (index >= queue.length) {
        // Queue fully complete
        setIsSpeaking(false);
        isPlayingQueueRef.current = false;
        return;
      }

      const currentItem = queue[index];

      if (currentItem.status === 'ready' && currentItem.audio) {
        audioRef.current = currentItem.audio;
        
        currentItem.audio.onended = () => {
          if (currentItem.audioUrl) {
            URL.revokeObjectURL(currentItem.audioUrl);
            currentItem.audioUrl = null;
          }
          currentQueueIndexRef.current += 1;
          playNext();
        };

        currentItem.audio.onerror = () => {
          if (currentItem.audioUrl) {
            URL.revokeObjectURL(currentItem.audioUrl);
            currentItem.audioUrl = null;
          }
          // Fallback to browser TTS for this sentence
          playFallback(currentItem.text);
        };

        currentItem.audio.play().catch(err => {
          console.error("Audio playback error:", err);
          playFallback(currentItem.text);
        });

      } else if (currentItem.status === 'error') {
        playFallback(currentItem.text);
      } else {
        // Still loading, fetchSentence will trigger playNext once ready
        console.log(`Waiting for sentence [${index}] to be ready...`);
      }
    };

    // Fetch sound file for specific index
    const fetchSentence = async (index) => {
      if (index >= queue.length || !isPlayingQueueRef.current) return;
      if (queue[index].status !== 'pending') return;

      queue[index].status = 'loading';
      try {
        const response = await authFetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: queue[index].text,
            lang: lang,
            voice: voiceName
          })
        });

        if (!response.ok) {
          throw new Error('TTS failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        if (selectedAudioDevice && typeof audio.setSinkId === 'function') {
          audio.setSinkId(selectedAudioDevice).catch(err => {
            console.warn("Failed to set audio output device sink ID:", err);
          });
        }
        
        queue[index].audioUrl = audioUrl;
        queue[index].audio = audio;
        queue[index].status = 'ready';

        // If the queue runner is currently waiting for this specific index, play it!
        if (isPlayingQueueRef.current && currentQueueIndexRef.current === index) {
          playNext();
        }
      } catch (err) {
        console.warn(`Failed to synthesize sentence: "${queue[index].text}"`, err);
        queue[index].status = 'error';
        
        if (isPlayingQueueRef.current && currentQueueIndexRef.current === index) {
          playNext();
        }
      }

      // Pre-fetch the next sentence in parallel
      fetchSentence(index + 1);
    };

    // Start background pre-fetching (first two sentences in parallel)
    fetchSentence(0);
    fetchSentence(1);

    // Start playback runner
    playNext();

  }, [ttsEnabled, lang, selectVoice, stopSpeaking, fallbackSpeak, authFetch, selectedAudioDevice]);

  const unlockAudio = () => {
    if (typeof window !== 'undefined') {
      try {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (AudioContextConstructor) {
          const ctx = new AudioContextConstructor();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch (e) {
        console.warn('AudioContext resume failed:', e);
      }
    }
  };

  // Initialize Speech Recognition
  const initSpeech = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechConstructor = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechConstructor) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechConstructor();
    rec.continuous = false;
    rec.interimResults = true; // Capture real-time interim recognition results
    rec.lang = lang;

    rec.onstart = () => {
      setIsListening(true);
      setTranscript('');
      updateAudioDevices();
    };

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment;
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setTranscript(currentText);
      setInputText(currentText);

      // Trigger automatic send when the final transcript block is resolved
      if (finalTranscript.trim()) {
        handleSendMessage(finalTranscript.trim());
      }
    };

    rec.onerror = (e) => {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, [lang, updateAudioDevices]);

  // Toggle listening
  const toggleListening = () => {
    unlockAudio();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      if (!recognitionRef.current) {
        initSpeech();
      }
      try {
        setTranscript('');
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    }
  };

  // Call Agent REST API
  const handleSendMessage = async (textToSend) => {
    unlockAudio();
    const queryText = textToSend || inputText;
    if (!queryText.trim()) return;

    // Stop listening/speaking if running
    recognitionRef.current?.stop();
    stopSpeaking();

    // Add user message & initial empty assistant message with isThinking = true
    setMessages(prev => [
      ...prev, 
      { role: 'user', content: queryText },
      { role: 'assistant', content: '', logs: [], isThinking: true }
    ]);
    setInputText('');
    setTranscript('');
    setIsLoading(true);
    setLogs([]);

    try {
      // Build conversation history format for Agent
      const history = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await authFetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: queryText,
          chat_history: history,
          max_steps: maxSteps
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalAnswer = '';
      let accumulatedLogs = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'log') {
                accumulatedLogs.push(data.content);
                setLogs([...accumulatedLogs]);
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.logs = [...accumulatedLogs];
                  }
                  return updated;
                });
              } else if (data.type === 'answer') {
                finalAnswer = data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = finalAnswer;
                    lastMsg.isThinking = false;
                  }
                  return updated;
                });
                speak(finalAnswer);
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch (jsonErr) {
              console.warn("Failed to parse stream line:", line, jsonErr);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg = '에이전트와의 연결에 실패했습니다. 백엔드 서버 상태를 확인해 주세요.';
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = errMsg;
          lastMsg.isThinking = false;
        }
        return updated;
      });
      speak(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup initial recognition
  useEffect(() => {
    initSpeech();
  }, [lang, initSpeech]);

  // Fetch registered skills
  const fetchSkills = useCallback(async () => {
    try {
      const resp = await authFetch('/api/skills');
      if (resp.ok) {
        const data = await resp.json();
        setSkills(data);
        if (data.length > 0 && !selectedSkillName) {
          setSelectedSkillName(data[0].name);
          setSkillCode(data[0].code);
          setSkillDescription(data[0].description || '');
        }
      }
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    }
  }, [selectedSkillName, authFetch]);

  // Load skills on mount and tab switch
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Sync selected skill details
  useEffect(() => {
    const skill = skills.find(s => s.name === selectedSkillName);
    if (skill) {
      setSkillCode(skill.code);
      setSkillDescription(skill.description || '');
      setSkillRunnerOutput('');
    }
  }, [selectedSkillName, skills]);

  const handleSaveSkill = async () => {
    if (!selectedSkillName) return;
    setIsSavingSkill(true);
    try {
      const resp = await authFetch('/api/skills/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedSkillName,
          code: skillCode,
          description: skillDescription
        })
      });
      const data = await resp.json();
      if (data.success) {
        alert("스킬 저장 및 검증 성공!");
      } else {
        alert("검증 실패: " + data.message);
      }
      fetchSkills();
    } catch (err) {
      console.error(err);
      alert("스킬 저장 실패: " + err.message);
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleGenerateSkill = async () => {
    if (!newSkillName || !newSkillDesc) {
      alert("스킬명과 명세(사양)를 입력해 주세요.");
      return;
    }
    setIsGeneratingSkill(true);
    try {
      const resp = await authFetch('/api/skills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillName,
          description: newSkillDesc
        })
      });
      if (!resp.ok) throw new Error("LLM generation failed");
      const data = await resp.json();
      
      const saveResp = await authFetch('/api/skills/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillName,
          code: data.code,
          description: newSkillDesc
        })
      });
      const saveData = await saveResp.json();
      if (saveData.success) {
        alert(`스킬 '${newSkillName}' 생성 및 검증 완료!`);
        setNewSkillName('');
        setNewSkillDesc('');
        setSelectedSkillName(newSkillName);
      } else {
        alert("스킬 생성은 되었으나 컴파일 검증 실패: " + saveData.message);
      }
      fetchSkills();
    } catch (err) {
      console.error(err);
      alert("스킬 생성 실패: " + err.message);
    } finally {
      setIsGeneratingSkill(false);
    }
  };

  const handleRunSkill = async () => {
    if (!selectedSkillName) return;
    setIsRunningSkill(true);
    setSkillRunnerOutput('Executing...');
    try {
      const args = {};
      const pairs = skillRunnerArgs.split(",");
      for (const pair of pairs) {
        if (pair.includes("=")) {
          const [k, v] = pair.split("=");
          args[k.trim()] = v.trim();
        }
      }

      const resp = await authFetch('/api/skills/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedSkillName,
          arguments: args
        })
      });
      const data = await resp.json();
      setSkillRunnerOutput(data.result || "No output");
    } catch (err) {
      console.error(err);
      setSkillRunnerOutput("Execution failed: " + err.message);
    } finally {
      setIsRunningSkill(false);
    }
  };

  const handleDeleteSkill = async (name) => {
    if (!confirm(`정말로 스킬 '${name}'을 삭제하시겠습니까?`)) return;
    try {
      const resp = await authFetch(`/api/skills/${name}`, {
        method: 'DELETE'
      });
      const data = await resp.json();
      alert(data.message);
      setSelectedSkillName('');
      fetchSkills();
    } catch (err) {
      console.error(err);
      alert("삭제 실패: " + err.message);
    }
  };

  if (!token) {
    return (
      <div className="voice-assistant-panel" style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '40px 24px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '480px',
        width: '100%',
        margin: '60px auto',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--accent-gradient)',
          padding: '16px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)'
        }}>
          <Lock size={32} style={{ color: '#fff' }} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI Voice Agent Portal
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 28px 0' }}>
          에이전트 조작 및 정보 보호를 위해 로그인이 필요합니다.
        </p>

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>사용자 아이디 (ID)</label>
            <input
              type="text"
              required
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              placeholder="아이디를 입력하세요"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>비밀번호 (Password)</label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="비밀번호를 입력하세요"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {loginError && (
            <div style={{
              fontSize: '12px',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'left'
            }}>
              ⚠️ {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              background: 'var(--accent-gradient)',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '700',
              marginTop: '8px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              opacity: isLoggingIn ? 0.7 : 1,
              transition: 'transform 0.1s'
            }}
          >
            {isLoggingIn ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '32px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
          width: '100%',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dbConnected ? '#10b981' : '#ef4444' }}></div>
            <span>Database</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: llmConnected ? '#10b981' : '#ef4444' }}></div>
            <span>LLM Backend</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-assistant-panel" style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      padding: '24px',
      color: '#fff',
      display: 'flex',
      gap: '24px',
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    }}>
      {/* Overlay background for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CONTROL CENTER */}
      <div 
        className={`sidebar-control-center ${isSidebarOpen ? 'open' : ''}`} 
        style={{
          width: isSidebarOpen ? '260px' : '0px',
          height: isSidebarOpen ? 'auto' : '0px',
          maxHeight: isSidebarOpen ? 'none' : '0px',
          borderRight: isSidebarOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          paddingRight: isSidebarOpen ? '24px' : '0px',
          opacity: isSidebarOpen ? 1 : 0,
          pointerEvents: isSidebarOpen ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          flexShrink: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              🧠 Control Center
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Agent status & preferences</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="sidebar-close-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              display: 'none',
              padding: '6px',
              borderRadius: '8px'
            }}
            title="닫기"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔌 System Connectivity
          </h3>
          
          {/* DB Badge */}
          <div style={{
            background: dbConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dbConnected ? '#10b981' : '#ef4444' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: dbConnected ? '#10b981' : '#ef4444' }}>
                Database
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                {dbConnected ? 'Connected (PostgreSQL)' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* LLM Badge */}
          <div style={{
            background: llmConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${llmConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: llmConnected ? '#10b981' : '#ef4444' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: llmConnected ? '#10b981' : '#ef4444' }}>
                LLM Backend
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={llmModel || ''}>
                {llmConnected ? `Connected (${llmModel || 'Active'})` : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚙️ Settings (설정)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>Max Steps: <strong>{maxSteps === 0 ? '♾️ 무제한 (Unlimited)' : `${maxSteps}단계`}</strong></span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={maxSteps} 
              onChange={(e) => setMaxSteps(parseInt(e.target.value))} 
              style={{
                width: '100%',
                accentColor: 'var(--accent-primary)',
                background: 'rgba(255,255,255,0.1)',
                height: '4px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              최대 실행 단계 수 지정 (0 설정 시 무제한, 기본: 50)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>음성 출력 장치 (Audio Output):</span>
            </div>
            <select
              value={selectedAudioDevice}
              onChange={(e) => {
                const devId = e.target.value;
                setSelectedAudioDevice(devId);
                localStorage.setItem('agent_audio_output_device', devId);
              }}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="" style={{ color: '#000' }}>기본 장치 (Default)</option>
              {audioDevices.map(d => (
                <option key={d.deviceId} value={d.deviceId} style={{ color: '#000' }}>
                  {d.label || `장치 (${d.deviceId.slice(0, 5)}...)`}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              출력할 오디오 디바이스 선택
            </span>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={14} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={usernameState}>
              {usernameState}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={12} /> 로그아웃
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
      <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px',
                transition: 'background 0.2s'
              }}
              title="설정 및 상태 제어"
            >
              {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
            </button>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isListening ? '#ef4444' : '#10b981', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}></div>
          </div>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
            <button 
              onClick={() => setActiveTab('agent')}
              style={{
                background: activeTab === 'agent' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
            >
              agent
            </button>
            <button 
              onClick={() => setActiveTab('workshop')}
              style={{
                background: activeTab === 'workshop' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
            >
              skills
            </button>
            <button 
              onClick={() => setActiveTab('credentials')}
              style={{
                background: activeTab === 'credentials' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
            >
              accounts
            </button>
            <button 
              onClick={() => setActiveTab('monitor')}
              style={{
                background: activeTab === 'monitor' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Activity size={13} />
              monitor
              {monitorTasks.filter(t => t.status === 'running' || t.status === 'cancelling').length > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '10px',
                  padding: '1px 5px',
                  fontWeight: '700',
                  lineHeight: '1.4'
                }}>
                  {monitorTasks.filter(t => t.status === 'running' || t.status === 'cancelling').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{
                background: activeTab === 'history' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <History size={13} />
              처리 내역
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          {activeTab === 'agent' && (
            <>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <option value="ko-KR" style={{ color: '#000' }}>한국어 (Korean)</option>
                <option value="en-US" style={{ color: '#000' }}>English (US)</option>
              </select>
              <button 
                onClick={handleToggleTts} 
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                title={ttsEnabled ? "음성 안내 끄기" : "음성 안내 켜기"}
              >
                {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button 
                onClick={handleToggleAvatar} 
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                title={showAvatar ? "아바타 숨기기" : "아바타 보이기"}
              >
                {showAvatar ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'agent' ? (
        <AgentChat
          showAvatar={showAvatar}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isLoading={isLoading}
          messages={messages}
          transcript={transcript}
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
          toggleListening={toggleListening}
          speak={speak}
          messageEndRef={messageEndRef}
        />
      ) : activeTab === 'workshop' ? (
        <SkillWorkshop
          skills={skills}
          selectedSkillName={selectedSkillName}
          setSelectedSkillName={setSelectedSkillName}
          skillDescription={skillDescription}
          setSkillDescription={setSkillDescription}
          skillCode={skillCode}
          setSkillCode={setSkillCode}
          handleSaveSkill={handleSaveSkill}
          isSavingSkill={isSavingSkill}
          handleDeleteSkill={handleDeleteSkill}
          skillRunnerArgs={skillRunnerArgs}
          setSkillRunnerArgs={setSkillRunnerArgs}
          handleRunSkill={handleRunSkill}
          isRunningSkill={isRunningSkill}
          skillRunnerOutput={skillRunnerOutput}
          newSkillName={newSkillName}
          setNewSkillName={setNewSkillName}
          newSkillDesc={newSkillDesc}
          setNewSkillDesc={setNewSkillDesc}
          handleGenerateSkill={handleGenerateSkill}
          isGeneratingSkill={isGeneratingSkill}
        />
      ) : activeTab === 'credentials' ? (
        <CredentialsManager
          credentials={credentials}
          isCredLoading={isCredLoading}
          authFetch={authFetch}
          selectedCredId={selectedCredId}
          setSelectedCredId={setSelectedCredId}
          credForm={credForm}
          setCredForm={setCredForm}
          handleSaveCredential={handleSaveCredential}
          isSavingCred={isSavingCred}
          handleDeleteCredential={handleDeleteCredential}
        />
      ) : activeTab === 'monitor' ? (
        <RealtimeMonitor
          monitorTasks={monitorTasks}
          monitorLogs={monitorLogs}
          fetchMonitorData={fetchMonitorData}
          handleCancelTask={handleCancelTask}
          isCancellingTask={isCancellingTask}
          monitorLogsEndRef={monitorLogsEndRef}
        />
      ) : activeTab === 'history' ? (
        <ExecutionHistory
          API_BASE={API_BASE}
          authFetch={authFetch}
          activeTab={activeTab}
          handleCancelTask={handleCancelTask}
          isCancellingTask={isCancellingTask}
        />
      ) : null}
      </div>

      {/* Embedded Animations CSS */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .dot {
          color: rgba(255,255,255,0.7);
          display: inline-block;
          font-size: 18px;
          animation: wave 1.2s infinite ease-in-out;
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .wave-bar {
          display: inline-block;
          width: 3px;
          background: #ef4444;
          border-radius: 2px;
          animation: audio-wave 1s ease-in-out infinite alternate;
        }
        @keyframes audio-wave {
          0% { height: 10%; }
          100% { height: 100%; }
        }
        @media (max-width: 768px) {
          .voice-assistant-panel {
            flex-direction: column !important;
            padding: 10px 8px !important;
            gap: 16px !important;
            border-radius: 16px !important;
            position: relative;
          }
          .sidebar-control-center {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            z-index: 1010 !important;
            background: #111122 !important;
            width: 280px !important;
            max-width: 85% !important;
            padding: 16px !important;
            border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
            transform: translateX(-100%);
            opacity: 0 !important;
            visibility: hidden;
            pointer-events: none;
          }
          .responsive-grid > div {
            padding: 12px !important;
            border-radius: 12px !important;
          }
          .chat-panel {
            padding: 10px !important;
            border-radius: 12px !important;
            height: 360px !important;
          }
          .sidebar-control-center.open {
            transform: translateX(0) !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            box-shadow: 10px 0 40px rgba(0,0,0,0.8);
          }
          .sidebar-close-btn {
            display: block !important;
          }
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 1000;
          }
          .header-controls {
            justify-content: flex-start !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            padding-bottom: 8px !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
            scrollbar-width: none;
          }
          .header-controls::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
