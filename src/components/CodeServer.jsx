import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, Play, Download, Sparkles, Folder, File, Plus, Trash2, 
  RefreshCw, Save, Layers, Terminal, Monitor, Smartphone, Tablet, 
  ExternalLink, CheckCircle2, AlertCircle, Cpu, FileCode, Check, Eye,
  Maximize2, Shield, Settings, Key, Globe
} from 'lucide-react';
import { getApiBase } from '../config';

export default function CodeServer() {
  const API_BASE = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') || '' : '';
  
  // Top View Mode: 'vscode' (Full OCI Cloud IDE) | 'studio' (AI Studio & App Builder)
  const [activeMode, setActiveMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('code_server_active_mode') || 'vscode';
    }
    return 'vscode';
  });

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('code_server_active_mode', mode);
    }
  };

  // VS Code Web (OCI code-server) Connection URL State
  const [vscodeUrl, setVscodeUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oci_vscode_url');
      if (saved) return saved;
      // Auto-detect host from current window or API_BASE
      try {
        const urlObj = new URL(API_BASE);
        return `http://${urlObj.hostname}:8443`;
      } catch (e) {
        return 'http://localhost:8443';
      }
    }
    return 'http://localhost:8443';
  });
  const [customVscodeInput, setCustomVscodeInput] = useState(vscodeUrl);
  const [showVscodeSettings, setShowVscodeSettings] = useState(false);

  const handleSaveVscodeUrl = (e) => {
    e.preventDefault();
    if (!customVscodeInput.trim()) return;
    setVscodeUrl(customVscodeInput.trim());
    if (typeof window !== 'undefined') {
      localStorage.setItem('oci_vscode_url', customVscodeInput.trim());
    }
    setShowVscodeSettings(false);
  };

  // ----------------------------------------------------------------
  // Studio & AI App Builder State
  // ----------------------------------------------------------------
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  });

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('demo-react-app');
  const [fileTree, setFileTree] = useState([]);
  const [selectedFilePath, setSelectedFilePath] = useState('app.js');
  const [fileContent, setFileContent] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // New Project Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjId, setNewProjId] = useState('');
  const [newProjTemplate, setNewProjTemplate] = useState('react-spa');
  const [templates, setTemplates] = useState([]);

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState('');

  // Right Panel Tabs: 'preview' | 'build'
  const [rightTab, setRightTab] = useState('preview');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [previewKey, setPreviewKey] = useState(Date.now());

  // Build State
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState([]);
  const [buildManifest, setBuildManifest] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Templates & Projects
  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/code-server/templates`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (e) {}
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const projs = data.projects || [];
        setProjects(projs);
        if (projs.length > 0 && !projs.find(p => p.id === selectedProjectId)) {
          setSelectedProjectId(projs[0].id);
        }
      }
    } catch (e) {}
  };

  const fetchFileTree = async (projId) => {
    if (!projId) return;
    setLoadingFiles(true);
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects/${projId}/tree`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFileTree(data.tree || []);
      }
    } catch (e) {} finally {
      setLoadingFiles(false);
    }
  };

  const fetchFileContent = async (projId, filePath) => {
    if (!projId || !filePath) return;
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects/${projId}/file?path=${encodeURIComponent(filePath)}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content || '');
        setSelectedFilePath(filePath);
        setIsModified(false);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchTemplates();
    fetchProjects();
  }, [API_BASE]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchFileTree(selectedProjectId);
      if (selectedProjectId === 'demo-react-app') {
        fetchFileContent(selectedProjectId, 'app.js');
      } else {
        fetchFileContent(selectedProjectId, 'index.html');
      }
      setPreviewKey(Date.now());
    }
  }, [selectedProjectId]);

  const handleSaveFile = async () => {
    if (!selectedProjectId || !selectedFilePath) return;
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects/${selectedProjectId}/file`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          file_path: selectedFilePath,
          content: fileContent
        })
      });
      if (res.ok) {
        setIsModified(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        setPreviewKey(Date.now());
      }
    } catch (e) {
      alert(`저장 실패: ${e.message}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectId, selectedFilePath, fileContent]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjId.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          project_id: newProjId.trim(),
          template: newProjTemplate,
          description: `${newProjTemplate} 기반 프로젝트`
        })
      });
      if (res.ok) {
        setShowNewModal(false);
        const createdId = newProjId.trim();
        setNewProjId('');
        await fetchProjects();
        setSelectedProjectId(createdId);
      } else {
        const err = await res.json();
        alert(`프로젝트 생성 실패: ${err.detail || err.message}`);
      }
    } catch (e) {
      alert(`오류: ${e.message}`);
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!confirm(`프로젝트 '${projId}'를 정말 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects/${projId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchProjects();
      }
    } catch (e) {
      alert(`삭제 오류: ${e.message}`);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !selectedProjectId) return;
    setIsAiGenerating(true);
    setAiStatusMsg('🧠 LLM이 전체 프로젝트 구조 및 코드를 생성하는 중입니다...');
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects/${selectedProjectId}/ai/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          prompt: aiPrompt,
          template: newProjTemplate
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAiStatusMsg(`✨ ${data.summary || '코드 생성이 완료되었습니다!'}`);
        await fetchFileTree(selectedProjectId);
        if (data.files_written && data.files_written.length > 0) {
          fetchFileContent(selectedProjectId, data.files_written[0]);
        }
        setPreviewKey(Date.now());
        setRightTab('preview');
      } else {
        setAiStatusMsg(`❌ 오류: ${data.message || 'LLM 생성 실패'}`);
      }
    } catch (e) {
      setAiStatusMsg(`❌ 오류: ${e.message}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAiEdit = async () => {
    if (!aiInstruction.trim() || !selectedProjectId || !selectedFilePath) return;
    setIsAiGenerating(true);
    setAiStatusMsg(`🧠 LLM이 ${selectedFilePath} 파일을 수정하는 중입니다...`);
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects/${selectedProjectId}/ai/edit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          file_path: selectedFilePath,
          instruction: aiInstruction
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAiStatusMsg(`✨ ${data.message}`);
        setFileContent(data.content);
        setIsModified(false);
        setAiInstruction('');
        setPreviewKey(Date.now());
      } else {
        setAiStatusMsg(`❌ 수정 실패: ${data.message}`);
      }
    } catch (e) {
      setAiStatusMsg(`❌ 오류: ${e.message}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleBuildProject = async () => {
    if (!selectedProjectId) return;
    setIsBuilding(true);
    setRightTab('build');
    try {
      const res = await fetch(`${API_BASE}/api/code-server/projects/${selectedProjectId}/build`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setBuildLogs(data.logs || []);
        setBuildManifest(data.manifest || null);
      } else {
        setBuildLogs([`❌ Build failed: ${data.message || 'Unknown error'}`]);
      }
    } catch (e) {
      setBuildLogs([`❌ Build error: ${e.message}`]);
    } finally {
      setIsBuilding(false);
    }
  };

  const renderTreeNodes = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const isSelected = node.type === 'file' && node.path === selectedFilePath;
      return (
        <div key={node.path} style={{ marginLeft: `${depth * 12}px` }}>
          {node.type === 'directory' ? (
            <div>
              <div className="flex items-center gap-1.5 py-1 px-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span>{node.name}</span>
              </div>
              {node.children && renderTreeNodes(node.children, depth + 1)}
            </div>
          ) : (
            <div
              onClick={() => fetchFileContent(selectedProjectId, node.path)}
              className={`flex items-center justify-between py-1 px-2 text-xs rounded-md cursor-pointer transition ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{node.name}</span>
              </div>
              <span className="text-[10px] text-slate-500">{node.size ? `${Math.round(node.size/1024)}K` : ''}</span>
            </div>
          )}
        </div>
      );
    });
  };

  const previewUrl = `${API_BASE}/api/code-server/projects/${selectedProjectId}/preview?t=${previewKey}`;
  const downloadBuildUrl = `${API_BASE}/api/code-server/projects/${selectedProjectId}/download-build`;
  const downloadSourceUrl = `${API_BASE}/api/code-server/projects/${selectedProjectId}/download-source`;

  return (
    <div className="w-full h-full flex flex-col gap-4 text-slate-200">
      {/* Top Header & Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              OCI Cloud IDE & Code Server
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                Web GUI Live
              </span>
            </h1>
            <p className="text-xs text-slate-400">OCI 서버 원격 구동 VS Code Web IDE 및 LLM 앱 빌더 & 파일 다운로드</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleModeChange('vscode')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMode === 'vscode'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            OCI VS Code Web IDE
          </button>

          <button
            onClick={() => handleModeChange('studio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMode === 'studio'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI App Studio & Packager
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: OCI VS Code Web IDE (Full GUI & Direct File Download) */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'vscode' && (
        <div className="flex flex-col gap-3 flex-1">
          {/* Top Quick Actions & Info Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-xl text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <Globe className="w-4 h-4 text-cyan-400" />
                OCI IDE 주소:
              </span>
              <span className="font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                {vscodeUrl}
              </span>
              <span className="text-[11px] text-slate-400 ml-2">
                (기본 암호: <code className="text-amber-300 font-mono">agent1234</code>)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVscodeSettings(!showVscodeSettings)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium border border-slate-700 transition"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                접속 주소 설정
              </button>

              <a
                href={vscodeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-md shadow-cyan-600/30 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                새 창으로 전체화면 열기
              </a>
            </div>
          </div>

          {/* VS Code Settings Drawer */}
          {showVscodeSettings && (
            <div className="bg-slate-900 border border-cyan-500/30 p-4 rounded-xl shadow-xl flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-cyan-400" />
                OCI Code Server 접속 엔드포인트 변경
              </h3>
              <form onSubmit={handleSaveVscodeUrl} className="flex gap-2">
                <input
                  type="text"
                  value={customVscodeInput}
                  onChange={(e) => setCustomVscodeInput(e.target.value)}
                  placeholder="http://<OCI_IP>:8443 또는 ngrok/cloudflare 주소"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
                >
                  저장 & 연결
                </button>
              </form>
            </div>
          )}

          {/* Feature Help Tip Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
              <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-slate-200">파일/폴더 다운로드 방법</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  좌측 파일 탐색기에서 원하는 파일/폴더 우클릭 후 <b>'Download...'</b>를 선택하면 로컬 PC로 즉시 다운로드됩니다.
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
              <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-slate-200">OCI 내장 터미널 & 실행</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  상단 메뉴 <b>Terminal → New Terminal</b>로 OCI 서버 셸을 열어 패키지 설치 및 빌드, 파이썬 스크립트를 즉시 실행할 수 있습니다.
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-slate-200">LLM 코딩 플러그인 확장</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  VS Code Extensions 마켓플레이스에서 <b>Continue, CodeGPT, Cline</b> 등의 AI 어시스턴트를 설치하여 연동할 수 있습니다.
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Full VS Code Web IDE Frame */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[680px] relative">
            <iframe
              src={vscodeUrl}
              title="OCI VS Code Web IDE"
              className="w-full h-full border-0 absolute inset-0"
              allow="clipboard-read; clipboard-write; cross-origin-isolated"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: AI App Studio & Packager (LLM Generator + ZIP Build)  */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'studio' && (
        <div className="flex flex-col gap-4">
          {/* Sub Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 mr-2">프로젝트:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-cyan-300 focus:outline-none cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} ({p.template})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                새 프로젝트
              </button>

              <button
                onClick={() => handleDeleteProject(selectedProjectId)}
                title="현재 프로젝트 삭제"
                className="p-2 bg-slate-800/60 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-xl text-xs border border-slate-700/60 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Downloads */}
            <div className="flex items-center gap-2">
              <a
                href={downloadBuildUrl}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition"
              >
                <Download className="w-3.5 h-3.5" />
                빌드 앱 다운로드 (ZIP)
              </a>

              <a
                href={downloadSourceUrl}
                download
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                소스 전체 다운로드
              </a>
            </div>
          </div>

          {/* Main 3-Column Studio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[580px]">
            {/* Left (Col 3): File Tree & AI Generator */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col flex-1 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Folder className="w-4 h-4 text-cyan-400" />
                    <span>파일 탐색기</span>
                  </div>
                  <button
                    onClick={() => fetchFileTree(selectedProjectId)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 max-h-[240px] pr-1">
                  {fileTree.length > 0 ? (
                    renderTreeNodes(fileTree)
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">파일이 없습니다.</div>
                  )}
                </div>
              </div>

              {/* AI Copilot Prompt Card */}
              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col shadow-lg">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">AI Code Copilot</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="예: 마비노기 경매장 계산기 웹앱 생성해줘 / 다크모드 대시보드 만들기..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />

                  <button
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      isAiGenerating
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAiGenerating ? 'AI 코드 생성 중...' : 'AI 앱 전체 생성하기'}
                  </button>

                  {aiStatusMsg && (
                    <div className="text-[11px] p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 break-words">
                      {aiStatusMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center (Col 5): Code Editor */}
            <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    {selectedFilePath || '선택된 파일 없음'}
                  </span>
                  {isModified && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="수정됨 (저장 필요)" />
                  )}
                  {saveSuccess && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 저장됨
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSaveFile}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-600/30 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  저장 (Ctrl+S)
                </button>
              </div>

              <div className="flex-1 relative bg-slate-950 flex">
                <div className="w-10 py-3 bg-slate-900/50 text-right pr-2 select-none border-r border-slate-800 font-mono text-[11px] text-slate-600 leading-5">
                  {fileContent.split('\n').slice(0, 100).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={fileContent}
                  onChange={(e) => {
                    setFileContent(e.target.value);
                    setIsModified(true);
                  }}
                  spellCheck={false}
                  className="flex-1 bg-transparent p-3 text-xs font-mono text-cyan-100 placeholder-slate-600 focus:outline-none resize-none leading-5 overflow-auto"
                />
              </div>

              <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
                  placeholder={`현재 파일(${selectedFilePath})에 AI 수정 지시어 입력...`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAiEdit}
                  disabled={isAiGenerating || !aiInstruction.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition"
                >
                  적용
                </button>
              </div>
            </div>

            {/* Right (Col 4): Live Preview & Build */}
            <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRightTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      rightTab === 'preview'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Live Preview
                  </button>

                  <button
                    onClick={() => setRightTab('build')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      rightTab === 'build'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    빌드 & 배포
                  </button>
                </div>

                {rightTab === 'preview' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-white"
                      title="새 탭에서 열기"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col p-3 bg-slate-950">
                {rightTab === 'preview' ? (
                  <div className="flex-1 flex items-center justify-center bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800/80">
                    <iframe
                      key={previewKey}
                      src={previewUrl}
                      title="Project Live Preview"
                      className={`h-full border-0 transition-all bg-slate-950 ${
                        previewDevice === 'mobile'
                          ? 'w-[320px] shadow-2xl border-x border-slate-800'
                          : previewDevice === 'tablet'
                          ? 'w-[480px] shadow-2xl border-x border-slate-800'
                          : 'w-full'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                      <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        원클릭 애플리케이션 빌드
                      </h3>
                      <p className="text-[11px] text-slate-400 mb-3">
                        작성된 소스코드를 정적 배포 번들(`dist/`)로 패키징하고 독립 실행 가능한 ZIP 아티팩트를 생성합니다.
                      </p>

                      <button
                        onClick={handleBuildProject}
                        disabled={isBuilding}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                          isBuilding
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/30'
                        }`}
                      >
                        <Play className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
                        {isBuilding ? '빌드 진행 중...' : '프로젝트 빌드 실행 (Build)'}
                      </button>
                    </div>

                    {buildManifest && (
                      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          빌드 성공 아티팩트
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div>파일 수: <span className="font-semibold text-white">{buildManifest.files_count}개</span></div>
                          <div>용량: <span className="font-semibold text-white">{roundKB(buildManifest.total_size_bytes)}</span></div>
                          <div className="col-span-2 text-slate-400">빌드 일시: {buildManifest.build_date}</div>
                        </div>
                        <a
                          href={downloadBuildUrl}
                          download
                          className="mt-1 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/30"
                        >
                          <Download className="w-3.5 h-3.5" />
                          완성된 앱 다운로드 ({selectedProjectId}-build.zip)
                        </a>
                      </div>
                    )}

                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-cyan-300 overflow-y-auto max-h-[220px]">
                      <div className="flex items-center gap-1 text-slate-500 pb-1 mb-2 border-b border-slate-800">
                        <Terminal className="w-3 h-3" />
                        <span>Build Logs</span>
                      </div>
                      {buildLogs.length > 0 ? (
                        buildLogs.map((log, idx) => <div key={idx} className="py-0.5">{log}</div>)
                      ) : (
                        <div className="text-slate-600">빌드를 실행하면 콘솔 로그가 표시됩니다.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              신규 프로젝트 생성
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">프로젝트 ID (영문/숫자/-/_)</label>
                <input
                  type="text"
                  value={newProjId}
                  onChange={(e) => setNewProjId(e.target.value)}
                  placeholder="my-cool-app"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">스타터 템플릿</label>
                <select
                  value={newProjTemplate}
                  onChange={(e) => setNewProjTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/30"
                >
                  생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function roundKB(bytes) {
  if (!bytes) return '0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
}
