import React from 'react';
import { MessageSquare, Cpu, Terminal, Zap, Wrench, Info, Play, Key, Plus, History, Settings, DollarSign, TrendingUp, Search, Layers, Users, ShieldCheck, Sparkles, PieChart } from 'lucide-react';

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
    name: 'Chat Box (AI 대화)',
    category: BOX_CATEGORIES.AGENT,
    icon: MessageSquare,
    description: '실시간 음성인식(STT) 및 텍스트 프롬프트 기반 양방향 대화 인터페이스',
    minRole: 'user'
  },
  {
    id: 'agent_call_api',
    name: 'Call Agent API Box (스킬 실행)',
    category: BOX_CATEGORIES.AGENT,
    icon: Cpu,
    description: '등록된 커스텀 스킬 및 시스템 백엔드 API 직접 호출 & 디버깅 콘솔',
    minRole: 'user'
  },
  {
    id: 'agent_task',
    name: 'Task Box (태스크 모니터)',
    category: BOX_CATEGORIES.SYSTEM,
    icon: Zap,
    description: '비동기 백그라운드 프로세스 및 스케줄러 데몬 실시간 모니터링',
    minRole: 'user'
  },
  {
    id: 'agent_log',
    name: 'Log Box (실시간 로그)',
    category: BOX_CATEGORIES.SYSTEM,
    icon: Terminal,
    description: '실시간 Uvicorn 및 Agent 텔레메트리 스트리밍 터미널 로그',
    minRole: 'user'
  },
  {
    id: 'agent_skill_edit',
    name: 'Skill Edit Box (스킬 편집기)',
    category: BOX_CATEGORIES.AGENT,
    icon: Wrench,
    description: '파이썬 스킬 코드 작성, 수정 및 실시간 저장 에디터 (관리자 전용)',
    minRole: 'admin'
  },
  {
    id: 'agent_skill_test',
    name: 'Skill Test Box (스킬 테스트)',
    category: BOX_CATEGORIES.AGENT,
    icon: Play,
    description: '테스트 JSON 인자 주입 및 스킬 샌드박스 실행 검증',
    minRole: 'user'
  },
  {
    id: 'agent_account_list',
    name: 'Account List Box (자격증명)',
    category: BOX_CATEGORIES.ADMIN,
    icon: Key,
    description: '저장된 외부 서비스 API Key 및 자격증명 관리 (관리자 전용)',
    minRole: 'admin'
  },
  {
    id: 'agent_history',
    name: 'Agent History Box (실행 이력)',
    category: BOX_CATEGORIES.AGENT,
    icon: History,
    description: 'Agent 스킬 및 태스크 실행 이력, 보안 감사 로그',
    minRole: 'user'
  },
  {
    id: 'agent_setting',
    name: 'Setting Box (환경 설정)',
    category: BOX_CATEGORIES.AGENT,
    icon: Settings,
    description: 'TTS 음성 출력, 3D 아바타 및 LLM 모델 환경 설정',
    minRole: 'user'
  },

  // 2. Trading Group
  {
    id: 'trading_ticker',
    name: 'Live Ticker Box (시세/지표)',
    category: BOX_CATEGORIES.TRADING,
    icon: TrendingUp,
    description: '빗썸 실시간 체결가, 호가 및 RSI/MACD 보조지표 연산',
    minRole: 'user'
  },
  {
    id: 'trading_ai_analysis',
    name: 'AI Market Analysis Box (LLM 퀀트)',
    category: BOX_CATEGORIES.TRADING,
    icon: Sparkles,
    description: '실시간 시장 호가 & 지표 기반 LLM 매매 신호 분석',
    minRole: 'user'
  },
  {
    id: 'trading_order',
    name: 'Order Execution Box (주문 집행)',
    category: BOX_CATEGORIES.TRADING,
    icon: DollarSign,
    description: '수동/자동 분할 매수 및 매도 즉시 주문 집행',
    minRole: 'user'
  },
  {
    id: 'trading_positions',
    name: 'Positions Box (자산 잔고)',
    category: BOX_CATEGORIES.TRADING,
    icon: PieChart,
    description: '원화(KRW) 잔고 및 보유 암호화폐 자산 현황',
    minRole: 'user'
  },
  {
    id: 'trading_setting',
    name: 'Trading Setting Box (전략 설정)',
    category: BOX_CATEGORIES.TRADING,
    icon: Settings,
    description: '타겟 마켓 선택, 손익절 % 및 모의투자(Dry-Run) 모드 설정',
    minRole: 'user'
  },

  // 3. Mabinogi Group
  {
    id: 'mabi_search',
    name: 'Mabi Open API Search Box (경매장 시세)',
    category: BOX_CATEGORIES.MABINOGI,
    icon: Search,
    description: '넥슨 공식 Open API 실시간 경매장 시세 및 거래 내역 차트 검색',
    minRole: 'user'
  },
  {
    id: 'mabi_items',
    name: 'Item Archive Box (아이템 DB)',
    category: BOX_CATEGORIES.MABINOGI,
    icon: Layers,
    description: '수집된 장비, 무기 및 제작 재료 아이템 아카이브',
    minRole: 'user'
  },
  {
    id: 'mabi_enchants',
    name: 'Enchant Archive Box (인챈트 DB)',
    category: BOX_CATEGORIES.MABINOGI,
    icon: Sparkles,
    description: '접두/접미 인챈트 스크롤 옵션 및 랭크 데이터베이스',
    minRole: 'user'
  },
  {
    id: 'mabi_batch',
    name: 'Batch Collector Box (자동 수집)',
    category: BOX_CATEGORIES.MABINOGI,
    icon: Cpu,
    description: '넥슨 경매장 & 아이템 빅데이터 자동 스크랩 배치 제어 (관리자 전용)',
    minRole: 'admin'
  }
];

export function getBoxMetadata(boxId) {
  return BOX_REGISTRY.find(b => b.id === boxId) || null;
}

export function getBoxesByCategory(category) {
  return BOX_REGISTRY.filter(b => b.category === category);
}
