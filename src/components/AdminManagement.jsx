import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Key, Trash2, RefreshCw, CheckCircle, AlertTriangle, Search, Lock, UserCheck, UserX, Shield, Clock, ShieldAlert, X, Edit3, ArrowLeft } from 'lucide-react';
import { getApiBase } from '../config';

export default function AdminManagement({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Feedback messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';
  const currentUsername = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_username') || '' : '';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users`, {
        headers: getHeaders()
      });
      if (resp.status === 401 || resp.status === 403) {
        setErrorMsg('관리자 권한이 필요합니다. 관리자 계정으로 다시 로그인해 주세요.');
        return;
      }
      const data = await resp.json();
      if (resp.ok && data.users) {
        setUsers(data.users);
      } else {
        setErrorMsg(data.detail || '사용자 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setErrorMsg('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const data = await resp.json();
      if (resp.ok) {
        setSuccessMsg(data.message || '권한이 성공적으로 변경되었습니다.');
        fetchUsers();
      } else {
        setErrorMsg(data.detail || '권한 변경에 실패했습니다.');
      }
    } catch (err) {
      setErrorMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentActive) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: !currentActive })
      });
      const data = await resp.json();
      if (resp.ok) {
        setSuccessMsg(data.message || '계정 상태가 변경되었습니다.');
        fetchUsers();
      } else {
        setErrorMsg(data.detail || '계정 상태 변경에 실패했습니다.');
      }
    } catch (err) {
      setErrorMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ new_password: newPassword })
      });
      const data = await resp.json();
      if (resp.ok) {
        setSuccessMsg(data.message || '비밀번호가 재설정되었습니다.');
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
      } else {
        setErrorMsg(data.detail || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (err) {
      setErrorMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await resp.json();
      if (resp.ok) {
        setSuccessMsg(data.message || '계정이 삭제되었습니다.');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setErrorMsg(data.detail || '계정 삭제에 실패했습니다.');
      }
    } catch (err) {
      setErrorMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchQuery = !searchQuery || u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.is_active : !u.is_active);
    return matchQuery && matchRole && matchStatus;
  });

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalActive = users.filter(u => u.is_active).length;

  return (
    <div className="admin-management-container" style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} color="#fff" />
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
              통합 계정 & 관리자 센터
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            전체 사용자 권한(RBAC) 관리, 보안 정책 통제 및 계정 상태를 실시간으로 제어합니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} />
              <span>대시보드로 돌아가기</span>
            </button>
          )}
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'rgba(18, 18, 37, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '12px', borderRadius: '12px', color: '#a78bfa' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>총 등록 회원</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>{users.length} 명</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(18, 18, 37, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '12px', borderRadius: '12px', color: '#22d3ee' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>관리자 계정</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>{totalAdmins} 명</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(18, 18, 37, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px', color: '#34d399' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>활성 계정 상태</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399' }}>{totalActive} / {users.length}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px'
        }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px'
        }}>
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        background: 'rgba(18, 18, 37, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="아이디로 사용자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px 9px 36px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>권한:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="ALL" style={{ background: '#121225' }}>전체 권한</option>
              <option value="admin" style={{ background: '#121225' }}>👑 관리자 (Admin)</option>
              <option value="user" style={{ background: '#121225' }}>👤 일반 회원 (User)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="ALL" style={{ background: '#121225' }}>전체 상태</option>
              <option value="ACTIVE" style={{ background: '#121225' }}>🟢 활성화</option>
              <option value="INACTIVE" style={{ background: '#121225' }}>🔴 비활성화</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'rgba(18, 18, 37, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>사용자명</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>권한 (Role)</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>계정 상태</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>최근 로그인</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>가입 일시</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>계정 관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    사용자 목록을 불러오는 중...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    검색 조건에 맞는 사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isMe = u.username.toLowerCase() === currentUsername.toLowerCase();
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontFamily: 'monospace' }}>#{u.id}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#f8fafc' }}>{u.username}</span>
                          {isMe && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#c4b5fd',
                              fontWeight: 600
                            }}>
                              본인
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={actionLoading || isMe}
                          style={{
                            background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            border: `1px solid ${u.role === 'admin' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                            color: u.role === 'admin' ? '#c4b5fd' : '#cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isMe ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="admin" style={{ background: '#121225' }}>👑 관리자 (Admin)</option>
                          <option value="user" style={{ background: '#121225' }}>👤 일반 회원 (User)</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          disabled={actionLoading || isMe}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: isMe ? 'not-allowed' : 'pointer',
                            background: u.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: u.is_active ? '#34d399' : '#f87171'
                          }}
                        >
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: u.is_active ? '#34d399' : '#f87171'
                          }}></span>
                          {u.is_active ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '12px' }}>
                        {u.last_login ? new Date(u.last_login).toLocaleString() : '기록 없음'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => { setSelectedUser(u); setShowPasswordModal(true); }}
                            title="비밀번호 초기화"
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#cbd5e1',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px'
                            }}
                          >
                            <Key size={13} />
                            <span>비번 재설정</span>
                          </button>
                          
                          <button
                            onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }}
                            disabled={isMe}
                            title="사용자 삭제"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: isMe ? 'not-allowed' : 'pointer',
                              opacity: isMe ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>삭제</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="server-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="server-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="server-modal-header">
              <h3>
                <Key size={18} style={{ color: '#8b5cf6' }} />
                비밀번호 강제 재설정
              </h3>
              <button className="server-modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              <strong>{selectedUser.username}</strong> 님의 새로운 비밀번호를 설정합니다.
            </p>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  새 비밀번호 (최소 6자 이상)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 입력"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {actionLoading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="server-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="server-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="server-modal-header">
              <h3 style={{ color: '#f87171' }}>
                <Trash2 size={18} />
                사용자 계정 영구 삭제
              </h3>
              <button className="server-modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6 }}>
              정말로 <strong>{selectedUser.username}</strong> 사용자를 삭제하시겠습니까?<br />
              <span style={{ color: '#f87171', fontSize: '12px' }}>
                * 해당 계정과 연결된 모든 API Key, 자격증명 및 설정 데이터가 완전히 제거되며 복구할 수 없습니다.
              </span>
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {actionLoading ? '삭제 중...' : '영구 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
