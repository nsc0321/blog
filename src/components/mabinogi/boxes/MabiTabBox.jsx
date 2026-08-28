import React from 'react';
import { Database, Search, Layers, Sparkles, Cpu, Clock, RefreshCw } from 'lucide-react';

export default function MabiTabBox({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'search', label: 'Open API Search Box', icon: Search, badge: 'Nexon API' },
    { id: 'items', label: 'Item Archive Box', icon: Layers, badge: 'Database' },
    { id: 'enchants', label: 'Enchant Archive Box', icon: Sparkles, badge: 'Scrolls' },
    { id: 'batch', label: 'Batch Collector Box', icon: Cpu, badge: 'Admin Only' }
  ];

  return (
    <div
      className="mabi-tab-box"
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', color: '#c4b5fd', fontSize: '13px', fontWeight: 700, borderRight: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
        <Database size={16} />
        <span>Mabinogi Tab Box</span>
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
