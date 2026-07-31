import React from 'react';
import { Volume2, Mic, MicOff, Send } from 'lucide-react';
import AvatarCanvas from './AvatarCanvas';

export default function AgentChat({
  showAvatar,
  isSpeaking,
  isListening,
  isLoading,
  messages,
  transcript,
  inputText,
  setInputText,
  handleSendMessage,
  toggleListening,
  speak,
  messageEndRef
}) {
  return (
    <>
      {/* Main Layout: Split Avatar & Chat */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'stretch',
        justifyContent: 'center',
        width: '100%',
        minHeight: '420px',
        flex: 1
      }}>
        
        {/* Avatar Column */}
        {showAvatar && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1 1 320px',
            maxWidth: '360px'
          }}>
            <AvatarCanvas 
              isSpeaking={isSpeaking} 
              isListening={isListening} 
              isLoading={isLoading} 
            />
          </div>
        )}

        {/* Chat / Messages Panel */}
        <div className="chat-panel" style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          flex: '2 1 400px',
          height: '420px',
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  {m.role === 'assistant' && (
                    <button 
                      onClick={() => speak(m.content)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        transition: 'all 0.2s ease'
                      }}
                      title="다시 듣기"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                  <div style={{ flex: 1 }}>{m.content}</div>
                </div>
                {m.logs && m.logs.length > 0 && (
                  <details open={i === messages.length - 1 && isLoading} style={{
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
  );
}
