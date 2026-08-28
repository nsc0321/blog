import React, { useState, useEffect } from 'react';
import { Code, Save, CheckCircle2, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Box } from '../../common/Box';
import BoxGuard from '../../common/BoxGuard';
import { getApiBase } from '../../../config';

export default function SkillEditBox({
  selectedSkill,
  onSaveSkill,
  saving = false
}) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (selectedSkill) {
      setCode(selectedSkill.code || '');
      setDescription(selectedSkill.description || '');
      setFeedback(null);
    }
  }, [selectedSkill]);

  const handleSave = () => {
    if (!selectedSkill) return;
    if (onSaveSkill) {
      onSaveSkill({ ...selectedSkill, code, description });
    }
    setFeedback({ ok: true, message: '스킬 코드가 성공적으로 저장되었습니다.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  if (!selectedSkill) {
    return (
      <Box
        title="7-1. Skill Edit Box"
        subtitle="스킬 파이썬 코드 작성 및 실시간 편집기"
        icon={Code}
      >
        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
          좌측 스킬 목록에서 편집할 스킬을 먼저 선택해 주세요.
        </div>
      </Box>
    );
  }

  return (
    <BoxGuard minRole="admin" boxTitle={`스킬 코드 수정 (${selectedSkill.name})`}>
      <Box
        title={`7-1. Skill Edit Box: ${selectedSkill.name}`}
        subtitle="파이썬(Python 3.11) 스킬 비즈니스 로직 구현 및 수정"
        icon={Code}
        badge="Python Editor"
        badgeType="purple"
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            border: 'none',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
          <span>스킬 저장</span>
        </button>
      }
    >
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
          스킬 설명 (Description):
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="스킬의 기능과 역할을 설명하세요"
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="def execute(inputs): ..."
          rows={14}
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '12px',
            color: '#38bdf8',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: 1.5,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {feedback && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle2 size={14} />
          <span>{feedback.message}</span>
        </div>
      )}
    </Box>
    </BoxGuard>
  );
}
