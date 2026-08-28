import React, { useState } from 'react';
import { X, Plus, Layers, CheckCircle2, Shield, Sparkles, LayoutGrid } from 'lucide-react';
import { BOX_REGISTRY } from './BoxRegistry';

export default function BoxComposerModal({
  isOpen,
  onClose,
  onApplyComposite
}) {
  const [selectedBoxIds, setSelectedBoxIds] = useState(['agent_chat', 'trading_call_api', 'agent_log']);
  const [compositeTitle, setCompositeTitle] = useState('My Custom Control Box');

  if (!isOpen) return null;

  const toggleBox = (boxId) => {
    if (selectedBoxIds.includes(boxId)) {
      setSelectedBoxIds(selectedBoxIds.filter(id => id !== boxId));
    } else {
      setSelectedBoxIds([...selectedBoxIds, boxId]);
    }
  };

  const handleApply = () => {
    if (selectedBoxIds.length === 0) {
      alert('최소 1개 이상의 Box를 선택해 주세요.');
      return;
    }
    if (onApplyComposite) {
      onApplyComposite({
        title: compositeTitle,
        boxIds: selectedBoxIds
      });
    }
    onClose();
  };

  return (
    <div className="server-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="server-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '90%' }}
      >
        {/* Header */}
        <div className="server-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '6px', borderRadius: '8px', color: '#c4b5fd' }}>
              <LayoutGrid size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
              기능 조합 Box 빌더 (Box Composer)
            </h3>
          </div>
          <button className="server-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>
          독립된 기능 Box들을 원하는 대로 조합하여 새로운 맞춤형 대시보드 Box를 생성합니다.
        </p>

        {/* Title Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            조합 Box 이름:
          </label>
          <input
            type="text"
            value={compositeTitle}
            onChange={(e) => setCompositeTitle(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Box Picker Grid */}
        <div style={{
          maxHeight: '320px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '6px',
          marginBottom: '20px'
        }}>
          {BOX_REGISTRY.map((box) => {
            const isSelected = selectedBoxIds.includes(box.id);
            const Icon = box.icon;
            const isAdminReq = box.minRole === 'admin';
            return (
              <div
                key={box.id}
                onClick={() => toggleBox(box.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent onClick
                    style={{ accentColor: '#8b5cf6', cursor: 'pointer' }}
                  />
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c4b5fd'
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      {box.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {box.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#94a3b8'
                  }}>
                    {box.category}
                  </span>
                  {isAdminReq && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      fontWeight: 700
                    }}>
                      Admin 전용
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            <span>조합 Box 생성 및 적용 ({selectedBoxIds.length}개)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
