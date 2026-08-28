import React from 'react';
import { Database, Search, Layers, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function MabiStatusBox({
  itemsCount = 0,
  enchantsCount = 0,
  apiHealth = 'ONLINE',
  lastSync = '방금 전'
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', color: '#c4b5fd' }}>
          <Layers size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>수집된 아이템</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
            {Number(itemsCount).toLocaleString()} 개
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
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>수집된 인챈트</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
            {Number(enchantsCount).toLocaleString()} 개
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
          <CheckCircle2 size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>넥슨 Open API 상태</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#34d399' }}>
            ● {apiHealth}
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(18, 18, 37, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '8px', borderRadius: '10px', color: '#cbd5e1' }}>
          <Database size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>최근 DB 동기화</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
            {lastSync}
          </div>
        </div>
      </div>
    </div>
  );
}
