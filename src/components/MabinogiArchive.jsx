import React, { useState, useEffect } from 'react';
import { Database, Search, Layers, Sparkles, Cpu } from 'lucide-react';
import MabiTabBox from './mabinogi/boxes/MabiTabBox';
import MabiStatusBox from './mabinogi/boxes/MabiStatusBox';
import MabiOpenApiSearchBox from './mabinogi/boxes/MabiOpenApiSearchBox';
import MabiItemArchiveBox from './mabinogi/boxes/MabiItemArchiveBox';
import MabiEnchantArchiveBox from './mabinogi/boxes/MabiEnchantArchiveBox';
import MabiBatchControlBox from './mabinogi/boxes/MabiBatchControlBox';
import { getApiBase } from '../config';

export default function MabinogiArchive() {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'items' | 'enchants' | 'batch'
  const [stats, setStats] = useState({ items: 3840, enchants: 1250, health: 'ONLINE' });

  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';

  const fetchStats = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/mabinogi/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setStats({
          items: data.total_items || 3840,
          enchants: data.total_enchants || 1250,
          health: 'ONLINE'
        });
      }
    } catch (err) {
      console.log('Mabi stats note:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="mabi-container-box" style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Real-time Status Header Box */}
      <MabiStatusBox
        itemsCount={stats.items}
        enchantsCount={stats.enchants}
        apiHealth={stats.health}
      />

      {/* Tab Box Switcher */}
      <MabiTabBox
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Active Sub-Box View */}
      <div className="mabi-active-box-view">
        
        {/* 1. Open API Search Box View */}
        {activeTab === 'search' && (
          <MabiOpenApiSearchBox />
        )}

        {/* 2. Item Archive Box View */}
        {activeTab === 'items' && (
          <MabiItemArchiveBox />
        )}

        {/* 3. Enchant Archive Box View */}
        {activeTab === 'enchants' && (
          <MabiEnchantArchiveBox />
        )}

        {/* 4. Smart Batch Collector Box View (Admin Guarded) */}
        {activeTab === 'batch' && (
          <MabiBatchControlBox />
        )}

      </div>
    </div>
  );
}
