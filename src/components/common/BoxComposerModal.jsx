import React, { useState, useEffect } from 'react';
import { X, Plus, Layers, CheckCircle2, Shield, Sparkles, LayoutGrid, RefreshCw } from 'lucide-react';
import { BOX_REGISTRY, getBoxMetadata } from './BoxRegistry';
import { getApiBase } from '../../config';

export default function BoxComposerModal({
  isOpen,
  onClose,
  onApplyComposite
}) {
  const [dbBoxes, setDbBoxes] = useState([]);
  const [selectedBoxIds, setSelectedBoxIds] = useState(['agent_chat', 'trading_ticker', 'agent_log']);
  const [compositeTitle, setCompositeTitle] = useState('My Custom Control Box');
  const [loading, setLoading] = useState(false);

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  useEffect(() => {
    if (isOpen) {
      fetchDbBoxes();
    }
  }, [isOpen]);

  const fetchDbBoxes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/boxes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setDbBoxes(data.boxes || []);
      }
    } catch (err) {
      console.log('Fetch composer boxes error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayList = dbBoxes.length > 0 ? dbBoxes : BOX_REGISTRY;

  const toggleBox = (boxId) => {
    if (selectedBoxIds.includes(boxId)) {
      setSelectedBoxIds(selectedBoxIds.filter(id => id !== boxId));
    } else {
      setSelectedBoxIds([...selectedBoxIds, boxId]);
    }
  };

  const handleApply = async () => {
    if (selectedBoxIds.length === 0) {
      alert('최소 1개 이상의 Box를 선택해 주세요.');
      return;
    }

    const compositeData = {
      title: compositeTitle,
      boxIds: selectedBoxIds
    };

    // Also persist to backend user layout API
    try {
      await fetch(`${API_BASE}/api/boxes/layout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          page_id: 'dashboard',
          box_ids: selectedBoxIds,
          layout_settings: { title: compositeTitle }
        })
      });
    } catch (e) {
      console.log('Layout save note:', e);
    }

    if (onApplyComposite) {
      onApplyComposite(compositeData);
    }
    onClose();
  };

  return (
    <div className="server-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="server-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '90%' }}
      >
        {/* Header */}
        <div className="server-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '6px', borderRadius: '8px', color: '#c4b5fd' }}>
              <LayoutGrid size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                기능 조합 Box 빌더 (Server-Driven UI)
              </h3>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                DB 레지스트리 기반 실시간 독립 Box 조합 & 레이아웃 저장
              </div>
            </div>
          </div>
          <button className="server-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Title Input */}
        <div style={{ marginBottom: '14px' }}>
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
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '6px',
          marginBottom: '20px'
        }}>
          {displayList.map((box) => {
            const isSelected = selectedBoxIds.includes(box.box_id || box.id);
            const boxId = box.box_id || box.id;
            const meta = getBoxMetadata(boxId) || box;
            const Icon = meta.icon || Layers;
            const isAdminReq = box.min_role === 'admin';
            const isLocked = box.has_access === false;

            return (
              <div
                key={boxId}
                onClick={() => toggleBox(boxId)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  opacity: isLocked ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
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
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{box.name}</span>
                      {isLocked && <span style={{ fontSize: '10px', color: '#f87171' }}>🔒</span>}
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
                    {box.category || (box.domain && box.domain.toUpperCase())}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            선택된 Box: <strong>{selectedBoxIds.length}</strong>개
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
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
              <span>DB 동기화 & 맞춤 Box 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
