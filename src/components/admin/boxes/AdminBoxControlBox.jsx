import React, { useState, useEffect } from 'react';
import { LayoutGrid, CheckCircle2, XCircle, Shield, RefreshCw, Layers, Sparkles, AlertTriangle } from 'lucide-react';
import { Box } from '../../common/Box';
import { getApiBase } from '../../../config';

export default function AdminBoxControlBox() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const API_BASE = getApiBase();

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/boxes?domain=all`, { headers: getHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setBoxes(data.boxes || []);
      }
    } catch (err) {
      console.log('Fetch boxes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleToggleActive = async (boxId, currentActive) => {
    try {
      const resp = await fetch(`${API_BASE}/api/admin/boxes/${boxId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: !currentActive })
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setFeedback({ ok: true, message: data.message || `Box 상태가 성공적으로 변경되었습니다.` });
        fetchBoxes();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ ok: false, message: data.detail || data.message || `상태 변경 실패 (HTTP ${resp.status})` });
      }
    } catch (err) {
      setFeedback({ ok: false, message: `상태 변경 실패: ${err.message}` });
    }
  };

  const handleRoleChange = async (boxId, newRole) => {
    try {
      let resp = await fetch(`${API_BASE}/api/admin/boxes/${boxId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ min_role: newRole })
      });
      
      // Fallback to PUT if PATCH is rejected by proxy
      if (!resp.ok && resp.status === 405) {
        resp = await fetch(`${API_BASE}/api/admin/boxes/${boxId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ min_role: newRole })
        });
      }

      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setFeedback({ ok: true, message: data.message || `Box 최소 권한이 '${newRole}'(으)로 변경되었습니다.` });
        fetchBoxes();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ ok: false, message: data.detail || data.message || `권한 변경 실패: 관리자 로그인이 필요하거나 권한이 부족합니다 (HTTP ${resp.status})` });
      }
    } catch (err) {
      setFeedback({ ok: false, message: `권한 변경 요청 오류: ${err.message}` });
    }
  };

  const handleReSeed = async () => {
    if (!window.confirm('모든 표준 Box를 기본값으로 재동기화하시겠습니까?')) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/admin/boxes/seed`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setFeedback({ ok: true, message: data.message || '표준 Box가 DB에 성공적으로 동기화되었습니다.' });
        fetchBoxes();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ ok: false, message: data.detail || data.message || `동기화 실패 (HTTP ${resp.status})` });
      }
    } catch (err) {
      setFeedback({ ok: false, message: `동기화 오류: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      title="Dynamic Box SDUI Manager (실시간 Box 통제 콘솔)"
      subtitle="DB 기반 실시간 Box 활성화/비활성화, 권한(RBAC) 변경 및 화면 동적 통제 (Server-Driven UI)"
      icon={LayoutGrid}
      badge="SDUI Control"
      badgeType="purple"
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReSeed}
            disabled={loading}
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <Sparkles size={13} />
            <span>표준 Box DB 동기화</span>
          </button>
          <button
            onClick={fetchBoxes}
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
        </div>
      }
    >
      {feedback && (
        <div style={{
          marginBottom: '14px',
          padding: '10px 14px',
          borderRadius: '8px',
          background: feedback.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.ok ? '#34d399' : '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {feedback.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>순서</th>
              <th style={{ padding: '10px 12px' }}>Box ID / 명칭</th>
              <th style={{ padding: '10px 12px' }}>도메인</th>
              <th style={{ padding: '10px 12px' }}>최소 접근 권한 (min_role)</th>
              <th style={{ padding: '10px 12px' }}>상태 (is_active)</th>
            </tr>
          </thead>
          <tbody>
            {boxes.map((b) => {
              const cleanName = (b.name || '').replace(/^[0-9]+[.\-]\s*/, '');
              const cleanBoxId = (b.box_id || '').replace(/^[0-9]+[.\-]\s*/, '');
              return (
              <tr key={b.box_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>
                  {b.order_index}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{cleanName}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{cleanBoxId}</div>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#c4b5fd'
                  }}>
                    {b.domain.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <select
                    value={b.min_role}
                    onChange={(e) => handleRoleChange(b.box_id, e.target.value)}
                    style={{
                      background: b.min_role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : b.min_role === 'user' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: b.min_role === 'admin' ? '#f87171' : b.min_role === 'user' ? '#34d399' : '#cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  >
                    <option value="viewer" style={{ background: '#121225' }}>🌐 Viewer (전체 공개)</option>
                    <option value="user" style={{ background: '#121225' }}>👤 User (회원 전용)</option>
                    <option value="admin" style={{ background: '#121225' }}>👑 Admin (관리자 전용)</option>
                  </select>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button
                    onClick={() => handleToggleActive(b.box_id, b.is_active)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      background: b.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: b.is_active ? '#34d399' : '#f87171',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {b.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{b.is_active ? '활성 (ON)' : '숨김 (OFF)'}</span>
                  </button>
                </td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
    </Box>
  );
}
