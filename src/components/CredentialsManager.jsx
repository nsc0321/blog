import React from 'react';
import { Key, Link2, Edit2, Trash2, Plus, Save } from 'lucide-react';

export default function CredentialsManager({
  credentials,
  isCredLoading,
  authFetch,
  selectedCredId,
  setSelectedCredId,
  credForm,
  setCredForm,
  handleSaveCredential,
  isSavingCred,
  handleDeleteCredential
}) {
  return (
    <div className="responsive-grid credentials-grid">
      {/* Left Column: Stored Credentials */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        height: '100%',
        minWidth: '0px'
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
                               const currentUrl = window.location.origin + window.location.pathname;
                               const resp = await authFetch(`/api/auth/google/authorize?redirect_uri=${encodeURIComponent(currentUrl)}`);
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
                   <span style={{ color: '#fff', fontWeight: '500', wordBreak: 'break-all' }}>{c.username || '(계정명 없음)'}</span>

                   <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>비밀키 / 토큰:</span>
                   <span style={{ fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '0.05em', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{c.secret_key}</span>
                 </div>

                 {c.description && (
                   <div style={{
                     fontSize: '11px',
                     color: 'rgba(255, 255, 255, 0.5)',
                     background: 'rgba(255, 255, 255, 0.02)',
                     padding: '8px 12px',
                     borderRadius: '6px',
                     borderLeft: '2px solid var(--accent-primary)',
                     lineHeight: '1.4',
                     wordBreak: 'break-all',
                     whiteSpace: 'pre-wrap'
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
              placeholder="예: github, naver_cookies, slack (소문자)"
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

          {credForm.site_name.toLowerCase() === 'naver_cookies' && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#38bdf8',
              lineHeight: '1.4'
            }}>
              💡 <strong>네이버 쿠키 세션 주입 안내:</strong><br />
              네이버 보안 로그인(CAPTCHA) 우회를 위해 사용자 브라우저의 로그인 쿠키인 <code>NID_AUT</code>와 <code>NID_SES</code> 값을 아래 JSON 형태로 입력해 주세요:<br />
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                {"{ \"NID_AUT\": \"...\", \"NID_SES\": \"...\" }"}
              </code>
            </div>
          )}

          <div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>접속 도메인 / 호스트 (Domain / Host - 선택사항)</span>
            <input
              type="text"
              value={credForm.domain}
              onChange={(e) => setCredForm({ ...credForm, domain: e.target.value })}
              placeholder="예: github.com, imap.naver.com:993 (선택사항)"
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
              placeholder={selectedCredId ? "수정하지 않으려면 ******** 상태를 유지하세요" : (credForm.site_name.toLowerCase() === 'naver_cookies' ? 'JSON: {"NID_AUT": "...", "NID_SES": "..."}' : "비밀번호 또는 API 토큰 입력")}
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
              placeholder={credForm.site_name.toLowerCase() === 'naver_cookies' ? "네이버 로그인 세션 쿠키 정보 (NID_AUT, NID_SES)" : "예: 에이전트의 블로그 자동 업로드를 위한 GitHub Access Token"}
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
  );
}
