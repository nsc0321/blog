import React from 'react';
import { BOX_REGISTRY, getBoxMetadata } from './BoxRegistry';
import BoxGuard from './BoxGuard';
import ChatBox from '../agent/ChatBox';
import CallAgentApiBox from '../agent/CallAgentApiBox';
import TaskBox from '../agent/boxes/TaskBox';
import LogBox from '../agent/boxes/LogBox';
import SkillEditBox from '../agent/boxes/SkillEditBox';
import SkillTestBox from '../agent/boxes/SkillTestBox';
import AccountListBox from '../agent/boxes/AccountListBox';
import HistoryBox from '../agent/boxes/HistoryBox';
import AgentSettingBox from '../agent/boxes/AgentSettingBox';

import TradingLiveTickerBox from '../trading/boxes/TradingLiveTickerBox';
import TradingAiAnalysisBox from '../trading/boxes/TradingAiAnalysisBox';
import TradingOrderBox from '../trading/boxes/TradingOrderBox';
import TradingPositionBox from '../trading/boxes/TradingPositionBox';
import TradingSettingBox from '../trading/TradingSettingBox';

import MabiOpenApiSearchBox from '../mabinogi/boxes/MabiOpenApiSearchBox';
import MabiItemArchiveBox from '../mabinogi/boxes/MabiItemArchiveBox';
import MabiEnchantArchiveBox from '../mabinogi/boxes/MabiEnchantArchiveBox';
import MabiBatchControlBox from '../mabinogi/boxes/MabiBatchControlBox';

const COMPONENT_MAP = {
  // Agent
  agent_chat: ChatBox,
  agent_call_api: CallAgentApiBox,
  agent_task: TaskBox,
  agent_log: LogBox,
  agent_skill_edit: SkillEditBox,
  agent_skill_test: SkillTestBox,
  agent_account_list: AccountListBox,
  agent_history: HistoryBox,
  agent_setting: AgentSettingBox,
  
  // Trading
  trading_ticker: TradingLiveTickerBox,
  trading_ai_analysis: TradingAiAnalysisBox,
  trading_order: TradingOrderBox,
  trading_positions: TradingPositionBox,
  trading_setting: TradingSettingBox,

  // Mabinogi
  mabi_search: MabiOpenApiSearchBox,
  mabi_items: MabiItemArchiveBox,
  mabi_enchants: MabiEnchantArchiveBox,
  mabi_batch: MabiBatchControlBox
};

export default function CompositeBox({
  title = '맞춤형 조합 Box',
  boxIds = ['agent_chat', 'trading_ticker'],
  layout = 'grid',
  sharedProps = {}
}) {
  return (
    <div className="composite-box-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
            🧩 {title}
          </h3>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {boxIds.length}개 독립 Box 조합됨
          </span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: layout === 'stack' ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {boxIds.map((boxId) => {
          const meta = getBoxMetadata(boxId);
          const Component = COMPONENT_MAP[boxId];
          if (!meta || !Component) return null;

          return (
            <BoxGuard key={boxId} minRole={meta.minRole} boxTitle={meta.name}>
              <Component {...sharedProps} />
            </BoxGuard>
          );
        })}
      </div>
    </div>
  );
}
