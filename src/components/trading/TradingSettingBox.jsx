import React, { useState } from 'react';
import { Settings, Shield, Sliders, Save, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, DollarSign, Target } from 'lucide-react';
import { Box, SubBoxCard } from '../common/Box';
import { getApiBase } from '../../config';

export default function TradingSettingBox({
  settings = {},
  onSaveSettings,
  loading = false
}) {
  const [targetMarket, setTargetMarket] = useState(settings.targetMarket || 'BTC_KRW');
  const [dryRun, setDryRun] = useState(settings.dryRun !== undefined ? settings.dryRun : true);
  const [stopLossPercent, setStopLossPercent] = useState(settings.stopLossPercent || 3.0);
  const [takeProfitPercent, setTakeProfitPercent] = useState(settings.takeProfitPercent || 5.0);
  const [maxOrderAmount, setMaxOrderAmount] = useState(settings.maxOrderAmount || 50000);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    const newSettings = {
      targetMarket,
      dryRun,
      stopLossPercent: parseFloat(stopLossPercent),
      takeProfitPercent: parseFloat(takeProfitPercent),
      maxOrderAmount: parseFloat(maxOrderAmount)
    };
    if (onSaveSettings) {
      onSaveSettings(newSettings);
    }
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <Box
      title="Trading Setting Box"
      subtitle="리스크 가드레일, 타겟 코인 및 자동매매 파라미터 제어"
      icon={Settings}
      badge={dryRun ? '모의투자 모드 (Dry-run)' : '실전 거래 모드 (Live)'}
      badgeType={dryRun ? 'warning' : 'success'}
      actions={
        <button
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            border: 'none',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Save size={13} />
          <span>설정 저장</span>
        </button>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>손절선: <strong>-{stopLossPercent}%</strong> | 익절선: <strong>+{takeProfitPercent}%</strong></span>
          <span>1회 최대 주문한도: <strong>₩{Number(maxOrderAmount).toLocaleString()}</strong></span>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* Mode Toggle Sub-Box */}
        <SubBoxCard
          title="거래 모드 선택"
          description="실제 자산 투입 전 모의투자(Dry-Run)를 권장합니다."
          icon={Shield}
          badge={dryRun ? '모의투자' : '실전투자'}
          badgeType={dryRun ? 'warning' : 'success'}
        >
          <button
            onClick={() => setDryRun(!dryRun)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${dryRun ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              background: dryRun ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: dryRun ? '#fbbf24' : '#34d399',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <span>{dryRun ? '🛡️ 모의투자 (안전)' : '⚡ 실전투자 (Live)'}</span>
            {dryRun ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
          </button>
        </SubBoxCard>

        {/* Target Market Selector */}
        <SubBoxCard
          title="타겟 마켓 설정"
          description="자동매매를 집행할 원화(KRW) 마켓을 선택합니다."
          icon={Target}
        >
          <select
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 10px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="BTC_KRW" style={{ background: '#121225' }}>BTC / KRW (비트코인)</option>
            <option value="ETH_KRW" style={{ background: '#121225' }}>ETH / KRW (이더리움)</option>
            <option value="SOL_KRW" style={{ background: '#121225' }}>SOL / KRW (솔라나)</option>
            <option value="XRP_KRW" style={{ background: '#121225' }}>XRP / KRW (리플)</option>
          </select>
        </SubBoxCard>
      </div>

      {/* Numerical Sliders / Settings Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
            손절선 비율 (Stop-Loss %):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              step="0.5"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: '#f87171',
                fontWeight: 700,
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '13px', color: '#64748b' }}>%</span>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
            익절선 비율 (Take-Profit %):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              step="0.5"
              value={takeProfitPercent}
              onChange={(e) => setTakeProfitPercent(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '13px', color: '#64748b' }}>%</span>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
            1회 최대 주문 금액:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              step="10000"
              value={maxOrderAmount}
              onChange={(e) => setMaxOrderAmount(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '13px', color: '#64748b' }}>KRW</span>
          </div>
        </div>
      </div>

      {savedFeedback && (
        <div style={{
          marginTop: '12px',
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
          <span>트레이딩 설정이 성공적으로 저장 및 적용되었습니다!</span>
        </div>
      )}
    </Box>
  );
}
