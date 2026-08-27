import React, { useState } from 'react';
import { Sparkles, Lock, User, KeyRound, Shield, CheckCircle, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, Cpu, Database, Activity, Wifi } from 'lucide-react';
import { getApiBase } from '../config';

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE = getApiBase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (isRegisterMode) {
      if (cleanUsername.length < 3 || cleanUsername.length > 30) {
        setErrorMessage('아이디는 3자 이상 30자 이하이어야 합니다.');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        setErrorMessage('아이디는 영문자, 숫자, 밑줄(_)만 사용할 수 있습니다.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
      const payload = { username: cleanUsername, password };

      const resp = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();

      if (!resp.ok) {
        setErrorMessage(data.detail || data.message || '인증 처리에 실패했습니다.');
        return;
      }

      if (data.token) {
        localStorage.setItem('agent_auth_token', data.token);
        localStorage.setItem('agent_auth_username', data.username);
        localStorage.setItem('agent_auth_role', data.role || 'user');

        if (isRegisterMode) {
          setSuccessMessage('회원가입이 완료되었습니다! 로그인 중...');
          setTimeout(() => {
            onLoginSuccess(data);
          }, 800);
        } else {
          onLoginSuccess(data);
        }
      }
    } catch (err) {
      console.error('Auth request error:', err);
      setErrorMessage('서버와 통신할 수 없습니다. 상단에서 API 서버 연결 주소를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen-container" style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div className="auth-card-wrapper" style={{
        width: '100%',
        maxWidth: '1020px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Left / Top: Login / Register Form Card */}
        <div className="auth-form-card" style={{
          background: 'rgba(18, 18, 37, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#f8fafc' }}>
                OCTO<span style={{ color: '#8b5cf6' }}>HUB</span>
              </h2>
            </div>

            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              {isRegisterMode ? '통합 계정을 생성하여 모든 플랫폼 기능을 이용하세요.' : '시스템에 접속하기 위해 계정으로 로그인해 주세요.'}
            </p>

            {/* Mode Toggle Tabs */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setErrorMessage(''); setSuccessMessage(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !isRegisterMode ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                  color: !isRegisterMode ? '#fff' : '#94a3b8',
                  fontWeight: !isRegisterMode ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setErrorMessage(''); setSuccessMessage(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isRegisterMode ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                  color: isRegisterMode ? '#fff' : '#94a3b8',
                  fontWeight: isRegisterMode ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                회원가입
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}>
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  아이디 (Username)
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="영문, 숫자 3~30자"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      padding: '12px 14px 12px 38px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  비밀번호 (Password)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegisterMode ? '최소 6자 이상' : '비밀번호 입력'}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      padding: '12px 38px 12px 38px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    비밀번호 확인 (Confirm Password)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호 다시 입력"
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        padding: '12px 14px 12px 38px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? '처리 중...' : isRegisterMode ? '계정 생성하기' : '로그인'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            {isRegisterMode ? (
              <span>이미 계정이 있으신가요? <strong style={{ color: '#8b5cf6', cursor: 'pointer' }} onClick={() => setIsRegisterMode(false)}>로그인하기</strong></span>
            ) : (
              <span>처음 방문하셨나요? <strong style={{ color: '#8b5cf6', cursor: 'pointer' }} onClick={() => setIsRegisterMode(true)}>무료 회원가입</strong></span>
            )}
          </div>
        </div>

        {/* Right / Bottom: Security Summary & Architecture Card */}
        <div className="auth-security-card" style={{
          background: 'rgba(18, 18, 37, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={22} color="#34d399" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                적용 Security 체계 요약
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              OctoHub는 안전한 자산 거래 및 API 데이터 보호를 위해 다음과 같은 엔터프라이즈급 보안 표준을 준수합니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '6px', borderRadius: '8px', color: '#a78bfa' }}>
                  <Lock size={16} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#f1f5f9', fontWeight: 600 }}>단방향 암호화 (SHA-256)</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>비밀번호는 솔트 해시 처리되어 서버 관리자도 원문을 알 수 없습니다.</p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '6px', borderRadius: '8px', color: '#22d3ee' }}>
                  <Shield size={16} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#f1f5f9', fontWeight: 600 }}>HMAC-SHA256 토큰 인증</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>위변조 방지 디지털 서명 및 7일 유효기간 기반의 세션 통제.</p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '6px', borderRadius: '8px', color: '#34d399' }}>
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#f1f5f9', fontWeight: 600 }}>RBAC 권한 분리</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>일반 회원(User)과 관리자(Admin) 권한을 분리하여 핵심 자원 보호.</p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '6px', borderRadius: '8px', color: '#fbbf24' }}>
                  <Wifi size={16} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#f1f5f9', fontWeight: 600 }}>CORS & Preflight 방화벽</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>허가된 오리진 및 브라우저에서만 API 호출을 허용하는 보호 정책.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            fontSize: '12px',
            color: '#c4b5fd',
            textAlign: 'center'
          }}>
            🔐 모든 통신은 SSL/TLS 암호화 채널을 통해 전송됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
