import React from 'react';
import { MessageSquare, Bot, MessageCircle, LayoutDashboard, Wrench, Key, History, Settings, Layers } from 'lucide-react';

export default function AgentTabBox({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'chat', label: 'Agent Chat', icon: Bot, badge: 'Agent & Skills' },
    { id: 'general_chat', label: 'General Chat', icon: MessageCircle, badge: 'Fast Chat' },
    { id: 'skills', label: 'Skill Workshop Box', icon: Wrench, badge: 'Code & Test' },
    { id: 'accounts', label: 'Account Box', icon: Key, badge: 'Credentials' },
    { id: 'history', label: 'Agent History Box', icon: History, badge: 'Tasks & Logs' },
    { id: 'settings', label: 'Setting Box', icon: Settings, badge: 'Config' }
  ];

  return (
    <div
      className="agent-tab-box"
      style={{
        background: 'rgba(18, 18, 37, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        marginBottom: '20px',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', color: '#a78bfa', fontSize: '13px', fontWeight: 700, borderRight: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
        <Layers size={16} />
        <span>Tab Box</span>
      </div>

      <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: `1px solid ${isActive ? 'rgba(139, 92, 246, 0.5)' : 'transparent'}`,
                background: isActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#f8fafc' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? '#c4b5fd' : '#64748b'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#e2e8f0' : '#64748b',
                  fontWeight: 600
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
