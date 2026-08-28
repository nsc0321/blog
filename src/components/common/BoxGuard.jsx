import React from 'react';
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react';

const ROLE_HIERARCHY = {
  viewer: 1,
  user: 2,
  admin: 3
};

export function checkPermission(userRole = 'user', minRole = 'user') {
  const currentLevel = ROLE_HIERARCHY[userRole.toLowerCase()] || 1;
  const requiredLevel = ROLE_HIERARCHY[minRole.toLowerCase()] || 2;
  return currentLevel >= requiredLevel;
}

export default function BoxGuard({
  minRole = 'user', // 'viewer' | 'user' | 'admin'
  fallbackMode = 'lock', // 'lock' | 'hidden'
  boxTitle = '이 기능',
  children
}) {
  const currentRole = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_role') || 'user' : 'user';
  const username = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_username') || '' : '';
  
  // Override for designated admin username
  const effectiveRole = (username.toLowerCase() === 'yuha69' || username.toLowerCase() === 'admin') ? 'admin' : currentRole;

  const hasAccess = checkPermission(effectiveRole, minRole);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallbackMode === 'hidden') {
    return null;
  }

  // Lock Overlay Box UI
  return (
    <div
      className="box-guard-locked"
      style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '32px 20px',
        textAlign: 'center',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#f8fafc',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171'
        }}
      >
        <Lock size={24} />
      </div>

      <div>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#f87171' }}>
          권한 접근 제한: {boxTitle}
        </h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '360px', lineHeight: 1.5 }}>
          해당 컴포넌트는 <strong>{minRole.toUpperCase()} (관리자)</strong> 이상의 계정 권한이 필요합니다.
        </p>
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '11px',
          color: '#cbd5e1'
        }}
      >
        <span>현재 권한: <strong>{effectiveRole.toUpperCase()}</strong></span>
        <span>•</span>
        <span style={{ color: '#f87171' }}>필요 권한: <strong>{minRole.toUpperCase()}</strong></span>
      </div>
    </div>
  );
}
