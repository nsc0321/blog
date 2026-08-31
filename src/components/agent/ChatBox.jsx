import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, Mic, MicOff, Send, Volume2, VolumeX, Bot, User, Sparkles, RefreshCw, Image as ImageIcon, X, Paperclip, ZoomIn, Download } from 'lucide-react';
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
  const fileInputRef = useRef(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusText, attachedImage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!inputPrompt.trim() && !attachedImage) || loading) return;
    onSendMessage(attachedImage);
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('이미지 파일(PNG, JPG, WebP, GIF 등)만 업로드할 수 있습니다.');
      return;
    }

    // Limit image size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 최대 10MB까지 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachedImage({
        dataUrl: e.target.result,
        name: file.name,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box
      title="Chat Box"
      subtitle="실시간 음성/텍스트/이미지 대화 및 AI 어시스턴트"
      icon={MessageSquare}
      badge="Live Chat"
      badgeType="purple"
      className="chat-box-card"
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
        <div className="chat-box-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💡 팁: 음성, 텍스트 입력 및 이미지 첨부(붙여넣기/드래그앤드롭)가 가능합니다.</span>
          <span>{messages.length}개 메시지</span>
        </div>
      }
    >
      {/* Message History Container with Drag-and-Drop Area */}
      <div 
        className={`chat-messages-container ${isDragging ? 'dragging-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(139, 92, 246, 0.25)',
            border: '2px dashed #a78bfa',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}>
            <ImageIcon size={48} color="#c4b5fd" />
            <p style={{ color: '#f8fafc', fontWeight: 700, marginTop: '8px', fontSize: '15px' }}>
              이미지를 여기에 놓아 첨부하세요
            </p>
          </div>
        )}

        {messages.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            gap: '10px',
            padding: '40px 0'
          }}>
            <Bot size={40} style={{ color: '#8b5cf6', opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>무엇이든 물어보세요! 텍스트 및 이미지 분석을 지원합니다.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                className={`chat-msg-row ${isUser ? 'user' : 'assistant'}`}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}
              >
                {!isUser && (
                  <div className="msg-avatar-icon" style={{
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
                  className={`chat-msg-bubble ${isUser ? 'user' : 'assistant'}`}
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    background: isUser ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
                    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {/* Attached Image inside User Message Bubble */}
                  {msg.image && (
                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                      <img
                        src={msg.image}
                        alt={msg.imageName || '첨부 이미지'}
                        onClick={() => setLightboxImage(msg.image)}
                        style={{
                          maxWidth: '280px',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          cursor: 'pointer',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <div
                        onClick={() => setLightboxImage(msg.image)}
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(0, 0, 0, 0.6)',
                          borderRadius: '4px',
                          padding: '3px 6px',
                          fontSize: '10px',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        <ZoomIn size={10} />
                        <span>확대</span>
                      </div>
                    </div>
                  )}

                  {msg.text && (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="msg-avatar-icon" style={{
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
            gap: '6px',
            padding: '4px 8px'
          }}>
            <Sparkles size={14} className="animate-spin" />
            <span>{statusText}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Image Preview Card (Above Input Bar) */}
      {attachedImage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          borderRadius: '10px',
          padding: '6px 12px',
          marginBottom: '8px',
          position: 'relative'
        }}>
          <img
            src={attachedImage.dataUrl}
            alt="미리보기"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              objectFit: 'cover',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {attachedImage.name || '이미지 첨부됨'}
            </div>
            <div style={{ fontSize: '11px', color: '#c4b5fd' }}>
              {formatFileSize(attachedImage.size)} • 전송 대기 중
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAttachedImage(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="첨부 취소"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Form Box */}
      <div className="chat-input-bar-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="chat-attach-btn"
          style={{
            background: attachedImage ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${attachedImage ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.12)'}`,
            color: attachedImage ? '#c4b5fd' : '#94a3b8',
            borderRadius: '10px',
            padding: '10px',
            minWidth: '40px',
            minHeight: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          title="이미지 첨부 (클립보드 붙여넣기 Ctrl+V 가능)"
        >
          <ImageIcon size={18} />
        </button>

        {/* Mic Voice Button */}
        <button
          type="button"
          onClick={toggleListening}
          className="chat-mic-btn"
          style={{
            background: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${isListening ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.12)'}`,
            color: isListening ? '#f87171' : '#94a3b8',
            borderRadius: '10px',
            padding: '10px',
            minWidth: '40px',
            minHeight: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          title={isListening ? '음성 인식 중지' : '음성 인식 시작'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={attachedImage ? "이미지와 함께 질문할 내용을 입력하세요..." : "메시지 입력 또는 이미지 첨부 (Ctrl+V)..."}
          disabled={loading}
          className="chat-text-input"
          style={{
            flex: '1',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none'
          }}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || (!inputPrompt.trim() && !attachedImage)}
          className="chat-send-btn"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none',
            color: '#fff',
            borderRadius: '10px',
            padding: '10px 16px',
            minHeight: '40px',
            cursor: (loading || (!inputPrompt.trim() && !attachedImage)) ? 'not-allowed' : 'pointer',
            opacity: (loading || (!inputPrompt.trim() && !attachedImage)) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            fontSize: '13px',
            flexShrink: 0
          }}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          <span>전송</span>
        </button>
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <img
              src={lightboxImage}
              alt="확대 이미지"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                objectFit: 'contain'
              }}
            />
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
              title="닫기"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </Box>
  );
}
