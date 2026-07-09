import React, { useEffect, useRef, useState } from 'react';

export default function AvatarCanvas({ isSpeaking, isListening, isLoading }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Track cursor position to make avatar look at it
  useEffect(() => {
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;
      
      // Calculate normalized direction (-1 to 1)
      const dx = (e.clientX - canvasCenterX) / (window.innerWidth / 2);
      const dy = (e.clientY - canvasCenterY) / (window.innerHeight / 2);
      
      // Clamp values
      mouseRef.current.targetX = Math.max(-1, Math.min(1, dx)) * 20; // max shift 20px
      mouseRef.current.targetY = Math.max(-1, Math.min(1, dy)) * 15; // max shift 15px
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle microphone input when listening
  useEffect(() => {
    if (!isListening) {
      // Clean up mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      setMicVolume(0);
      return;
    }

    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        const checkVolume = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const avg = sum / dataArrayRef.current.length;
          setMicVolume(avg / 255); // Normalize to 0 - 1

          if (isListening) {
            requestAnimationFrame(checkVolume);
          }
        };
        checkVolume();
      } catch (err) {
        console.warn("Microphone access denied or failed for visualizer:", err);
      }
    };

    startMic();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isListening]);

  // Main Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set display size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = 320 * dpr;
      canvas.height = 320 * dpr;
      canvas.style.width = '320px';
      canvas.style.height = '320px';
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    // Visual variables
    let time = 0;
    let eyeBlinkTimer = 0;
    let eyeClosed = false;
    let eyeCloseDuration = 0;

    // Particle array for "thinking" and "idle" background
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * 320,
      y: Math.random() * 320,
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.5 + 0.2,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.2
    }));

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, 320, 320);

      // Smooth mouse interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Determine state color palette
      let primaryColor = '#8b5cf6'; // Idle: Violet
      let secondaryColor = '#06b6d4'; // Idle: Cyan
      let glowColor = 'rgba(139, 92, 246, 0.4)';

      if (isListening) {
        primaryColor = '#10b981'; // Listening: Green
        secondaryColor = '#34d399';
        glowColor = 'rgba(16, 185, 129, 0.5)';
      } else if (isLoading) {
        primaryColor = '#ec4899'; // Thinking: Pink
        secondaryColor = '#a855f7'; // Purple
        glowColor = 'rgba(236, 72, 153, 0.5)';
      } else if (isSpeaking) {
        primaryColor = '#06b6d4'; // Speaking: Cyan
        secondaryColor = '#6366f1'; // Indigo
        glowColor = 'rgba(6, 182, 212, 0.5)';
      }

      // Draw background ambient particles
      particles.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${isLoading ? '236, 72, 153' : '139, 92, 246'}, ${p.opacity})`;
        ctx.fill();

        // Particle behavior based on states
        if (isLoading) {
          // Vortex pull toward center in thinking state
          const dx = 160 - p.x;
          const dy = 160 - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            const angle = Math.atan2(dy, dx) + 0.05; // Spiral angle
            p.x = 160 - Math.cos(angle) * (dist - 1);
            p.y = 160 - Math.sin(angle) * (dist - 1);
          } else {
            // Respawn particle at boundary
            const angle = Math.random() * Math.PI * 2;
            p.x = 160 + Math.cos(angle) * 150;
            p.y = 160 + Math.sin(angle) * 150;
          }
        } else {
          // Floating floaty idle motion
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          if (p.x < 0 || p.x > 320 || p.y < 0 || p.y > 320) {
            p.x = Math.random() * 320;
            p.y = Math.random() * 320;
          }
        }
      });

      const centerX = 160;
      const centerY = 160;

      // Eye blink logic
      eyeBlinkTimer++;
      if (!eyeClosed && eyeBlinkTimer > 180) { // blink roughly every 3-4 seconds
        if (Math.random() < 0.15) {
          eyeClosed = true;
          eyeCloseDuration = 0;
        }
      }
      if (eyeClosed) {
        eyeCloseDuration++;
        if (eyeCloseDuration > 6) { // blink lasts for 6 frames
          eyeClosed = false;
          eyeBlinkTimer = 0;
        }
      }

      // 1. Draw outermost cybernetic rotating ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(isLoading ? -time * 1.5 : time * 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 1.6);
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 12, 18, 12]);
      ctx.stroke();
      ctx.restore();

      // 2. Draw inner digital dashed ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(isListening ? time * 1.0 : -time * 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 1.8);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.0;
      ctx.setLineDash([2, 8]);
      ctx.stroke();
      ctx.restore();

      // 3. Draw ambient aura glow behind the face/core
      const baseRadius = 65 + Math.sin(time * 2) * 2;
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, baseRadius + 40);
      glowGrad.addColorStop(0, primaryColor + '1a'); // transparent colors
      glowGrad.addColorStop(0.5, secondaryColor + '08');
      glowGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 40, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // 4. Draw Core Base Shape (The metallic glass backplate)
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(18, 18, 37, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = glowColor;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // 5. Visualizer Ring (Reactive to audio frequency / speech synthesis)
      let audioScale = 0;
      if (isListening) {
        audioScale = micVolume * 55;
      } else if (isSpeaking) {
        // Procedural speaking wave pattern simulation
        audioScale = (Math.sin(time * 5) * 0.5 + 0.5) * 12 * (0.8 + Math.cos(time * 0.7) * 0.2);
      } else if (isLoading) {
        audioScale = (Math.sin(time * 8) * 0.5 + 0.5) * 4;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const sineWave = Math.sin(angle * 6 + time * 4);
        const r = baseRadius - 8 + (sineWave * audioScale * 0.6);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${isListening ? '52, 211, 153' : '6, 182, 212'}, 0.45)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 6. Draw AI "Eyes" / Interface Core (Looks like dual glowing lenses)
      const eyeOffsetX = 18;
      const eyeOffsetY = -5;
      
      const leftEyeX = centerX - eyeOffsetX + mouse.x * 0.35;
      const leftEyeY = centerY + eyeOffsetY + mouse.y * 0.35;
      const rightEyeX = centerX + eyeOffsetX + mouse.x * 0.35;
      const rightEyeY = centerY + eyeOffsetY + mouse.y * 0.35;

      const drawEye = (x, y) => {
        if (eyeClosed) {
          // Closed eye line
          ctx.beginPath();
          ctx.moveTo(x - 8, y);
          ctx.lineTo(x + 8, y);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else {
          // Open eye concentric glowing circles
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
          ctx.strokeStyle = primaryColor + '66';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Pupil (Inner Core)
          ctx.beginPath();
          let pupilRadius = 4;
          if (isLoading) pupilRadius = 3 + Math.sin(time * 4) * 0.5;
          ctx.arc(x + mouse.x * 0.15, y + mouse.y * 0.15, pupilRadius, 0, Math.PI * 2);
          ctx.fillStyle = secondaryColor;
          ctx.shadowBlur = 10;
          ctx.shadowColor = secondaryColor;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      };

      drawEye(leftEyeX, leftEyeY);
      drawEye(rightEyeX, rightEyeY);

      // 7. Draw AI Hologram "Mouth" Waveform
      const mouthY = centerY + 22;
      ctx.beginPath();
      
      // Draw mouth line
      if (isSpeaking) {
        ctx.moveTo(centerX - 24, mouthY);
        // Waves reacting to speaking
        for (let x = -24; x <= 24; x += 4) {
          const px = centerX + x;
          // Calculate wave height based on x position to taper off at boundaries
          const envelope = Math.cos((x / 24) * (Math.PI / 2));
          const waveHeight = Math.sin((x / 4) + time * 6) * audioScale * 0.9 * envelope;
          ctx.lineTo(px, mouthY + waveHeight);
        }
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else if (isListening) {
        ctx.moveTo(centerX - 24, mouthY);
        // Listening wave
        for (let x = -24; x <= 24; x += 4) {
          const px = centerX + x;
          const envelope = Math.cos((x / 24) * (Math.PI / 2));
          const waveHeight = Math.sin((x / 3) + time * 3) * (5 + micVolume * 30) * envelope;
          ctx.lineTo(px, mouthY + waveHeight);
        }
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else if (isLoading) {
        // Thinking state - flat mouth but small loading wave
        ctx.moveTo(centerX - 20, mouthY);
        for (let x = -20; x <= 20; x += 4) {
          const px = centerX + x;
          const envelope = Math.cos((x / 20) * (Math.PI / 2));
          const waveHeight = Math.sin((x / 2) + time * 2) * 1.5 * envelope;
          ctx.lineTo(px, mouthY + waveHeight);
        }
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Idle - slight gentle smile
        ctx.beginPath();
        ctx.arc(centerX, mouthY - 4, 16, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isSpeaking, isListening, isLoading, micVolume]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle, rgba(18,18,37,0.4) 0%, rgba(10,10,20,0.85) 100%)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.05), var(--card-shadow)',
      padding: '24px',
      width: '100%',
      maxWidth: '360px',
      height: '360px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Hologram Grid Overlay effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(rgba(18, 18, 37, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(139, 92, 246, 0.03), rgba(6, 182, 212, 0.03))',
        backgroundSize: '100% 4px, 4px 100%',
        pointerEvents: 'none',
        zIndex: 2
      }}></div>

      {/* Holographic light beam reflection at the bottom */}
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '20%',
        right: '20%',
        height: '40px',
        background: 'radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
        filter: 'blur(10px)',
        pointerEvents: 'none'
      }}></div>

      <canvas ref={canvasRef} style={{ zIndex: 1 }} />
    </div>
  );
}
