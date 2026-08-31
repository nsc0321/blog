import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Layers, RefreshCw } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';
import SkillEditBox from './SkillEditBox';
import SkillInfoBox from './SkillInfoBox';
import SkillTestBox from './SkillTestBox';

export default function SkillWorkshopBox({
  skills = [],
  onRefresh,
  onSaveSkill,
  loading = false
}) {
  const [selectedSkill, setSelectedSkill] = useState(skills[0] || null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!selectedSkill && skills.length > 0) {
      setSelectedSkill(skills[0]);
    } else if (selectedSkill && skills.length > 0) {
      // Keep selectedSkill synced with updated skill data
      const updated = skills.find(s => (s.id && s.id === selectedSkill.id) || s.name === selectedSkill.name);
      if (updated) setSelectedSkill(updated);
    }
  }, [skills]);

  const filteredSkills = skills.filter(s =>
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Skill List Sub-Box */}
        <Box
          title="Skill Catalog Box"
          subtitle={`${skills.length}개 자동화 스킬 로드됨`}
          icon={Wrench}
          badge="Library"
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
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="스킬 이름 검색..."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            maxHeight: '480px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {filteredSkills.map(s => {
              const isSelected = selectedSkill && ((selectedSkill.id && selectedSkill.id === s.id) || selectedSkill.name === s.name);
              return (
                <div
                  key={s.id || s.name}
                  onClick={() => setSelectedSkill(s)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#c4b5fd' : '#f8fafc' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {s.description || '자동화 스킬'}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: s.is_verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                    color: s.is_verified ? '#34d399' : '#94a3b8',
                    fontWeight: 600
                  }}>
                    {s.is_verified ? '검증됨' : '미검증'}
                  </span>
                </div>
              );
            })}
          </div>
        </Box>

        {/* Right Column: Skill Edit, Info & Test Boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 2 }}>
          <SkillEditBox selectedSkill={selectedSkill} onSaveSkill={onSaveSkill} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <SkillInfoBox selectedSkill={selectedSkill} />
            <SkillTestBox selectedSkill={selectedSkill} />
          </div>
        </div>

      </div>
    </div>
  );
}
