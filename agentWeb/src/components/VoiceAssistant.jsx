import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Menu, X, ChevronLeft, ChevronRight, Key, Plus, Trash2, Edit2, Save, Link2, Lock, LogOut, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function VoiceAssistant() {
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
        headers: { 'Content-Type': 'application/json' },
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
    { role: 'assistant', content: '안녕하세요! 무엇을 도와드릴까요? 음성이나 텍스트로 명령해 주세요. (예: "서울 날씨 알려줘", "웹에서 NVIDIA Blackwell 출시일 검색해줘")' }
  ]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
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
    }
  }, []);

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
              <span>Max Steps: <strong>{maxSteps}</strong></span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
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
              최대 실행 단계 수 지정
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
                onClick={() => setTtsEnabled(!ttsEnabled)} 
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
            </>
          )}
        </div>
      </div>

      {activeTab === 'agent' ? (
        <>
          {/* Main Layout: Conversation only */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '400px' }}>
            
            {/* Chat / Messages Panel */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              overflow: 'hidden'
            }}>
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    background: m.role === 'user' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.1)',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                    maxWidth: '85%',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    <div>{m.content}</div>
                    {m.logs && m.logs.length > 0 && (
                      <details open={true} style={{
                        marginTop: '8px',
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        width: '100%'
                      }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#38bdf8', outline: 'none' }}>
                          ⚙️ Agent Execution Logs ({m.logs.length} steps)
                        </summary>
                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', color: '#e2e8f0' }}>
                          {m.logs.map((log, idx) => (
                            <div key={idx} style={{ 
                              padding: '4px 6px', 
                              borderLeft: '2px solid #38bdf8', 
                              background: 'rgba(56, 189, 248, 0.05)',
                              wordBreak: 'break-all'
                            }}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {m.role === 'assistant' && (
                      <button 
                        onClick={() => speak(m.content)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          marginTop: '4px'
                        }}
                        title="다시 듣기 (Replay)"
                      >
                        <Volume2 size={12} /> 다시 듣기
                      </button>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: 'flex', gap: '4px', alignSelf: 'flex-start', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                    <span className="dot" style={{ animationDelay: '0s' }}>●</span>
                    <span className="dot" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="dot" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </div>
          </div>
 
          {/* Voice Visualizer / Audio Meter */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
            {isListening ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '20px' }}>
                  <span className="wave-bar" style={{ height: '100%', animationDelay: '0.1s' }}></span>
                  <span className="wave-bar" style={{ height: '60%', animationDelay: '0.3s' }}></span>
                  <span className="wave-bar" style={{ height: '80%', animationDelay: '0.5s' }}></span>
                  <span className="wave-bar" style={{ height: '40%', animationDelay: '0.2s' }}></span>
                  <span className="wave-bar" style={{ height: '90%', animationDelay: '0.4s' }}></span>
                </div>
                <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '600', fontStyle: 'italic', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  {transcript ? `🎙️ "${transcript}"` : "🎙️ 듣고 있습니다..."}
                </div>
              </div>
            ) : (
              <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSpeaking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontSize: '13px', fontWeight: '500' }}>
                    <span>🔊 대답하는 중...</span>
                  </div>
                )}
              </div>
            )}
 
            {/* Controls Panel */}
            <div style={{ display: 'flex', width: '100%', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={toggleListening}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: isListening ? '#ef4444' : 'var(--accent-gradient)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s'
                }}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="여기에 명령을 직접 입력할 수도 있습니다..."
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                style={{
                  background: 'var(--accent-gradient)',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: inputText.trim() ? 1 : 0.5
                }}
              >
                <Send size={16} /> 전송
              </button>
            </div>
          </div>
        </>
      ) : activeTab === 'workshop' ? (
        /* Tab 2: Skill Workshop Panel */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', minHeight: '450px' }}>
          {/* Left Column: Explorer & Editor */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            height: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '60%' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>스킬 선택:</span>
                <select
                  value={selectedSkillName}
                  onChange={(e) => setSelectedSkillName(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <option value="" disabled style={{ color: '#000' }}>스킬을 선택하세요</option>
                  {skills.map(s => (
                    <option key={s.name} value={s.name} style={{ color: '#000' }}>
                      {s.name} {s.is_verified ? '✅' : '❌'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSkillName && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleDeleteSkill(selectedSkillName)}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    🗑️ 삭제
                  </button>
                </div>
              )}
            </div>

            {selectedSkillName ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>설명 / Docstring</span>
                  <input
                    type="text"
                    value={skillDescription}
                    onChange={(e) => setSkillDescription(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px',
                      marginTop: '4px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Python 소스 코드</span>
                    {skills.find(s => s.name === selectedSkillName)?.is_verified ? (
                      <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>✅ 검증 완료</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>❌ 검증 실패 / 미검증</span>
                    )}
                  </div>
                  
                  <textarea
                    value={skillCode}
                    onChange={(e) => setSkillCode(e.target.value)}
                    style={{
                      width: '100%',
                      height: '220px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      marginTop: '6px',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                </div>

                {skills.find(s => s.name === selectedSkillName)?.verification_error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderLeft: '3px solid #ef4444',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#fca5a5',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '60px',
                    overflowY: 'auto'
                  }}>
                    {skills.find(s => s.name === selectedSkillName).verification_error}
                  </div>
                )}

                <button
                  onClick={handleSaveSkill}
                  disabled={isSavingSkill}
                  style={{
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: isSavingSkill ? 0.6 : 1,
                    textAlign: 'center'
                  }}
                >
                  {isSavingSkill ? '💾 저장 및 검증 중...' : '💾 저장 및 컴파일 검증'}
                </button>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '40px', textAlign: 'center', margin: 'auto' }}>
                스킬이 없습니다. 오른쪽 패널에서 새로운 스킬을 제작해 보세요.
              </div>
            )}
          </div>

          {/* Right Column: Run Skill & Design New Skill */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Action 1: Manual Runner */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px' }}>
                🚀 스킬 테스트 실행
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>인자 (Arguments - 콤마 분리, e.g. key=value)</span>
                  <input
                    type="text"
                    value={skillRunnerArgs}
                    onChange={(e) => setSkillRunnerArgs(e.target.value)}
                    placeholder="e.g. query=Seoul, limit=3"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>
                <button
                  onClick={handleRunSkill}
                  disabled={isRunningSkill || !selectedSkillName}
                  style={{
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    opacity: (!selectedSkillName || isRunningSkill) ? 0.5 : 1
                  }}
                >
                  {isRunningSkill ? '실행 중...' : '스킬 실행'}
                </button>
                {skillRunnerOutput && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>출력 결과:</span>
                    <pre style={{
                      marginTop: '4px',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      maxHeight: '100px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}>
                      {skillRunnerOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Action 2: LLM Custom Generator */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px' }}>
                ⚡ AI 스킬 자동 제작
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>스킬 식별명 (snake_case)</span>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. fetch_stock_price"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>스킬 사양 설명 및 요구사항</span>
                  <textarea
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                    placeholder="e.g. 야후 파이낸스 API를 이용해 주식 코드를 입력받아 실시간 가격을 가져오는 파이썬 도구를 작성해줘."
                    style={{
                      width: '100%',
                      height: '60px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                      resize: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>
                <button
                  onClick={handleGenerateSkill}
                  disabled={isGeneratingSkill}
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    opacity: isGeneratingSkill ? 0.6 : 1,
                    textAlign: 'center'
                  }}
                >
                  {isGeneratingSkill ? '⚡ 스킬 자동 생성 중...' : '⚡ 스킬 코드 생성 및 검증'}
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Tab 3: Credentials Panel */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', minHeight: '450px' }} className="credentials-grid">
          {/* Left Column: Stored Credentials */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            height: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Key size={18} style={{ color: 'var(--accent-primary)' }} /> 외부 사이트 접근 권한 목록
              </h3>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                스킬 실행 시 자동 연동 가능
              </span>
            </div>

            {isCredLoading ? (
               <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center', margin: 'auto' }}>
                 로딩 중...
               </div>
            ) : credentials.length === 0 ? (
               <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '40px', textAlign: 'center', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                 <Key size={40} style={{ opacity: 0.2 }} />
                 <div>등록된 외부 계정이 없습니다.<br/>오른쪽 패널에서 에이전트에 타 사이트 접근 권한을 추가해 주세요.</div>
               </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
                 {credentials.map(c => (
                   <div key={c.id} style={{
                     background: 'rgba(255, 255, 255, 0.03)',
                     border: '1px solid rgba(255, 255, 255, 0.08)',
                     borderRadius: '12px',
                     padding: '14px',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: '10px',
                     transition: 'all 0.2s ease',
                     cursor: 'default'
                   }}
                   className="credential-card"
                   >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                         <span style={{
                           background: 'var(--accent-gradient)',
                           padding: '3px 8px',
                           borderRadius: '6px',
                           fontSize: '11px',
                           fontWeight: '700',
                           textTransform: 'uppercase',
                           letterSpacing: '0.05em'
                         }}>
                           {c.site_name}
                         </span>
                         {c.domain && (
                           <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                             <Link2 size={10} /> {c.domain}
                           </span>
                         )}
                       </div>
                       <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                           {c.site_name.toLowerCase() === 'gmail_oauth' && (
                            <button
                              onClick={async () => {
                                try {
                                  const resp = await authFetch('/api/auth/google/authorize');
                                  const data = await resp.json();
                                  if (data.url) {
                                    window.location.href = data.url;
                                  } else {
                                    alert(data.detail || "인증 URL 생성에 실패했습니다.");
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert("인증 요청 실패: " + err.message);
                                }
                              }}
                              style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#60a5fa',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                              }}
                              title="구글 계정 로그인 및 인증"
                            >
                              인증하기
                            </button>
                          )}
                          {c.site_name.toLowerCase() !== 'gmail_oauth_token' && (
                            <button
                              onClick={() => {
                                setSelectedCredId(c.id);
                                setCredForm({
                                  site_name: c.site_name,
                                  domain: c.domain || '',
                                  username: c.username || '',
                                  secret_key: c.secret_key || '',
                                  description: c.description || ''
                                });
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: 'none',
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background 0.2s'
                              }}
                              title="수정"
                            >
                              <Edit2 size={11} /> 수정
                            </button>
                          )}
                         <button
                           onClick={() => handleDeleteCredential(c.id, c.site_name)}
                           style={{
                             background: 'rgba(239, 68, 68, 0.15)',
                             border: 'none',
                             color: '#f87171',
                             padding: '4px 8px',
                             borderRadius: '6px',
                             cursor: 'pointer',
                             fontSize: '11px',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '4px',
                             transition: 'background 0.2s'
                           }}
                           title="삭제"
                         >
                           <Trash2 size={11} /> 삭제
                         </button>
                       </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '6px', fontSize: '12px', background: 'rgba(0, 0, 0, 0.15)', padding: '10px', borderRadius: '8px' }}>
                       <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>계정명 / ID:</span>
                       <span style={{ color: '#fff', fontWeight: '500' }}>{c.username || '(계정명 없음)'}</span>

                       <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>비밀키 / 토큰:</span>
                       <span style={{ fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '0.05em' }}>{c.secret_key}</span>
                     </div>

                     {c.description && (
                       <div style={{
                         fontSize: '11px',
                         color: 'rgba(255, 255, 255, 0.5)',
                         background: 'rgba(255, 255, 255, 0.02)',
                         padding: '8px 12px',
                         borderRadius: '6px',
                         borderLeft: '2px solid var(--accent-primary)',
                         lineHeight: '1.4'
                       }}>
                         {c.description}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Right Column: Add/Edit Credential Form */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: 'fit-content'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {selectedCredId ? <Edit2 size={16} style={{ color: '#a78bfa' }} /> : <Plus size={16} style={{ color: '#10b981' }} />}
              {selectedCredId ? "외부 사이트 권한 수정" : "외부 사이트 권한 추가"}
            </h3>

            <form onSubmit={handleSaveCredential} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>사이트 식별명 (Site Name) *</span>
                <input
                  type="text"
                  required
                  value={credForm.site_name}
                  onChange={(e) => setCredForm({ ...credForm, site_name: e.target.value })}
                  placeholder="예: github, slack, jira (소문자 식별자 권장)"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>접속 도메인 / 호스트 (Domain / Host - 선택사항)</span>
                <input
                  type="text"
                  value={credForm.domain}
                  onChange={(e) => setCredForm({ ...credForm, domain: e.target.value })}
                  placeholder="예: github.com, imap.naver.com:993 (메일 포트 포함 가능)"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>사용자 ID / 이메일</span>
                <input
                  type="text"
                  value={credForm.username}
                  onChange={(e) => setCredForm({ ...credForm, username: e.target.value })}
                  placeholder="사용자 아이디 또는 이메일"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>인증 비밀번호 / 토큰 / API 키 *</span>
                <input
                  type="password"
                  required={!selectedCredId}
                  value={credForm.secret_key}
                  onChange={(e) => setCredForm({ ...credForm, secret_key: e.target.value })}
                  placeholder={selectedCredId ? "수정하지 않으려면 ******** 상태를 유지하세요" : "비밀번호 또는 API 토큰 입력"}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>간단한 설명 (Description)</span>
                <textarea
                  value={credForm.description}
                  onChange={(e) => setCredForm({ ...credForm, description: e.target.value })}
                  placeholder="예: 에이전트의 블로그 자동 업로드를 위한 GitHub Access Token"
                  style={{
                    width: '100%',
                    height: '60px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={isSavingCred}
                  style={{
                    flex: 1,
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: isSavingCred ? 0.6 : 1,
                    transition: 'transform 0.1s'
                  }}
                >
                  <Save size={14} /> {isSavingCred ? '저장 중...' : '저장하기'}
                </button>

                {selectedCredId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCredId(null);
                      setCredForm({ site_name: '', domain: '', username: '', secret_key: '', description: '' });
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#fff',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'background 0.2s'
                    }}
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
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
            padding: 16px !important;
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
            max-width: 80% !important;
            padding: 24px !important;
            border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
            transform: translateX(-100%);
            opacity: 0 !important;
            visibility: hidden;
            pointer-events: none;
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
