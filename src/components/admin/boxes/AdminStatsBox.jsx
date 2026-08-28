import React from 'react';
import { Users, Shield, UserCheck, ShieldAlert } from 'lucide-react';

export default function AdminStatsBox({
  totalUsers = 4,
  totalAdmins = 1,
  totalActive = 4
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', color: '#a78bfa' }}>
          <Users size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>총 등록 회원</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
            {totalUsers} 명
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '10px', color: '#22d3ee' }}>
          <Shield size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>관리자(Admin) 계정</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
            {totalAdmins} 명
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px', color: '#34d399' }}>
          <UserCheck size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>활성 상태 계정</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
            {totalActive} / {totalUsers}
          </div>
        </div>
      </div>
    </div>
  );
}
