import React from 'react';

export default function SkillWorkshop({
  skills,
  selectedSkillName,
  setSelectedSkillName,
  skillDescription,
  setSkillDescription,
  skillCode,
  setSkillCode,
  handleSaveSkill,
  isSavingSkill,
  handleDeleteSkill,
  skillRunnerArgs,
  setSkillRunnerArgs,
  handleRunSkill,
  isRunningSkill,
  skillRunnerOutput,
  newSkillName,
  setNewSkillName,
  newSkillDesc,
  setNewSkillDesc,
  handleGenerateSkill,
  isGeneratingSkill
}) {
  return (
    <div className="responsive-grid">
      {/* Left Column: Explorer & Editor */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        height: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '60%' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>스킬 선택:</span>
            <select
              value={selectedSkillName}
              onChange={(e) => setSelectedSkillName(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <option value="" disabled style={{ color: '#000' }}>스킬을 선택하세요</option>
              {skills.map(s => (
                <option key={s.name} value={s.name} style={{ color: '#000' }}>
                  {s.name} {s.is_verified ? '✅' : '❌'}
                </option>
              ))}
            </select>
          </div>

          {selectedSkillName && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleDeleteSkill(selectedSkillName)}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                🗑️ 삭제
              </button>
            </div>
          )}
        </div>

        {selectedSkillName ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>설명 / Docstring</span>
              <input
                type="text"
                value={skillDescription}
                onChange={(e) => setSkillDescription(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  marginTop: '4px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Python 소스 코드</span>
                {skills.find(s => s.name === selectedSkillName)?.is_verified ? (
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>✅ 검증 완료</span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>❌ 검증 실패 / 미검증</span>
                )}
              </div>
              
              <textarea
                value={skillCode}
                onChange={(e) => setSkillCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '220px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  marginTop: '6px',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            {skills.find(s => s.name === selectedSkillName)?.verification_error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '3px solid #ef4444',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#fca5a5',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '60px',
                overflowY: 'auto'
              }}>
                {skills.find(s => s.name === selectedSkillName).verification_error}
              </div>
            )}

            <button
              onClick={handleSaveSkill}
              disabled={isSavingSkill}
              style={{
                background: 'var(--accent-gradient)',
                border: 'none',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: isSavingSkill ? 0.6 : 1,
                textAlign: 'center'
              }}
            >
              {isSavingSkill ? '💾 저장 및 검증 중...' : '💾 저장 및 컴파일 검증'}
            </button>
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '40px', textAlign: 'center', margin: 'auto' }}>
            스킬이 없습니다. 오른쪽 패널에서 새로운 스킬을 제작해 보세요.
          </div>
        )}
      </div>

      {/* Right Column: Run Skill & Design New Skill */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Action 1: Manual Runner */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px' }}>
            🚀 스킬 테스트 실행
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>인자 (Arguments - 콤마 분리, e.g. key=value)</span>
              <input
                type="text"
                value={skillRunnerArgs}
                onChange={(e) => setSkillRunnerArgs(e.target.value)}
                placeholder="e.g. query=Seoul, limit=3"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                  marginTop: '4px'
                }}
              />
            </div>
            <button
              onClick={handleRunSkill}
              disabled={isRunningSkill || !selectedSkillName}
              style={{
                background: 'var(--accent-gradient)',
                border: 'none',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                opacity: (!selectedSkillName || isRunningSkill) ? 0.5 : 1
              }}
            >
              {isRunningSkill ? '실행 중...' : '스킬 실행'}
            </button>
            {skillRunnerOutput && (
              <div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>출력 결과:</span>
                <pre style={{
                  marginTop: '4px',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {skillRunnerOutput}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Action 2: LLM Custom Generator */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px' }}>
            ⚡ AI 스킬 자동 제작
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>스킬 식별명 (snake_case)</span>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. fetch_stock_price"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                  marginTop: '4px'
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>스킬 사양 설명 및 요구사항</span>
              <textarea
                value={newSkillDesc}
                onChange={(e) => setNewSkillDesc(e.target.value)}
                placeholder="e.g. 야후 파이낸스 API를 이용해 주식 코드를 입력받아 실시간 가격을 가져오는 파이썬 도구를 작성해줘."
                style={{
                  width: '100%',
                  height: '60px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'none',
                  marginTop: '4px'
                }}
              />
            </div>
            <button
              onClick={handleGenerateSkill}
              disabled={isGeneratingSkill}
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
                border: 'none',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                opacity: isGeneratingSkill ? 0.6 : 1,
                textAlign: 'center'
              }}
            >
              {isGeneratingSkill ? '⚡ 스킬 자동 생성 중...' : '⚡ 스킬 코드 생성 및 검증'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
