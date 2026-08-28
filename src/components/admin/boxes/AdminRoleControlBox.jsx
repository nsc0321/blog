import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { Box, SubBoxCard } from '../../common/Box';

export default function AdminRoleControlBox() {
  return (
    <Box
      title="2. RBAC Role & Security Policy Box"
      subtitle="역할 기반 접근 제어(Role-Based Access Control) 및 보안 정책 감사"
      icon={ShieldCheck}
      badge="RBAC Matrix"
      badgeType="purple"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <SubBoxCard
          title="👑 관리자 (Admin) 권한"
          description="모든 기능 및 API에 무제한 접근 가능"
          icon={ShieldCheck}
          badge="Full Access"
          badgeType="purple"
        >
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.6 }}>
            <li>스킬 파이썬 코드 작성 및 수정 (Skill Edit Box)</li>
            <li>외부 API Key 및 자격증명 등록/삭제 (Account Box)</li>
            <li>회원 역할 변경 및 비활성화 통제 (Admin Box)</li>
            <li>스마트 자동 수집 배치 스케줄러 통제</li>
          </ul>
        </SubBoxCard>

        <SubBoxCard
          title="👤 일반 회원 (User) 권한"
          description="실시간 기능 인터랙션 및 개인화 대시보드"
          icon={Lock}
          badge="Standard"
          badgeType="success"
        >
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.6 }}>
            <li>실시간 AI 음성/텍스트 대화 (Chat Box)</li>
            <li>스킬 실행 및 샌드박스 테스트 (Call API Box)</li>
            <li>빗썸 실시간 시세 조회 및 모의 주문 집행</li>
            <li>넥슨 캐릭터 및 경매장 데이터 검색</li>
          </ul>
        </SubBoxCard>
      </div>
    </Box>
  );
}
