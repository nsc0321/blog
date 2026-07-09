import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { Upload } from 'lucide-react';

export default function AvatarCanvas({ isSpeaking, isListening, isLoading }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [vrmUrl, setVrmUrl] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [hasModel, setHasModel] = useState(false);

  // States refs to pass to render loops without retriggering useEffect
  const stateRef = useRef({ isSpeaking, isListening, isLoading, mouseX: 0, mouseY: 0 });
  
  useEffect(() => {
    stateRef.current = { isSpeaking, isListening, isLoading, mouseX: stateRef.current.mouseX, mouseY: stateRef.current.mouseY };
  }, [isSpeaking, isListening, isLoading]);

  // Track mouse coordinates relative to canvas center
  useEffect(() => {
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      // Normalize to -1 to 1 range
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      
      // Clamp values and store
      stateRef.current.mouseX = Math.max(-1, Math.min(1, dx));
      stateRef.current.mouseY = Math.max(-1, Math.min(1, dy));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // WebGL & VRM Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = containerRef.current?.clientWidth || 320;
    const height = containerRef.current?.clientHeight || 320;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // 2. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 20.0);
    camera.position.set(0.0, 1.45, 1.5); // Focus on avatar head/shoulders

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(2.0, 4.0, 2.0);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Front soft fill light
    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.8);
    fillLight.position.set(-2.0, 1.0, 2.0);
    scene.add(fillLight);

    // 4. Create futuristic background/placeholder object (Constellation Sphere)
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Draw a holographic sphere structure
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 0.5; // sphere radius

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = 1.35 + r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;

      originalPositions.push({ x, y, z });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.012,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Grid Helper at bottom for futuristic depth
    const gridHelper = new THREE.GridHelper(10, 30, 0x8b5cf6, 0x4b5563);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Helper function to set expression values across VRM 0.0 & 1.0 specifications
    const setExpression = (vrmInstance, key, val) => {
      if (!vrmInstance) return;
      if (vrmInstance.expressionManager) {
        // VRM 1.0 syntax
        vrmInstance.expressionManager.setValue(key.toLowerCase(), val);
      } else if (vrmInstance.blendShapeProxy) {
        // VRM 0.0 fallback (A, I, U, E, O, Blink, Joy, Angry, etc.)
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        vrmInstance.blendShapeProxy.setValue(capitalized, val);
      }
    };

    // 5. Load VRM Model if URL is provided
    let currentVrm = null;
    let clock = new THREE.Clock();
    
    if (vrmUrl) {
      setLoadingModel(true);
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));
      
      loader.load(
        vrmUrl,
        (gltf) => {
          // Hide placeholder particle system
          particleSystem.visible = false;

          const vrm = gltf.userData.vrm;
          currentVrm = vrm;
          
          // Disable frustum culling to prevent sudden disappearances
          vrm.scene.traverse((obj) => {
            obj.frustumCulled = false;
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });

          scene.add(vrm.scene);
          
          // Adjust avatar height/transform
          vrm.scene.rotation.y = Math.PI; // Face the camera
          
          // Position camera based on avatar head
          const headNode = vrm.humanoid?.getNormalizedBoneNode('head') || vrm.humanoid?.getBoneNode('head');
          if (headNode) {
            const headWorldPos = new THREE.Vector3();
            headNode.getWorldPosition(headWorldPos);
            camera.position.set(0.0, headWorldPos.y - 0.05, 0.65);
            camera.lookAt(0.0, headWorldPos.y, 0.0);
          } else {
            camera.position.set(0.0, 1.4, 0.7);
            camera.lookAt(0.0, 1.45, 0.0);
          }

          setHasModel(true);
          setLoadingModel(false);
        },
        (progress) => {
          console.log(`Loading VRM: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
          console.error("VRM Loading failed:", error);
          setLoadingModel(false);
          alert("VRM 모델을 불러오는 도중 오류가 발생했습니다.");
        }
      );
    }

    // 6. Animation variables
    let animationFrameId;
    let eyeBlinkTimer = 0;
    let isBlinking = false;
    let blinkValue = 0;

    // 7. Render Loop
    const tick = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const states = stateRef.current;

      // Update state colors for placeholder particles if no model
      if (!currentVrm) {
        let targetColor = 0x8b5cf6; // Idle
        let speed = 1.0;
        if (states.isListening) {
          targetColor = 0x10b981; // Green
          speed = 2.5;
        } else if (states.isLoading) {
          targetColor = 0xec4899; // Pink
          speed = 4.0;
        } else if (states.isSpeaking) {
          targetColor = 0x06b6d4; // Cyan
          speed = 1.8;
        }
        material.color.setHex(targetColor);

        // Animate particles sphere
        const positionAttr = geometry.attributes.position;
        for (let i = 0; i < particleCount; i++) {
          const orig = originalPositions[i];
          const wave = Math.sin(elapsedTime * speed + i) * (states.isListening ? 0.08 : states.isLoading ? 0.15 : 0.03);
          positionAttr.setX(i, orig.x * (1.0 + wave));
          positionAttr.setY(i, orig.y + (orig.y - 1.35) * wave);
          positionAttr.setZ(i, orig.z * (1.0 + wave));
        }
        positionAttr.needsUpdate = true;
        particleSystem.rotation.y = elapsedTime * 0.1 * speed;
      }

      // Animate VRM Model if loaded
      if (currentVrm) {
        // Breathe simulation (Slow chest/shoulders movement)
        const breathe = Math.sin(elapsedTime * 2.0) * 0.02;
        const chest = currentVrm.humanoid?.getNormalizedBoneNode('chest') || currentVrm.humanoid?.getBoneNode('chest');
        if (chest) {
          chest.rotation.z = breathe * 0.15;
          chest.rotation.x = breathe * 0.1;
        }

        // Arm posture (Natural down position with slight breathe sway)
        const leftUpperArm = currentVrm.humanoid?.getNormalizedBoneNode('leftUpperArm') || currentVrm.humanoid?.getBoneNode('leftUpperArm');
        const rightUpperArm = currentVrm.humanoid?.getNormalizedBoneNode('rightUpperArm') || currentVrm.humanoid?.getBoneNode('rightUpperArm');
        if (leftUpperArm && rightUpperArm) {
          leftUpperArm.rotation.z = -Math.PI / 4.5 + breathe * 0.1;
          rightUpperArm.rotation.z = Math.PI / 4.5 - breathe * 0.1;
          
          if (states.isSpeaking) {
            // raise right hand slightly while talking
            rightUpperArm.rotation.x = -0.15 + Math.sin(elapsedTime * 4.0) * 0.08;
            rightUpperArm.rotation.z = Math.PI / 5;
          } else {
            rightUpperArm.rotation.x = 0;
          }
        }

        // Head and Neck mouse cursor tracking
        const head = currentVrm.humanoid?.getNormalizedBoneNode('head') || currentVrm.humanoid?.getBoneNode('head');
        const neck = currentVrm.humanoid?.getNormalizedBoneNode('neck') || currentVrm.humanoid?.getBoneNode('neck');
        
        // Smooth cursor tracking target interpolation
        if (head && neck) {
          // target bone rotation y (yaw) and x (pitch)
          const targetY = -states.mouseX * 0.45; // reverse since vrm faces us
          const targetX = states.mouseY * 0.25;

          head.rotation.y += (targetY - head.rotation.y) * 0.08;
          head.rotation.x += (targetX - head.rotation.x) * 0.08;
          neck.rotation.y = head.rotation.y * 0.2;
        }

        // Automatic Eye Blink
        eyeBlinkTimer += delta;
        if (!isBlinking && eyeBlinkTimer > 3.0 + Math.random() * 4.0) { // Blink every 3-7s
          isBlinking = true;
          eyeBlinkTimer = 0;
        }

        if (isBlinking) {
          // Linear open-close blink transition
          blinkValue += delta * 12.0; 
          if (blinkValue >= 1.0) {
            blinkValue = 1.0;
            isBlinking = false; // start opening
          }
          const scaleVal = Math.sin(blinkValue * Math.PI); // shape peak
          setExpression(currentVrm, 'blink', scaleVal);
        } else if (blinkValue > 0) {
          // Return eye to open state
          blinkValue -= delta * 8.0;
          if (blinkValue <= 0) blinkValue = 0;
          setExpression(currentVrm, 'blink', blinkValue);
        }

        // Lip-Sync (Procedural talk mouth animation)
        if (states.isSpeaking) {
          const speakVal = (Math.sin(elapsedTime * 14) * 0.45 + 0.45) * (0.8 + Math.cos(elapsedTime * 1.5) * 0.2);
          setExpression(currentVrm, 'aa', speakVal);
          setExpression(currentVrm, 'oh', speakVal * 0.35);
        } else {
          setExpression(currentVrm, 'aa', 0);
          setExpression(currentVrm, 'oh', 0);
        }

        // State expression modifiers
        if (states.isListening) {
          setExpression(currentVrm, 'happy', 0.2);
          setExpression(currentVrm, 'surprised', 0);
        } else if (states.isLoading) {
          setExpression(currentVrm, 'happy', 0);
          setExpression(currentVrm, 'surprised', 0.15); // thinking posture
        } else if (states.isSpeaking) {
          setExpression(currentVrm, 'happy', 0.3);
          setExpression(currentVrm, 'surprised', 0);
        } else {
          // Idle state
          setExpression(currentVrm, 'happy', 0.15);
          setExpression(currentVrm, 'surprised', 0);
        }

        // Update VRM constraints / physics
        currentVrm.update(delta);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // 8. Handle Container Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (currentVrm) {
        scene.remove(currentVrm.scene);
      }
    };
  }, [vrmUrl]);

  // Handle local file loading (.vrm file drag & drop or file dialog selection)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadLocalVrm(file);
  };

  const loadLocalVrm = (file) => {
    if (!file.name.endsWith('.vrm')) {
      alert('VRM (.vrm) 확장자 파일만 업로드할 수 있습니다.');
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    setVrmUrl(blobUrl);
  };

  // Drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadLocalVrm(file);
    }
  };

  return (
    <div 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(18,18,37,0.45) 0%, rgba(10,10,20,0.92) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.06), var(--card-shadow)',
        width: '100%',
        maxWidth: '360px',
        height: '360px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default'
      }}
    >
      {/* Hologram Overlay Screen Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(rgba(18, 18, 37, 0) 50%, rgba(0, 0, 0, 0.15) 50%), linear-gradient(90deg, rgba(139, 92, 246, 0.02), rgba(6, 182, 212, 0.02))',
        backgroundSize: '100% 4px, 4px 100%',
        pointerEvents: 'none',
        zIndex: 3
      }} />

      {/* WebGL Canvas */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', zIndex: 1 }} />

      {/* Model Loader UI Controls */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        background: 'rgba(10, 10, 20, 0.65)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '6px 12px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '700', letterSpacing: '0.05em' }}>3D 아바타 피팅</span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hasModel ? '로딩 완료 (.vrm)' : '캐릭터 파일 업로드 대기'}
          </span>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loadingModel}
          style={{
            background: 'var(--accent-gradient)',
            border: 'none',
            color: '#fff',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: loadingModel ? 0.5 : 1,
            transition: 'transform 0.1s'
          }}
        >
          <Upload size={12} />
          {loadingModel ? '로딩 중...' : hasModel ? '변경' : '로드'}
        </button>

        <input 
          ref={fileInputRef}
          type="file" 
          accept=".vrm" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Drag & Drop Prompt when no model is loaded */}
      {!hasModel && !loadingModel && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: 'absolute',
            top: '40px', left: '40px', right: '40px', bottom: '80px',
            border: '2px dashed rgba(139, 92, 246, 0.25)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: 'rgba(255, 255, 255, 0.45)',
            cursor: 'pointer',
            zIndex: 5,
            transition: 'all 0.2s',
            background: 'rgba(10, 10, 20, 0.25)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)'}
        >
          <Upload size={24} style={{ color: '#8b5cf6' }} />
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>클릭 또는 .vrm 파일 드래그</span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', padding: '0 8px' }}>
              VRoid Studio 등에서 추출한 .vrm 확장자 모델 파일을 그대로 올려주세요.
            </span>
          </div>
        </div>
      )}

      {/* Loader spinner */}
      {loadingModel && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 10, 20, 0.8)',
          zIndex: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(139, 92, 246, 0.1)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'audio-wave 1s linear infinite'
          }}></div>
          <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600' }}>3D 캐릭터 엔진 구성 중...</span>
        </div>
      )}
    </div>
  );
}
