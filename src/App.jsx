import React from 'react';
import VoiceAssistant from './components/VoiceAssistant';

export default function App() {
  return (
    <div className="app-container">
      {/* Background Glows */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>
      <VoiceAssistant />
    </div>
  );
}
