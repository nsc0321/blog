import React, { useState } from 'react';
import { Sparkles, Search, RefreshCw } from 'lucide-react';
import { Box } from '../../common/Box';

export default function MabiEnchantArchiveBox() {
  const [search, setSearch] = useState('');

  const sampleEnchants = [
    { id: 1, name: '미티어로이드 (Meteoroid)', position: '접미 (Suffix)', rank: 'Rank 1', effect: '최대 대미지 25~45 증가, 피어싱 1~3 레벨 증가' },
    { id: 2, name: '솔리스트 (Soloist)', position: '접두 (Prefix)', rank: 'Rank 5', effect: '음악 버프 스킬 효과 2~3 증가, 행운 15 증가' },
    { id: 3, name: '기억상실 (Amnesia)', position: '접두 (Prefix)', rank: 'Rank 9', effect: '최대 대미지 10~13 증가, 체력 15 증가' }
  ];

  const filtered = sampleEnchants.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.effect.includes(search)
  );

  return (
    <Box
      title="3. Enchant Archive Box (인챈트 스크롤 아카이브)"
      subtitle="수집된 접두/접미 인챈트 스크롤 옵션 및 랭크 데이터"
      icon={Sparkles}
      badge="Enchant DB"
      badgeType="info"
    >
      <div style={{ marginBottom: '14px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="인챈트 이름 또는 옵션 효과 검색..."
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(enc => (
          <div
            key={enc.id}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                {enc.name}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
                  {enc.position}
                </span>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                  {enc.rank}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.5 }}>
              {enc.effect}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}
