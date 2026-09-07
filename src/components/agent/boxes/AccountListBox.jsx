import React, { useState } from 'react';
import { Key, Eye, EyeOff, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Box } from '../../common/Box';

export default function AccountListBox({
  credentials = [],
  onDeleteCredential,
  onRefresh,
  loading = false
}) {
  const [visibleKeys, setVisibleKeys] = useState({});

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatKey = (rawKey, isVisible) => {
    if (!rawKey) return '••••••••••••';
    if (isVisible) return rawKey;
    if (rawKey.length <= 8) return '••••••••••••';
    return `${rawKey.substring(0, 4)}••••••••••••${rawKey.substring(rawKey.length - 4)}`;
  };

  const credList = Array.isArray(credentials) ? credentials : [];

  return (
    <Box
      title="Account List Box (자격증명 목록)"
      subtitle="안전하게 암호화 보관된 외부 서비스 API Key 및 토큰 목록"
      icon={Key}
      badge="Encrypted"
      badgeType="purple"
      actions={
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && credList.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RefreshCw size={14} className="animate-spin" />
            <span>자격증명 목록을 불러오는 중...</span>
          </div>
        ) : credList.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            등록된 API 자격증명이 없습니다. 우측에서 신규 등록하세요.
          </div>
        ) : (
          credList.map(c => {
            const isVisible = visibleKeys[c.id];
            const name = c.site_name || c.service_name || '이름 없음';
            const rawKey = c.secret_key || c.api_key || '';
            return (
              <div
                key={c.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    {name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                    {formatKey(rawKey, isVisible)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => toggleVisibility(c.id)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      padding: '5px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title={isVisible ? '가리기' : '보기'}
                  >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  <button
                    onClick={() => onDeleteCredential && onDeleteCredential(c.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '5px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Box>
  );
}
