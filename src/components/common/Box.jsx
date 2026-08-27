import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

export function Box({
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'default', // 'default' | 'success' | 'warning' | 'info' | 'purple'
  collapsible = false,
  defaultCollapsed = false,
  actions,
  children,
  footer,
  className = '',
  style = {}
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'success':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'warning':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'info':
        return { background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' };
      case 'purple':
        return { background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.12)' };
    }
  };

  return (
    <div
      className={`custom-box-container ${className}`}
      style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style
      }}
    >
      {/* Box Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {Icon && (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}>
              <Icon size={20} />
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                {title}
              </h3>
              {badge && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  ...getBadgeStyle()
                }}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actions}
          {collapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={collapsed ? '펼치기' : '접기'}
            >
              {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Box Body */}
      {!collapsed && (
        <div style={{ padding: '20px', flex: '1' }}>
          {children}
        </div>
      )}

      {/* Box Footer */}
      {!collapsed && footer && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(0, 0, 0, 0.15)',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export function SubBoxCard({
  title,
  description,
  icon: Icon,
  badge,
  badgeType = 'default',
  onClick,
  active = false,
  children
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${active ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
        borderRadius: '12px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
      className="sub-box-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c4b5fd'
            }}>
              <Icon size={16} />
            </div>
          )}
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
        </div>
        {badge && (
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            fontWeight: 600
          }}>
            {badge}
          </span>
        )}
      </div>

      {description && (
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
