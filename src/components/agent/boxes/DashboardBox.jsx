import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import TaskBox from './TaskBox';
import LogBox from './LogBox';

export default function DashboardBox({ tasks = [], onRefreshTasks }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        <TaskBox tasks={tasks} onRefresh={onRefreshTasks} />
        <LogBox />
      </div>
    </div>
  );
}
