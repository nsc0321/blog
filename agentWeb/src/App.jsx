import React from 'react';
import VoiceAssistant from './components/VoiceAssistant';

export default function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 24px' }}>
      {/* Background Glows */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>
      <VoiceAssistant />
    </div>
  );
}
