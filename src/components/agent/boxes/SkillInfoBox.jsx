import React from 'react';
import { Info, CheckCircle, XCircle, ShieldCheck, Layers, Clock } from 'lucide-react';
import { Box } from '../../common/Box';

export default function SkillInfoBox({ selectedSkill }) {
  if (!selectedSkill) {
    return (
      <Box
        title="Skill Info Box"
        subtitle="스킬 메타데이터 & I/O 스키마 정의"
        icon={Info}
      >
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          스킬을 선택하면 메타데이터가 표시됩니다.
        </div>
      </Box>
    );
  }

  return (
    <Box
      title={`Skill Info: ${selectedSkill.name}`}
      subtitle="스키마, 승인 여부, 검증 상태 및 매개변수 정보"
      icon={Info}
      badge={selectedSkill.is_verified ? '검증 완료' : '미검증'}
      badgeType={selectedSkill.is_verified ? 'success' : 'warning'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ color: '#94a3b8' }}>스킬 고유 ID:</span>
          <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>#{selectedSkill.id}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ color: '#94a3b8' }}>시스템 승인 상태:</span>
          <span style={{ color: selectedSkill.is_approved ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
            {selectedSkill.is_approved ? '승인됨 (Approved)' : '대기 (Pending)'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ color: '#94a3b8' }}>생성 일시:</span>
          <span style={{ color: '#cbd5e1' }}>
            {selectedSkill.created_at ? new Date(selectedSkill.created_at).toLocaleString() : '-'}
          </span>
        </div>

        <div style={{ marginTop: '6px' }}>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>입력 파라미터 스키마 (Inputs Schema):</div>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '8px',
            color: '#38bdf8',
            fontSize: '11px',
            margin: 0,
            maxHeight: '100px',
            overflowY: 'auto'
          }}>
            {selectedSkill.inputs_schema || '{"type": "object", "properties": {}}'}
          </pre>
        </div>
      </div>
    </Box>
  );
}
