import React, { useState } from 'react';
import { Users, Key, Trash2, RefreshCw, Search, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function AdminUserListBox({
  users = [],
  onRefresh,
  loading = false,
  onRoleChange,
  onStatusToggle,
  onResetPassword,
  onDeleteUser
}) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const currentUsername = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_username') || '' : '';

  const filtered = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (onResetPassword) {
      onResetPassword(selectedUser.id, newPassword);
    }
    setShowPasswordModal(false);
    setNewPassword('');
    setSelectedUser(null);
  };

  return (
    <Box
      title="1. User Directory Box (전체 회원 목록 & 계정 관리)"
      subtitle="등록된 사용자 계정 조회, 활성화/비활성화 및 비밀번호 초기화"
      icon={Users}
      badge="Directory"
      badgeType="purple"
      actions={
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            padding: '6px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px'
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>새로고침</span>
        </button>
      }
    >
      <div style={{ marginBottom: '14px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="아이디로 사용자 검색..."
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>ID</th>
              <th style={{ padding: '10px 12px' }}>아이디</th>
              <th style={{ padding: '10px 12px' }}>권한</th>
              <th style={{ padding: '10px 12px' }}>상태</th>
              <th style={{ padding: '10px 12px' }}>최근 로그인</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const isMe = u.username.toLowerCase() === currentUsername.toLowerCase();
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>#{u.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#f8fafc' }}>
                    {u.username} {isMe && <span style={{ fontSize: '10px', color: '#c4b5fd' }}>(본인)</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => onRoleChange && onRoleChange(u.id, e.target.value)}
                      disabled={isMe}
                      style={{
                        background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: u.role === 'admin' ? '#c4b5fd' : '#cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <option value="admin" style={{ background: '#121225' }}>👑 관리자</option>
                      <option value="user" style={{ background: '#121225' }}>👤 일반회원</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => onStatusToggle && onStatusToggle(u.id, u.is_active)}
                      disabled={isMe}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        border: 'none',
                        background: u.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: u.is_active ? '#34d399' : '#f87171',
                        cursor: isMe ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {u.is_active ? '🟢 활성' : '🔴 비활성'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '11px', color: '#94a3b8' }}>
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => { setSelectedUser(u); setShowPasswordModal(true); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#cbd5e1',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Key size={11} />
                        <span>비번</span>
                      </button>

                      <button
                        onClick={() => onDeleteUser && onDeleteUser(u.id)}
                        disabled={isMe}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: isMe ? 'not-allowed' : 'pointer',
                          opacity: isMe ? 0.4 : 1
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="server-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="server-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="server-modal-header">
              <h3>비밀번호 재설정: {selectedUser.username}</h3>
              <button className="server-modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력 (최소 6자)"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', border: 'none', color: '#fff', fontWeight: 700 }}
                >
                  변경
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Box>
  );
}
