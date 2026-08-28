import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import AdminTabBox from './admin/boxes/AdminTabBox';
import AdminStatsBox from './admin/boxes/AdminStatsBox';
import AdminUserListBox from './admin/boxes/AdminUserListBox';
import AdminRoleControlBox from './admin/boxes/AdminRoleControlBox';
import AdminBoxControlBox from './admin/boxes/AdminBoxControlBox';
import BoxGuard from './common/BoxGuard';
import { getApiBase } from '../config';

export default function AdminManagement({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'boxes'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users`, { headers: getHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.log('Admin fetch users note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      if (resp.ok) fetchUsers();
    } catch (e) {}
  };

  const handleStatusToggle = async (userId, currentActive) => {
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: !currentActive })
      });
      if (resp.ok) fetchUsers();
    } catch (e) {}
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ new_password: newPassword })
      });
      if (resp.ok) alert('비밀번호가 재설정되었습니다.');
    } catch (e) {}
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('해당 사용자를 완전히 삭제하시겠습니까?')) return;
    try {
      const resp = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (resp.ok) fetchUsers();
    } catch (e) {}
  };

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalActive = users.filter(u => u.is_active).length;

  return (
    <BoxGuard minRole="admin" boxTitle="통합 계정 & 관리자 센터">
      <div className="admin-container-box" style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation Back Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              통합 계정 & 관리자 센터 (Admin Box)
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              전체 사용자 권한(RBAC) 및 실시간 Box(Server-Driven UI)를 통제합니다.
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
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
        </div>

        {/* Status Box */}
        <AdminStatsBox
          totalUsers={users.length}
          totalAdmins={totalAdmins}
          totalActive={totalActive}
        />

        {/* Tab Box */}
        <AdminTabBox
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />

        {/* Sub-Box Active View */}
        <div className="admin-active-box-view">
          {activeTab === 'users' && (
            <AdminUserListBox
              users={users}
              onRefresh={fetchUsers}
              loading={loading}
              onRoleChange={handleRoleChange}
              onStatusToggle={handleStatusToggle}
              onResetPassword={handleResetPassword}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'roles' && (
            <AdminRoleControlBox />
          )}

          {activeTab === 'boxes' && (
            <AdminBoxControlBox />
          )}
        </div>
      </div>
    </BoxGuard>
  );
}
