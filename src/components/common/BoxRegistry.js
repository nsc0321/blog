import React from 'react';
import { MessageSquare, Cpu, Terminal, Zap, Wrench, Info, Play, Key, Plus, History, Settings, DollarSign, TrendingUp, Search, Layers, Users, ShieldCheck } from 'lucide-react';

// Lazy or Direct component mapping helper
export const BOX_CATEGORIES = {
  AGENT: 'Agent AI',
  TRADING: 'AI Trading',
  MABINOGI: 'Mabinogi Archive',
  ADMIN: 'Admin Management',
  SYSTEM: 'System Telemetry'
};

export const BOX_REGISTRY = [
  // 1. Agent Group
  {
    id: 'agent_chat',
    name: '1. Chat Box',
    category: BOX_CATEGORIES.AGENT,
    icon: MessageSquare,
    description: '실시간 음성인식(STT) 및 텍스트 프롬프트 기반 양방향 대화 인터페이스',
    minRole: 'user',
    defaultWidth: 'half'
  },
  {
    id: 'agent_call_api',
    name: '2. Call Agent API Box',
    category: BOX_CATEGORIES.AGENT,
    icon: Cpu,
    description: '등록된 커스텀 스킬 및 시스템 백엔드 API 직접 호출 & 디버깅 콘솔',
    minRole: 'user',
    defaultWidth: 'half'
  },
  {
    id: 'agent_task',
    name: '6-1. Task Box',
    category: BOX_CATEGORIES.SYSTEM,
    icon: Zap,
    description: '비동기 백그라운드 프로세스 및 스케줄러 데몬 실시간 모니터링',
    minRole: 'user',
    defaultWidth: 'half'
  },
  {
    id: 'agent_log',
    name: '6-2. Log Box',
    category: BOX_CATEGORIES.SYSTEM,
    icon: Terminal,
    description: '실시간 Uvicorn 및 Agent 텔레메트리 스트리밍 터미널 로그',
    minRole: 'user',
    defaultWidth: 'half'
  },
  {
    id: 'agent_skill_edit',
    name: '7-1. Skill Edit Box',
    category: BOX_CATEGORIES.AGENT,
    icon: Wrench,
    description: '파이썬 스킬 코드 작성, 수정 및 실시간 저장 에디터 (관리자 전용)',
    minRole: 'admin',
    defaultWidth: 'full'
  },
  {
    id: 'agent_skill_test',
    name: '7-3. Skill Test Box',
    category: BOX_CATEGORIES.AGENT,
    icon: Play,
    description: '테스트 JSON 인자 주입 및 스킬 샌드박스 실행 검증',
    minRole: 'user',
    defaultWidth: 'half'
  },
  {
    id: 'agent_account_list',
    name: '8-1. Account List Box',
    category: BOX_CATEGORIES.ADMIN,
    icon: Key,
    description: '저장된 외부 서비스 API Key 및 자격증명 관리 (관리자 전용)',
    minRole: 'admin',
    defaultWidth: 'half'
  },
  {
    id: 'agent_history',
    name: '9. History Box',
    category: BOX_CATEGORIES.AGENT,
    icon: History,
    description: 'Agent 스킬 실행 이력 및 보안 감사 로그',
    minRole: 'user',
    defaultWidth: 'full'
  },
  {
    id: 'agent_setting',
    name: '3. Setting Box',
    category: BOX_CATEGORIES.AGENT,
    icon: Settings,
    description: 'TTS 음성 출력, 3D 아바타 및 LLM 모델 환경 설정',
    minRole: 'user',
    defaultWidth: 'full'
  },

  // 2. Trading Group
  {
    id: 'trading_call_api',
    name: 'Call Trading API Box',
    category: BOX_CATEGORIES.TRADING,
    icon: DollarSign,
    description: '빗썸 실시간 시세 조회, AI LLM 시장 분석 및 주문 집행',
    minRole: 'user',
    defaultWidth: 'half'
  },
  {
    id: 'trading_setting',
    name: 'Trading Setting Box',
    category: BOX_CATEGORIES.TRADING,
    icon: Settings,
    description: '타겟 마켓 선택, 손익절 % 및 모의투자(Dry-Run) 모드 설정',
    minRole: 'user',
    defaultWidth: 'half'
  }
];

export function getBoxMetadata(boxId) {
  return BOX_REGISTRY.find(b => b.id === boxId) || null;
}

export function getBoxesByCategory(category) {
  return BOX_REGISTRY.filter(b => b.category === category);
}
