import React, { useRef, useEffect } from 'react';
import { MessageSquare, Mic, MicOff, Send, Volume2, VolumeX, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { Box } from '../common/Box';

export default function ChatBox({
  messages = [],
  inputPrompt = '',
  setInputPrompt,
  onSendMessage,
  isListening = false,
  toggleListening,
  ttsEnabled = false,
  setTtsEnabled,
  loading = false,
  statusText = ''
}) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusText]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Box
      title="Chat Box"
      subtitle="실시간 음성/텍스트 대화 및 AI 어시스턴트 인터랙션"
      icon={MessageSquare}
      badge="Live Chat"
      badgeType="purple"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            style={{
              background: ttsEnabled ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${ttsEnabled ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: ttsEnabled ? '#c4b5fd' : '#94a3b8',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
            title={ttsEnabled ? '음성 출력(TTS) 켜짐' : '음성 출력(TTS) 꺼짐'}
          >
            {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>TTS</span>
          </button>
        </div>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💡 팁: 음성 마이크 버튼을 누르거나 텍스트를 입력하여 질문하세요.</span>
          <span>{messages.length}개 메시지</span>
        </div>
      }
    >
      {/* Message History Container */}
      <div style={{
        height: '380px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingRight: '6px',
        marginBottom: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            gap: '10px'
          }}>
            <Bot size={40} style={{ color: '#8b5cf6', opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>무엇이든 물어보세요! Agent AI가 지원합니다.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c4b5fd',
                    flexShrink: 0
                  }}>
                    <Bot size={16} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    background: isUser ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
                    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.text}
                </div>

                {isUser && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(6, 182, 212, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22d3ee',
                    flexShrink: 0
                  }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {statusText && (
          <div style={{
            fontSize: '12px',
            color: '#c4b5fd',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} className="animate-spin" />
            <span>{statusText}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Box */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={toggleListening}
          style={{
            background: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${isListening ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.12)'}`,
            color: isListening ? '#f87171' : '#94a3b8',
            borderRadius: '10px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title={isListening ? '음성 인식 중지' : '음성 인식 시작'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하거나 마이크 버튼을 눌러 말씀하세요..."
          disabled={loading}
          style={{
            flex: '1',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none'
          }}
        />

        <button
          type="button"
          onClick={onSendMessage}
          disabled={loading || !inputPrompt.trim()}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none',
            color: '#fff',
            borderRadius: '10px',
            padding: '10px 16px',
            cursor: (loading || !inputPrompt.trim()) ? 'not-allowed' : 'pointer',
            opacity: (loading || !inputPrompt.trim()) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            fontSize: '13px'
          }}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          <span>전송</span>
        </button>
      </div>
    </Box>
  );
}
