import React, { useState, useEffect } from 'react';
import { Search, Database, Key, Plus, Trash2, Tag, ShieldAlert, Sparkles, Filter, RefreshCw, ChevronRight, ExternalLink, Award, User, ShoppingBag, BookOpen, Check, Layers, AlertCircle, FileText, Pin, TrendingUp, X, ArrowRight, ArrowLeft } from 'lucide-react';
import MabiAuctionChart from './MabiAuctionChart';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Official Nexon Mabinogi Auction Categories (73 categories)
const MABI_CATEGORIES = [
  "전체",
  "개조석", "검", "경갑옷", "기타", "기타 소모품", "기타 스크롤", "기타 장비", "기타 재료",
  "꼬리", "날개", "낭만농장/달빛섬", "너클", "던전 통행증", "도끼", "도면", "둔기", "듀얼건",
  "랜스", "로브", "마기그래프", "마기그래프 도안", "마도서", "마리오네트", "마법가루", "마비노벨",
  "마족 스크롤", "말풍선 스티커", "매직 크래프트", "모자/가발", "방패", "변신 메달", "보석", "분양 메달",
  "불타래", "뷰티 쿠폰", "생활 도구", "석궁", "수리검", "스케치", "스태프", "신발", "실린더",
  "아틀라틀", "악기", "알반 훈련석", "액세서리", "양손 장비", "얼굴 장식", "에이도스", "에코스톤",
  "염색 앰플", "오브", "옷본", "원거리 소모품", "원드", "음식", "의자/사물", "인챈트 스크롤", "장갑",
  "제련/블랙스미스", "제스처", "주머니", "중갑옷", "책", "천옷", "천옷/방직", "체인 블레이드", "토템",
  "팔리아스 유물", "퍼퓸", "페이지", "포션", "피니 펫", "핀즈비즈", "한손 장비", "핸들", "허브", "활", "힐웬 공학"
];

export default function MabinogiArchive() {
  const [activeTab, setActiveTab] = useState('live_search'); // 'live_search', 'items', 'characters', 'notes'

  // Nexon Open API Key State
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('mabinogi_api_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  // 1. Live Search States
  const [searchType, setSearchType] = useState('auction'); // 'character' or 'auction'
  const [charSearchInput, setCharSearchInput] = useState('판타지아');
  const [charResult, setCharResult] = useState(null);
  const [charLoading, setCharLoading] = useState(false);

  // Auction Search & Filters
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [auctionSearchInput, setAuctionSearchInput] = useState('');
  const [isKeywordSearch, setIsKeywordSearch] = useState(false);
  const [auctionResults, setAuctionResults] = useState([]);
  const [nextCursor, setNextCursor] = useState('');
  const [auctionLoading, setAuctionLoading] = useState(false);
  const [enchantTypeFilter, setEnchantTypeFilter] = useState('ALL'); // 'ALL', 'PREFIX', 'SUFFIX'

  // Extract RGB / Hex color from item option text
  const extractRgbColor = (opt) => {
    if (!opt) return null;
    const str = typeof opt === 'string' ? opt : `${opt.type || ''} ${opt.label || ''}`;
    
    // Hex Color (e.g. #FF0000 or #3b82f6)
    const hexMatch = str.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
    if (hexMatch) return hexMatch[0];

    // RGB Triplets e.g. 255.0.0 or 255, 0, 0 or (255,0,0) or R:255 G:0 B:0
    const rgbMatch = str.match(/(?:RGB|rgb|색상|파트)?\s*\(?\s*(\d{1,3})[\s,.\/:]{1,2}(\d{1,3})[\s,.\/:]{1,2}(\d{1,3})\s*\)?/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      if (r <= 255 && g <= 255 && b <= 255) {
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return null;
  };

  // Generate dynamic inline style & color dot for option badge
  const getOptionBadgeStyle = (opt) => {
    const rgb = extractRgbColor(opt);
    if (!rgb) return { style: {}, dot: null };

    let rgbaBg = rgb;
    if (rgb.startsWith('rgb(')) {
      rgbaBg = rgb.replace('rgb(', 'rgba(').replace(')', ', 0.3)');
    }

    return {
      style: {
        backgroundColor: rgbaBg,
        borderColor: rgb,
        color: '#ffffff',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
      },
      dot: (
        <span
          style={{
            display: 'inline-block',
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: rgb,
            border: '1px solid #ffffff',
            marginRight: '5px',
            boxShadow: `0 0 6px ${rgb}`,
            verticalAlign: 'middle'
          }}
        />
      )
    };
  };

  // Trade History Modal & Page States
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedTimeBucket, setSelectedTimeBucket] = useState(null);

  // 2. DB Archive States
  const [itemArchives, setItemArchives] = useState([]);
  const [charArchives, setCharArchives] = useState([]);
  const [noteArchives, setNoteArchives] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Reset Modal & Password state
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null); // 'items' | 'enchants'
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetError, setResetError] = useState('');

  // Helper to extract valid price from multiple potential Nexon API keys
  const getItemPrice = (item) => {
    if (!item) return 0;
    const p = item.price ?? item.auction_price_per_unit ?? item.auction_price ?? item.item_buy_price ?? item.auction_buy_price ?? 0;
    return Number(p) || 0;
  };

  // Helper to extract & parse detailed extra options array/objects from Nexon API
  const getItemOptionsList = (item) => {
    if (!item) return [];
    const list = [];

    const isNone = (val) => !val || String(val).trim() === '' || String(val).trim() === 'None' || String(val).trim() === 'null';

    // Check array of option objects from Nexon API
    const rawOpts = item.item_option || item.options_list || item.raw_data?.item_option;
    if (Array.isArray(rawOpts) && rawOpts.length > 0) {
      rawOpts.forEach(o => {
        if (typeof o === 'object' && o !== null) {
          let type = o.option_type || o.type || '옵션';
          const subType = o.option_sub_type || o.sub_type || '';
          const val = o.option_value || o.value || '';
          const val2 = o.option_value2 || '';
          const desc = o.option_desc || o.description || '';

          if (subType === '접두' || subType === '접미') {
            type = subType;
          }

          let parts = [subType, val, val2].filter(v => !isNone(v));
          let label = parts.join(' ');
          if (!isNone(desc)) label += ` (${desc})`;

          if (label && !isNone(label)) {
            list.push({ type, label });
          }
        } else if (typeof o === 'string' && !isNone(o)) {
          list.push({ type: '옵션', label: o.trim() });
        }
      });
    }

    // String fallback if list is empty (e.g. "세공 1랭크 / 속성 6레벨 / S강 7단계")
    if (list.length === 0 && (item.option || item.item_option_json)) {
      const rawStr = String(item.option || item.item_option_json);
      if (!isNone(rawStr)) {
        rawStr.split('/').forEach(s => {
          const trimmed = s.trim();
          if (trimmed && !isNone(trimmed)) {
            let type = '옵션';
            if (trimmed.includes('접두')) type = '접두';
            else if (trimmed.includes('접미')) type = '접미';
            else if (trimmed.includes('세공')) type = '세공';
            else if (trimmed.includes('인챈트')) type = '인챈트';
            else if (trimmed.includes('피어싱')) type = '피어싱';
            else if (trimmed.includes('에르그')) type = '에르그';
            else if (trimmed.includes('강화') || trimmed.includes('개조')) type = '개조';
            list.push({ type, label: trimmed });
          }
        });
      }
    }

    return list;
  };

  // Filter auction results based on enchantTypeFilter ('ALL', 'PREFIX', 'SUFFIX')
  const filteredAuctionResults = React.useMemo(() => {
    if (!auctionResults || auctionResults.length === 0) return [];
    if (enchantTypeFilter === 'ALL') return auctionResults;

    return auctionResults.filter(item => {
      const opts = getItemOptionsList(item);
      const optStr = JSON.stringify(item).toLowerCase();
      if (enchantTypeFilter === 'PREFIX') {
        return opts.some(o => o.type === '접두' || o.label.includes('접두')) || optStr.includes('접두');
      }
      if (enchantTypeFilter === 'SUFFIX') {
        return opts.some(o => o.type === '접미' || o.label.includes('접미')) || optStr.includes('접미');
      }
      return true;
    });
  }, [auctionResults, enchantTypeFilter]);

  // Modals state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Dedicated Enchant Master Archive States
  const [enchantArchives, setEnchantArchives] = useState([]);
  const [enchantArchiveFilter, setEnchantArchiveFilter] = useState('ALL'); // 'ALL', '접두', '접미'
  const [enchantSearchInput, setEnchantSearchInput] = useState('');

  // Selected Archive Item State for Dedicated Detail View
  const [selectedArchiveItem, setSelectedArchiveItem] = useState(null);

  // Form States
  const [newItemForm, setNewItemForm] = useState({
    item_name: '',
    category: '무기',
    subcategory: '',
    tags: '',
    description: '',
    options_json: ''
  });

  const [newNoteForm, setNewNoteForm] = useState({
    title: '',
    category: '공략',
    content: '',
    is_pinned: false,
    tags: ''
  });

  // Save API Key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('mabinogi_api_key', apiKey.trim());
    setShowKeyInput(false);
  };

  // --- Live Search Handlers ---
  const handleSearchCharacter = async () => {
    if (!charSearchInput.trim()) return;
    setCharLoading(true);
    try {
      const headers = { 'ngrok-skip-browser-warning': 'true' };
      if (apiKey) headers['x-nxopen-api-key'] = apiKey;

      const res = await fetch(`${API_BASE}/api/mabinogi/character/search?character_name=${encodeURIComponent(charSearchInput.trim())}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setCharResult(data);
      }
    } catch (err) {
      console.error('Character search error:', err);
    } finally {
      setCharLoading(false);
    }
  };

  const handleSearchAuction = async (appendCursor = '') => {
    setAuctionLoading(true);
    const cursorStr = typeof appendCursor === 'string' ? appendCursor.trim() : '';
    try {
      const headers = { 'ngrok-skip-browser-warning': 'true' };
      if (apiKey) headers['x-nxopen-api-key'] = apiKey;

      let categoryParam = selectedCategory.includes("전체") ? "" : selectedCategory;
      const params = [];
      if (categoryParam) params.push(`auction_item_category=${encodeURIComponent(categoryParam)}`);

      if (isKeywordSearch) {
        if (auctionSearchInput.trim()) params.push(`keyword=${encodeURIComponent(auctionSearchInput.trim())}`);
      } else {
        if (auctionSearchInput.trim()) params.push(`item_name=${encodeURIComponent(auctionSearchInput.trim())}`);
      }

      if (cursorStr) {
        params.push(`cursor=${encodeURIComponent(cursorStr)}`);
      }

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const url = `${API_BASE}/api/mabinogi/auction/search${queryString}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (cursorStr) {
          setAuctionResults(prev => [...prev, ...(data.items || [])]);
        } else {
          setAuctionResults(data.items || []);
        }
        setNextCursor(data.next_cursor || '');

        // Auto-refresh archives DB after live ingestion
        setTimeout(() => {
          fetchItemArchives();
          fetchEnchantArchives();
        }, 600);
      }
    } catch (err) {
      console.error('Auction search error:', err);
    } finally {
      setAuctionLoading(false);
    }
  };

  const isSameMabiItem = (target, item) => {
    if (!target || !item) return false;
    const tClean = target.trim().toLowerCase();
    const iClean = item.trim().toLowerCase();
    if (tClean === iClean) return true;
    if (tClean.includes('(') && tClean.includes(')')) {
      return tClean === iClean;
    }
    const tBase = tClean.replace(/\s*\([^)]*\)/g, '').trim();
    const iBase = iClean.replace(/\s*\([^)]*\)/g, '').trim();
    return tBase === iBase || (tBase.length >= 3 && iClean.includes(tBase));
  };

  // Item Click -> Open Trade History Page View & Fetch History Data
  const handleItemClickForHistory = async (item) => {
    setSelectedItemHistory(item);
    setSelectedTimeBucket(null);
    setHistoryLoading(true);
    setHistoryData([]);

    try {
      const headers = { 'ngrok-skip-browser-warning': 'true' };
      if (apiKey) headers['x-nxopen-api-key'] = apiKey;

      let categoryParam = item.category || (selectedCategory.includes("전체") ? "" : selectedCategory);
      const params = [];
      if (item.item_name) params.push(`item_name=${encodeURIComponent(item.item_name.trim())}`);
      if (categoryParam) params.push(`auction_item_category=${encodeURIComponent(categoryParam.trim())}`);

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const url = `${API_BASE}/api/mabinogi/auction/history${queryString}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const rawHistory = data.history || [];
        const targetName = item.item_name.trim();
        const filteredHistory = rawHistory.filter(h => {
          if (!h || !h.item_name) return false;
          return isSameMabiItem(targetName, h.item_name);
        });
        setHistoryData(filteredHistory);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter trade history by clicked chart time bucket
  const filteredHistoryData = React.useMemo(() => {
    if (!selectedTimeBucket || !historyData || historyData.length === 0) return historyData;
    return historyData.filter(h => {
      const dateObj = new Date(h.date_auction_buy || h.recorded_at);
      if (isNaN(dateObj.getTime())) return false;
      const scale = selectedTimeBucket.timeScale || 'month';
      let key = '';
      if (scale === 'year') {
        key = `${dateObj.getFullYear()}년`;
      } else if (scale === 'month') {
        key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      } else if (scale === 'day') {
        key = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      } else if (scale === 'hour') {
        key = `${String(dateObj.getDate()).padStart(2, '0')}일 ${String(dateObj.getHours()).padStart(2, '0')}:00`;
      }
      return key === selectedTimeBucket.label;
    });
  }, [historyData, selectedTimeBucket]);

  const handleSaveAuctionItemToDB = async (item) => {
    if (!item) return;
    try {
      const priceVal = getItemPrice(item);
      const payload = {
        item_name: item.item_name,
        category: item.category || (selectedCategory.includes("전체") ? "무기" : selectedCategory),
        price_estimate: `${priceVal.toLocaleString()} 골드`,
        description: `경매장 수집 - 판매자: ${item.seller || '익명'}, 옵션: ${item.option || '기본'}`,
        tags: `${item.category || '경매장'}, 실시간시세`
      };

      const res = await fetch(`${API_BASE}/api/mabinogi/archives/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(`[${item.item_name}] 아이템이 내 DB 아카이브에 수집 저장되었습니다!`);
        fetchItemArchives();
      }
    } catch (err) {
      console.error('Failed to save item to DB archive:', err);
    }
  };

  // --- Fetch DB Archives ---
  const fetchItemArchives = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/items`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setItemArchives(data);
      }
    } catch (err) {
      console.log('Using local fallback for items');
    }
  };

  const fetchEnchantArchives = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/enchants`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setEnchantArchives(data || []);
      }
    } catch (err) {
      console.log('Using local fallback for enchants');
    }
  };

  const fetchCharArchives = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/characters`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setCharArchives(data);
      }
    } catch (err) {
      console.log('Using local fallback for characters');
    }
  };

  const fetchNoteArchives = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/notes`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setNoteArchives(data);
      }
    } catch (err) {
      console.log('Using local fallback for notes');
    }
  };

  useEffect(() => {
    fetchItemArchives();
    fetchEnchantArchives();
    fetchCharArchives();
    fetchNoteArchives();
    handleSearchAuction();
  }, []);

  // --- Action Handlers ---
  const handleSaveCharToDB = async (charData) => {
    try {
      const payload = {
        character_name: charData.character_name,
        server_name: charData.server_name || '류트',
        race: charData.race || '인간',
        cumulative_level: charData.cumulative_level || 0,
        stats_json: JSON.stringify(charData.stats || {}),
        equipment_json: JSON.stringify(charData.equipment || []),
        memo: charData.memo || '실시간 검색에서 등록된 아카이브 스냅샷'
      };

      const res = await fetch(`${API_BASE}/api/mabinogi/archives/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('캐릭터 아카이브에 성공적으로 저장되었습니다!');
        fetchCharArchives();
      }
    } catch (err) {
      alert('아카이브 저장 실패: ' + err.message);
    }
  };

  const handleCreateItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItemForm.item_name.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemForm)
      });
      if (res.ok) {
        setShowAddItemModal(false);
        setNewItemForm({ item_name: '', category: '무기', subcategory: '', price_estimate: '', tags: '', description: '', options_json: '' });
        fetchItemArchives();
      }
    } catch (err) {
      alert('아이템 등록 실패: ' + err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/items/${id}`, { method: 'DELETE' });
      if (res.ok) fetchItemArchives();
    } catch (err) {
      console.error(err);
    }
  };

  const openItemResetModal = () => {
    setResetTarget('items');
    setResetPasswordInput('');
    setResetError('');
    setShowResetPasswordModal(true);
  };

  const openEnchantResetModal = () => {
    setResetTarget('enchants');
    setResetPasswordInput('');
    setResetError('');
    setShowResetPasswordModal(true);
  };

  const handleConfirmReset = async (e) => {
    if (e) e.preventDefault();
    if (resetPasswordInput !== 'Yuha69') {
      setResetError('비밀번호가 올바르지 않습니다.');
      return;
    }
    setResetError('');

    try {
      const endpoint = resetTarget === 'items'
        ? `${API_BASE}/api/mabinogi/archives/items/all?password=${encodeURIComponent(resetPasswordInput)}`
        : `${API_BASE}/api/mabinogi/archives/enchants/all?password=${encodeURIComponent(resetPasswordInput)}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        const targetLabel = resetTarget === 'items' ? '아이템 아카이브' : '인챈트 도감';
        alert(`✅ ${targetLabel} DB 데이터 전체 초기화가 완료되었습니다. (${data.deleted_count}건 삭제)`);
        if (resetTarget === 'items') {
          fetchItemArchives();
        } else {
          fetchEnchantArchives();
        }
        setShowResetPasswordModal(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        setResetError(errData.detail || '초기화 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setResetError('초기화 실패: ' + err.message);
    }
  };

  const handleCreateNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNoteForm.title.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNoteForm)
      });
      if (res.ok) {
        setShowAddNoteModal(false);
        setNewNoteForm({ title: '', category: '공략', content: '', is_pinned: false, tags: '' });
        fetchNoteArchives();
      }
    } catch (err) {
      alert('노트 등록 실패: ' + err.message);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('노트를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/notes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchNoteArchives();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = categoryFilter === 'ALL'
    ? itemArchives
    : itemArchives.filter(i => i.category === categoryFilter);

  if (selectedItemHistory) {
    return (
      <div className="mabi-archive-container">
        <div className="item-detail-page-view">
          <div className="detail-page-header">
            <button className="back-to-list-btn" onClick={() => setSelectedItemHistory(null)}>
              <ArrowLeft size={18} />
              <span>경매장 검색 목록으로 돌아가기</span>
            </button>
            <div className="detail-page-title-group">
              <span className="category-badge">{selectedItemHistory.category || selectedCategory}</span>
              <h2>[{selectedItemHistory.item_name}] 상세 시세 분석 & 실시간 체결 기록</h2>
            </div>
          </div>

          {historyLoading ? (
            <div className="history-loading-box">
              <RefreshCw size={32} className="spin" />
              <p>[{selectedItemHistory.item_name}] 동일 명칭 실시간 거래 히스토리를 불러오는 중입니다...</p>
            </div>
          ) : (
            <div className="detail-page-content-stack">
              {/* TOP ITEM CARD & EXTRA OPTIONS BREAKDOWN */}
              <div className="detail-page-card item-summary-hero-card">
                <div className="detail-top-card">
                  <div className="detail-header-info">
                    <span className="category-badge">{selectedItemHistory.category || selectedCategory}</span>
                    <h3>{selectedItemHistory.item_name}</h3>
                    <div className="detail-price-hero">
                      <span className="lbl">현재 등록 / 단가:</span>
                      <span className="val">{getItemPrice(selectedItemHistory).toLocaleString()} 골드</span>
                    </div>
                  </div>
                  <button
                    className="archive-save-btn highlight-btn"
                    onClick={() => handleSaveAuctionItemToDB(selectedItemHistory)}
                  >
                    <Database size={16} />
                    <span>내 DB 아카이브에 수집 저장</span>
                  </button>
                </div>

                <div className="detail-metrics-grid">
                  <div className="metric-card">
                    <span className="k">평균 거래가 (동일 명칭)</span>
                    <span className="v purple">
                      {Math.round(
                        historyData.reduce((a, b) => a + getItemPrice(b), 0) / (historyData.length || 1)
                      ).toLocaleString()} 골드
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="k">최저 거래가</span>
                    <span className="v blue">
                      {(historyData.length > 0
                        ? Math.min(...historyData.map(getItemPrice))
                        : getItemPrice(selectedItemHistory)
                      ).toLocaleString()} 골드
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="k">최고 거래가</span>
                    <span className="v green">
                      {(historyData.length > 0
                        ? Math.max(...historyData.map(getItemPrice))
                        : getItemPrice(selectedItemHistory)
                      ).toLocaleString()} 골드
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="k">등록 매물 수량</span>
                    <span className="v">{selectedItemHistory.item_count || 1} 개</span>
                  </div>
                </div>

                {/* EXTRA OPTIONS & REFORGE / ENCHANT BADGES LIST */}
                <div className="detail-section-box">
                  <h4>아이템 세부 세공 / 인챈트 / 추가 옵션 정보</h4>
                  {getItemOptionsList(selectedItemHistory).length > 0 ? (
                    <div className="option-badges-grid">
                      {getItemOptionsList(selectedItemHistory).map((opt, i) => {
                        const { style, dot } = getOptionBadgeStyle(opt);
                        return (
                          <div className="option-badge-item" key={i} style={style}>
                            {dot}
                            <span className={`opt-type-tag ${opt.type}`}>{opt.type}</span>
                            <span className="opt-label-text">{opt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="option-breakdown-card">
                      <p className="opt-text">
                        {selectedItemHistory.option || selectedItemHistory.item_option_json || '등록된 세부 옵션 정보가 없습니다.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="detail-meta-grid">
                  <div className="meta-item">
                    <span className="lbl">판매 등록자:</span>
                    <span className="val">{selectedItemHistory.seller || '경매장 등록 유저'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">등록 / 조회 일시:</span>
                    <span className="val">{selectedItemHistory.recorded_at || selectedItemHistory.expire_date || '실시간 시세 조회'}</span>
                  </div>
                </div>
              </div>

              {/* DUAL AXIS PRICE & VOLUME CHART FOR EXACT ITEM */}
              <div className="detail-page-card chart-card-block">
                <h4>[{selectedItemHistory.item_name}] 동일 아이템 거래 시세 추이 차트</h4>
                <MabiAuctionChart
                  itemName={selectedItemHistory.item_name}
                  historyData={historyData}
                  selectedBucket={selectedTimeBucket}
                  onSelectBucket={setSelectedTimeBucket}
                />
              </div>

              {/* RECENT TRADE TRANSACTIONS TABLE */}
              <div className="detail-page-card history-table-card-block">
                <div className="table-header-flex">
                  <h4>[{selectedItemHistory.item_name}] 거래 내역 ({filteredHistoryData.length}건)</h4>
                  {selectedTimeBucket && (
                    <button className="reset-filter-btn" onClick={() => setSelectedTimeBucket(null)}>
                      <X size={14} />
                      <span>전체 시간대 거래 내역 보기</span>
                    </button>
                  )}
                </div>

                {selectedTimeBucket && (
                  <div className="active-time-filter-badge">
                    <Filter size={14} />
                    <span>선택 시간대 필터링 중: <strong>{selectedTimeBucket.label}</strong> ({filteredHistoryData.length}건 표시)</span>
                  </div>
                )}

                <div className="history-table-wrapper">
                  <table className="mabi-table compact">
                    <thead>
                      <tr>
                        <th>거래 일시</th>
                        <th>거래 가격</th>
                        <th>수량</th>
                        <th>판매자</th>
                        <th>세공/인챈트 옵션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryData.length > 0 ? (
                        filteredHistoryData.map((h, idx) => (
                          <tr key={idx}>
                            <td className="date-cell">{h.date_auction_buy || h.recorded_at}</td>
                            <td className="price-text font-bold">{getItemPrice(h).toLocaleString()} 골드</td>
                            <td>{h.item_count || 1}개</td>
                            <td>{h.seller || '익명'}</td>
                            <td className="option-text">
                              {getItemOptionsList(h).length > 0 ? (
                                <div className="table-option-badges">
                                  {getItemOptionsList(h).map((opt, i) => {
                                    const { style, dot } = getOptionBadgeStyle(opt);
                                    return (
                                      <span className={`opt-type-tag ${opt.type}`} key={i} style={style}>
                                        {dot}[{opt.type}] {opt.label}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                h.option && h.option !== 'None' && h.option !== 'null' ? h.option : '-'
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="empty-row">
                            선택한 시간대({selectedTimeBucket?.label})의 거래 내역이 존재하지 않습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mabi-archive-container">
      {/* Top Header Bar */}
      <div className="mabi-header">
        <div className="mabi-title-group">
          <div className="mabi-logo">🗡️</div>
          <div>
            <h2>마비노기 아카이브 <span className="mabi-subtext">& 실시간 데이터 조회</span></h2>
            <p className="mabi-desc">Nexon Open API 실시간 경매장/캐릭터 검색 및 마비노기 DB 시스템</p>
          </div>
        </div>

        <div className="mabi-api-status-bar">
          <div className={`api-mode-badge ${apiKey ? 'live' : 'mock'}`}>
            <Sparkles size={14} />
            <span>{apiKey ? 'API Key 연동 중 (Live)' : '샘플 데이터 모드 (Mock)'}</span>
          </div>
          <button className="api-key-btn" onClick={() => setShowKeyInput(!showKeyInput)}>
            <Key size={14} />
            <span>API Key 설정</span>
          </button>
        </div>
      </div>

      {/* API Key Modal / Form */}
      {showKeyInput && (
        <div className="api-key-modal-overlay" onClick={() => setShowKeyInput(false)}>
          <div className="api-key-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Key size={20} />
              <h3>Nexon Open API Key 설정</h3>
            </div>
            <form onSubmit={handleSaveApiKey}>
              <p className="modal-info">
                넥슨 개발자 센터 (NEXON Open API Center)에서 발급받은 Mabinogi API Key를 입력하세요.
                미입력 시 샘플 데이터로 동작합니다.
              </p>
              <input
                type="password"
                className="api-key-input"
                placeholder="test_... 또는 live_..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowKeyInput(false)}>취소</button>
                <button type="submit" className="save-btn">저장 및 연동</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Primary Sub-Tabs */}
      <div className="mabi-tabs">
        <button className={`mabi-tab ${activeTab === 'live_search' ? 'active' : ''}`} onClick={() => setActiveTab('live_search')}>
          <Search size={16} />
          <span>실시간 API 조회</span>
        </button>
        <button className={`mabi-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
          <Layers size={16} />
          <span>아이템/장비 아카이브 ({itemArchives.length})</span>
        </button>
        <button className={`mabi-tab ${activeTab === 'enchants' ? 'active' : ''}`} onClick={() => setActiveTab('enchants')}>
          <Sparkles size={16} />
          <span>인챈트 도감 ({enchantArchives.length})</span>
        </button>
        <button className={`mabi-tab ${activeTab === 'characters' ? 'active' : ''}`} onClick={() => setActiveTab('characters')}>
          <User size={16} />
          <span>캐릭터 스냅샷 ({charArchives.length})</span>
        </button>
        <button className={`mabi-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
          <FileText size={16} />
          <span>아카이브 노트 ({noteArchives.length})</span>
        </button>
      </div>

      {/* TAB 1: 실시간 API 조회 */}
      {activeTab === 'live_search' && (
        <div className="tab-content live-search-tab">
          <div className="search-type-selector">
            <button className={`type-btn ${searchType === 'auction' ? 'active' : ''}`} onClick={() => setSearchType('auction')}>
              <ShoppingBag size={16} />
              <span>경매장 실시간 시세 & 거래 내역</span>
            </button>
            <button className={`type-btn ${searchType === 'character' ? 'active' : ''}`} onClick={() => setSearchType('character')}>
              <User size={16} />
              <span>캐릭터 정보 검색</span>
            </button>
          </div>

          {searchType === 'auction' && (
            <div className="search-section">
              {/* Category & Search Filter Bar */}
              <div className="auction-filter-bar">
                <div className="filter-item category-select-box">
                  <label>카테고리 (73종)</label>
                  <select
                    className="mabi-select"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    {MABI_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item search-mode-toggle">
                  <label>검색 방식</label>
                  <div className="mode-toggle-group">
                    <button
                      className={`mode-btn ${!isKeywordSearch ? 'active' : ''}`}
                      onClick={() => setIsKeywordSearch(false)}
                    >
                      아이템명 검색
                    </button>
                    <button
                      className={`mode-btn ${isKeywordSearch ? 'active' : ''}`}
                      onClick={() => setIsKeywordSearch(true)}
                    >
                      키워드 검색
                    </button>
                  </div>
                </div>

                <div className="filter-item search-input-wrapper">
                  <label>{isKeywordSearch ? '검색 키워드 (쉼표 구분)' : '아이템 명칭'}</label>
                  <div className="search-input-box">
                    <input
                      type="text"
                      placeholder={isKeywordSearch ? "예: 숏,소드 (단어 쉼표 구분)" : "검색할 장비/아이템 명칭 (예: 페러시우스)"}
                      value={auctionSearchInput}
                      onChange={e => setAuctionSearchInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearchAuction()}
                    />
                    <button className="search-submit-btn" onClick={() => handleSearchAuction()} disabled={auctionLoading}>
                      {auctionLoading ? <RefreshCw size={16} className="spin" /> : <Search size={16} />}
                      <span>조회하기</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ENCHANT TYPE CLASSIFICATION FILTER BAR (Displayed for Enchant category) */}
              {(selectedCategory.includes("인챈트") || auctionResults.some(i => (i.category || '').includes("인챈트") || (i.item_name || '').includes("인챈트"))) && (
                <div className="enchant-type-filter-bar">
                  <span className="filter-lbl"><Sparkles size={14} /> 인챈트 종류 분류:</span>
                  <div className="enchant-type-toggle-group">
                    <button
                      className={`enchant-type-btn ${enchantTypeFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setEnchantTypeFilter('ALL')}
                    >
                      전체 인챈트
                    </button>
                    <button
                      className={`enchant-type-btn prefix ${enchantTypeFilter === 'PREFIX' ? 'active' : ''}`}
                      onClick={() => setEnchantTypeFilter('PREFIX')}
                    >
                      ✨ 접두 (Prefix)
                    </button>
                    <button
                      className={`enchant-type-btn suffix ${enchantTypeFilter === 'SUFFIX' ? 'active' : ''}`}
                      onClick={() => setEnchantTypeFilter('SUFFIX')}
                    >
                      🔮 접미 (Suffix)
                    </button>
                  </div>
                </div>
              )}

              {/* Auction Results Table */}
              <div className="auction-results-header">
                <span className="results-count">조회 결과: {filteredAuctionResults.length}개 매물 (아이템 클릭 시 거래 내역 차트 확인)</span>
              </div>

              <div className="auction-results-table-wrapper">
                <table className="mabi-table clickable-rows">
                  <thead>
                    <tr>
                      <th>아이템명</th>
                      <th>카테고리</th>
                      <th>판매 금액</th>
                      <th>수량</th>
                      <th>세공 / 옵션 상세</th>
                      <th>판매자</th>
                      <th>상세 보기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuctionResults.length > 0 ? (
                      filteredAuctionResults.map((item, idx) => (
                        <tr key={idx} className="clickable-row" onClick={() => handleItemClickForHistory(item)}>
                          <td className="font-bold item-name-cell">
                            <span className="item-title">{item.item_display_name || item.item_name}</span>
                          </td>
                          <td><span className="category-badge">{item.category || selectedCategory}</span></td>
                          <td className="price-text">{getItemPrice(item).toLocaleString()} 골드</td>
                          <td>{item.item_count || 1}개</td>
                          <td className="option-text">
                            {getItemOptionsList(item).length > 0 ? (
                              <div className="table-option-badges">
                                {getItemOptionsList(item).map((opt, i) => {
                                  const { style, dot } = getOptionBadgeStyle(opt);
                                  return (
                                    <span className={`opt-type-tag ${opt.type}`} key={i} style={style}>
                                      {dot}[{opt.type}] {opt.label}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              item.option && item.option !== 'None' && item.option !== 'null' ? item.option : '-'
                            )}
                          </td>
                          <td className="seller-text">{item.seller || '익명'}</td>
                          <td>
                            <button className="view-history-btn">
                              <TrendingUp size={14} />
                              <span>거래 내역 차트</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="empty-row">
                          {auctionLoading ? '경매장 매물을 검색 중입니다...' : '검색 조건 설정 후 조회하기 버튼을 누르세요.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cursor Pagination Load More */}
              {nextCursor && (
                <div className="pagination-container">
                  <button className="load-more-btn" onClick={() => handleSearchAuction(nextCursor)} disabled={auctionLoading}>
                    <RefreshCw size={16} className={auctionLoading ? 'spin' : ''} />
                    <span>다음 500개 매물 리스트 조회 (Cursor)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {searchType === 'character' && (
            <div className="search-section">
              <div className="search-input-box">
                <input
                  type="text"
                  placeholder="캐릭터 명을 입력하세요 (예: 판타지아)"
                  value={charSearchInput}
                  onChange={e => setCharSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchCharacter()}
                />
                <button className="search-submit-btn" onClick={handleSearchCharacter} disabled={charLoading}>
                  {charLoading ? <RefreshCw size={16} className="spin" /> : <Search size={16} />}
                  <span>조회하기</span>
                </button>
              </div>

              {charResult && (
                <div className="char-result-card">
                  <div className="char-card-header">
                    <div className="char-main-info">
                      <h3>{charResult.character_name}</h3>
                      <span className="server-badge">{charResult.server_name || '류트'} 서버</span>
                      <span className="race-badge">{charResult.race || '인간'}</span>
                      {charResult.is_live_api ? (
                        <span className="live-api-tag">Live Nexon API</span>
                      ) : (
                        <span className="mock-api-tag">Sample Data</span>
                      )}
                    </div>
                    <button className="archive-save-btn" onClick={() => handleSaveCharToDB(charResult)}>
                      <Database size={14} />
                      <span>DB 아카이브에 저장</span>
                    </button>
                  </div>

                  <div className="char-stats-grid">
                    <div className="char-stat-box">
                      <span className="label">누적 레벨</span>
                      <span className="val highlight">{charResult.cumulative_level?.toLocaleString() || 45820}</span>
                    </div>
                    <div className="char-stat-box">
                      <span className="label">대표 칭호</span>
                      <span className="val">{charResult.title_name || '판타지스타'}</span>
                    </div>
                    <div className="char-stat-box">
                      <span className="label">소속 길드</span>
                      <span className="val">{charResult.guild_name || '아카이브'}</span>
                    </div>
                  </div>

                  {charResult.stats && (
                    <div className="char-sub-section">
                      <h4>주요 능력치 스탯</h4>
                      <div className="stats-pills-container">
                        {Object.entries(charResult.stats).map(([key, val]) => (
                          <div className="stat-pill" key={key}>
                            <span className="k">{key}</span>
                            <span className="v">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {charResult.equipment && (
                    <div className="char-sub-section">
                      <h4>착용 세팅 및 장비</h4>
                      <div className="equip-list">
                        {charResult.equipment.map((eq, idx) => (
                          <div className="equip-item" key={idx}>
                            <span className="slot-badge">{eq.slot}</span>
                            <div className="equip-details">
                              <span className="name">{eq.name}</span>
                              <span className="opt">{eq.option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 아이템/장비 아카이브 */}
      {activeTab === 'items' && (
        <div className="tab-content items-tab">
          {selectedArchiveItem ? (
            /* ARCHIVE ITEM DETAIL PAGE VIEW */
            <div className="item-detail-page-view archive-detail-page-view">
              <button 
                className="back-to-list-btn"
                onClick={() => setSelectedArchiveItem(null)}
              >
                <ArrowLeft size={18} />
                <span>← 아이템 아카이브 목록으로 돌아가기</span>
              </button>

              <div className="detail-hero-header">
                <div className="item-title-section">
                  <div className="category-tag-row">
                    <span className="category-pill main-cat">{selectedArchiveItem.category || '장비'}</span>
                    <span className="info-badge">정보성 지식 DB</span>
                  </div>
                  <h1 className="item-main-title">{selectedArchiveItem.item_display_name || selectedArchiveItem.item_name}</h1>
                </div>

                <div className="hero-actions">
                  <button className="delete-btn" onClick={() => {
                    handleDeleteItem(selectedArchiveItem.id);
                    setSelectedArchiveItem(null);
                  }}>
                    <Trash2 size={16} />
                    <span>아카이브에서 삭제</span>
                  </button>
                </div>
              </div>

              <div className="detail-grid-layout">
                {/* LEFT MAIN PANEL */}
                <div className="detail-main-panel">
                  {/* 1. 기본 설명 & 태그 */}
                  <div className="detail-card-box">
                    <h3><Info size={18} /> 아이템 기본 정보</h3>
                    <p className="item-description-text">
                      {selectedArchiveItem.description || '등록된 상세 설명 정보가 없습니다.'}
                    </p>
                    {selectedArchiveItem.tags && (
                      <div className="tags-container" style={{ marginTop: '12px' }}>
                        {selectedArchiveItem.tags.split(',').map((t, i) => (
                          <span className="tag-badge" key={i}>#{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. 그룹별 옵션 유동 수치 범위 (Min~Max Ranges) */}
                  <div className="detail-card-box">
                    <h3><Zap size={18} /> 그룹별 옵션 유동 수치 범위 (Min~Max Range)</h3>
                    {selectedArchiveItem.grouped_options_json ? (
                      (() => {
                        try {
                          const grp = JSON.parse(selectedArchiveItem.grouped_options_json);
                          const grpNames = {
                            base_stats: '📊 기본 능력치 수치 범위',
                            reforge: '⚡ 세공 옵션 레벨 범위',
                            modification: '🛠️ 개조 및 강화 단계',
                            erg: '🔥 에르그 단계/효과',
                            set_effects: '✨ 세트 효과 포인트',
                            enchant: '🔮 부여된 인챈트'
                          };

                          const hasItems = Object.values(grp).some(dict => dict && Object.keys(dict).length > 0);
                          if (!hasItems) {
                            return <p className="empty-text font-medium">수집된 그룹별 수치 범위 데이터가 없습니다.</p>;
                          }

                          return (
                            <div className="grouped-options-sections-container">
                              {Object.entries(grp).map(([catKey, itemsDict]) => {
                                const entries = Object.entries(itemsDict || {});
                                if (entries.length === 0) return null;

                                return (
                                  <div className="option-category-group" key={catKey}>
                                    <h4 className="group-title">{grpNames[catKey] || catKey}</h4>
                                    <div className="group-items-list">
                                      {entries.map(([optName, optInfo], idx) => (
                                        <div className="option-range-card" key={idx}>
                                          <div className="opt-header">
                                            <span className="opt-name font-bold">{optName}</span>
                                            <span className="opt-range-badge">
                                              {optInfo.min === optInfo.max || optInfo.min === null
                                                ? `${optInfo.max ?? optInfo.raw_val} ${optInfo.unit || ''}`
                                                : `${optInfo.min} ~ ${optInfo.max} ${optInfo.unit || ''}`}
                                            </span>
                                          </div>
                                          {optInfo.min !== null && optInfo.max !== null && (
                                            <div className="gauge-track">
                                              <div className="gauge-fill" style={{ width: '100%' }} />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        } catch (e) {
                          return <p className="empty-text">그룹별 데이터를 파싱할 수 없습니다.</p>;
                        }
                      })()
                    ) : (
                      selectedArchiveItem.options_json ? (
                        <div className="options-formatted-box">
                          {selectedArchiveItem.options_json.split(' / ').map((optLine, i) => (
                            <div className="option-line-item" key={i}>
                              <span className="bullet">•</span>
                              <span className="line-text">{optLine}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-text font-medium">수집된 부가 옵션 데이터가 없습니다.</p>
                      )
                    )}
                  </div>

                  {/* 3. 세트 효과 (Set Effects) */}
                  <div className="detail-card-box">
                    <h3><Sparkles size={18} /> 발동 세트 효과 (Set Effects)</h3>
                    {selectedArchiveItem.set_effects_json ? (
                      <div className="set-effects-list-box">
                        {(() => {
                          try {
                            const setArr = JSON.parse(selectedArchiveItem.set_effects_json);
                            if (Array.isArray(setArr) && setArr.length > 0) {
                              return setArr.map((se, idx) => (
                                <div className="set-effect-row-card" key={idx}>
                                  <span className="effect-icon">✨</span>
                                  <span className="effect-name">{se.name}</span>
                                  <span className="effect-val">{se.value}</span>
                                </div>
                              ));
                            }
                          } catch (e) {}
                          return <p className="empty-text">수집된 세트 효과가 없습니다.</p>;
                        })()}
                      </div>
                    ) : (
                      <p className="empty-text">수집된 세트 효과가 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE PANEL: ENCHANTS KNOWLEDGE LINK */}
                <div className="detail-side-panel">
                  <div className="detail-card-box enchant-extract-box">
                    <h3><Sparkles size={18} /> 장비 인챈트 도감 연동</h3>
                    <p className="enchant-info-desc">
                      이 아이템 장비 옵션에 포함된 접두/접미 인챈트는 <strong>'인챈트 도감'</strong>에 분리 저장되어 최소~최대 유동 옵션 수치가 자동으로 트래킹됩니다.
                    </p>

                    {(() => {
                      const optText = selectedArchiveItem.options_json || '';
                      const foundEnchants = [];
                      const matches = optText.match(/(?:접두|접미)\s+([가-힣a-zA-Z0-9]+)/g);
                      if (matches) {
                        matches.forEach(m => {
                          const cleanName = m.replace(/(?:접두|접미)/, '').trim();
                          if (cleanName && !foundEnchants.includes(cleanName)) {
                            foundEnchants.push(cleanName);
                          }
                        });
                      }

                      return (
                        <div className="enchant-links-container">
                          {foundEnchants.length > 0 ? (
                            foundEnchants.map((eName, idx) => (
                              <button
                                key={idx}
                                className="enchant-jump-btn"
                                onClick={() => {
                                  setSelectedArchiveItem(null);
                                  setActiveTab('enchants');
                                  setEnchantSearchInput(eName);
                                }}
                              >
                                <span>🔮 인챈트 도감에서 '{eName}' 수치 범위 확인하기</span>
                                <ArrowRight size={14} />
                              </button>
                            ))
                          ) : (
                            <button
                              className="enchant-jump-btn"
                              onClick={() => {
                                setSelectedArchiveItem(null);
                                setActiveTab('enchants');
                              }}
                            >
                              <span>🔮 전체 인챈트 도감 보러가기</span>
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ARCHIVE CARDS GRID VIEW */
            <>
              <div className="tab-toolbar">
                <div className="filter-group">
                  <Filter size={16} />
                  <select
                    className="mabi-select category-filter-select"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">전체 아이템 분류 보기</option>
                    {MABI_CATEGORIES.filter(c => c !== "전체").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button className="create-archive-btn" onClick={() => setShowAddItemModal(true)}>
                  <Plus size={16} />
                  <span>새 아이템 아카이브 수집</span>
                </button>

                <button className="reset-archive-btn" onClick={openItemResetModal}>
                  <Trash2 size={16} />
                  <span>아이템 초기화</span>
                </button>
              </div>

              <div className="archive-cards-grid">
                {filteredItems.map(item => (
                  <div
                    className="archive-item-card clickable-archive-card"
                    key={item.id}
                    onClick={() => setSelectedArchiveItem(item)}
                  >
                    <div className="card-top">
                      <span className="category-pill">{item.category || '장비'}</span>
                      <button 
                        className="delete-mini-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h4>{item.item_display_name || item.item_name}</h4>
                    <p className="desc">{item.description || '클릭하여 상세 옵션 및 세트 효과 보기'}</p>
                    
                    {/* Options List Display */}
                    {item.options_json && (
                      <div className="archive-options-text">
                        <span className="opt-lbl">옵션/세공:</span> {item.options_json}
                      </div>
                    )}

                    {/* Set Effects Display */}
                    {item.set_effects_json && (
                      <div className="set-effects-container">
                        {(() => {
                          try {
                            const setArr = JSON.parse(item.set_effects_json);
                            if (Array.isArray(setArr) && setArr.length > 0) {
                              return setArr.map((se, idx) => (
                                <span className="set-effect-badge" key={idx}>
                                  ✨ 세트: {se.name} {se.value}
                                </span>
                              ));
                            }
                          } catch (e) {}
                          return null;
                        })()}
                      </div>
                    )}

                    {item.tags && (
                      <div className="tags-container">
                        {item.tags.split(',').map((t, i) => (
                          <span className="tag-badge" key={i}>#{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="empty-archive-box">
                    <Database size={32} />
                    <p>등록된 아이템 아카이브가 없습니다. 실시간 API 검색을 통해 카테고리별 아이템 정보를 자동으로 등록할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: 캐릭터 아카이브 */}
      {activeTab === 'characters' && (
        <div className="tab-content characters-tab">
          <div className="tab-toolbar">
            <span className="sub-info-text">저장된 캐릭터 스냅샷 및 메모 관리</span>
          </div>

          <div className="char-snapshots-grid">
            {charArchives.map(char => (
              <div className="char-snapshot-card" key={char.id}>
                <div className="snapshot-header">
                  <div className="char-title">
                    <h3>{char.character_name}</h3>
                    <span className="server">{char.server_name} ({char.race})</span>
                  </div>
                  <span className="level-badge">Lv. {char.cumulative_level?.toLocaleString()}</span>
                </div>

                <div className="snapshot-body">
                  <p className="memo-text">{char.memo || '작성된 메모가 없습니다.'}</p>
                  <span className="date-text">저장 일시: {new Date(char.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {charArchives.length === 0 && (
              <div className="empty-archive-box">
                <User size={32} />
                <p>저장된 캐릭터 아카이브가 없습니다. '실시간 API 조회' 탭에서 검색 후 저장하실 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 인챈트 도감 (Dedicated Enchant Master Knowledge Base) */}
      {activeTab === 'enchants' && (
        <div className="tab-content enchants-tab">
          <div className="archive-section-header">
            <div>
              <h3>🔮 마비노기 인챈트 도감 (마스터 DB)</h3>
              <p className="sub">경매장 검색 시 자동 수집되는 접두/접미 인챈트별 유동 옵션 최소~최대 수치 범위 정보</p>
            </div>
            <button className="reset-archive-btn" onClick={openEnchantResetModal}>
              <Trash2 size={16} />
              <span>인챈트 초기화</span>
            </button>
          </div>

          <div className="enchant-archive-filter-bar">
            <div className="enchant-type-toggle-group">
              <button
                className={`enchant-type-btn ${enchantArchiveFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setEnchantArchiveFilter('ALL')}
              >
                전체 인챈트
              </button>
              <button
                className={`enchant-type-btn prefix ${enchantArchiveFilter === '접두' ? 'active' : ''}`}
                onClick={() => setEnchantArchiveFilter('접두')}
              >
                ✨ 접두 (Prefix)
              </button>
              <button
                className={`enchant-type-btn suffix ${enchantArchiveFilter === '접미' ? 'active' : ''}`}
                onClick={() => setEnchantArchiveFilter('접미')}
              >
                🔮 접미 (Suffix)
              </button>
            </div>

            <div className="enchant-search-input-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="인챈트 명칭 / 효과 검색 (예: 의지의, 알레고리)"
                value={enchantSearchInput}
                onChange={e => setEnchantSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Enchant Master Cards Grid */}
          <div className="enchant-master-cards-grid">
            {enchantArchives
              .filter(enc => {
                if (enchantArchiveFilter !== 'ALL' && enc.enchant_type !== enchantArchiveFilter) return false;
                if (enchantSearchInput.trim()) {
                  const q = enchantSearchInput.trim().toLowerCase();
                  return (enc.enchant_name || '').toLowerCase().includes(q) ||
                         (enc.effect_summary || '').toLowerCase().includes(q) ||
                         (enc.target_equip || '').toLowerCase().includes(q);
                }
                return true;
              })
              .map(enc => {
                let statsMap = {};
                try {
                  if (enc.stats_min_max_json) statsMap = JSON.parse(enc.stats_min_max_json);
                } catch (e) {}

                return (
                  <div key={enc.id} className="enchant-master-card">
                    <div className="card-top">
                      <span className={`opt-type-tag ${enc.enchant_type}`}>{enc.enchant_type}</span>
                      <span className="rank-badge">{enc.rank || '1랭크'}</span>
                    </div>

                    <h4 className="enchant-title">{enc.enchant_name} 인챈트</h4>
                    <span className="target-equip-badge"><ShieldAlert size={12} /> {enc.target_equip || '전용 장비'}</span>

                    {/* Min / Max Stat Gauges */}
                    <div className="stat-ranges-box">
                      <span className="box-lbl">유동 옵션 최소 ~ 최대 수치 범위</span>
                      {Object.keys(statsMap).length > 0 ? (
                        Object.entries(statsMap).map(([statName, info], i) => {
                          const isDecrease = info.direction === '감소';
                          const themeColor = isDecrease ? '#ef4444' : '#3b82f6';
                          const conditionText = info.condition ? `(${info.condition}) ` : '';
                          const targetText = info.target || statName;
                          const displayVal = info.min === info.max 
                            ? `${info.min}${info.unit || ''} ${info.direction || '증가'}`
                            : `(${info.min} ~ ${info.max})${info.unit || ''} ${info.direction || '증가'}`;

                          return (
                            <div className="stat-gauge-row" key={i} style={{ borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
                              <div className="stat-header">
                                <span className="stat-name">
                                  {conditionText && <span style={{ color: '#9ca3af', fontSize: '11px', marginRight: '4px' }}>{conditionText}</span>}
                                  <strong style={{ color: isDecrease ? '#f87171' : '#60a5fa' }}>{targetText}</strong>
                                </span>
                                <span className="stat-range-val font-bold" style={{ color: isDecrease ? '#f87171' : '#60a5fa' }}>
                                  {displayVal}
                                </span>
                              </div>
                              <div className="gauge-track">
                                <div className="gauge-fill" style={{ width: '100%', background: themeColor }} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="summary-text">{enc.effect_summary || '효과 정보 요약 준비 중'}</p>
                      )}
                    </div>

                    <div className="card-footer">
                      <span className="sample-lbl">실시간 수집 데이터: {enc.sample_count || 1}건 수집</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {enchantArchives.filter(enc => {
            if (enchantArchiveFilter !== 'ALL' && enc.enchant_type !== enchantArchiveFilter) return false;
            if (enchantSearchInput.trim()) {
              const q = enchantSearchInput.trim().toLowerCase();
              return (enc.enchant_name || '').toLowerCase().includes(q) ||
                     (enc.effect_summary || '').toLowerCase().includes(q) ||
                     (enc.target_equip || '').toLowerCase().includes(q);
            }
            return true;
          }).length === 0 && (
            <div className="empty-archive-box">
              <Sparkles size={32} />
              <p>수집된 인챈트 도감 데이터가 없습니다. '실시간 API 조회' 탭에서 경매장 검색 시 자동으로 수집 수치 범위가 등록됩니다.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: 아카이브 노트 */}
      {activeTab === 'notes' && (
        <div className="tab-content notes-tab">
          <div className="tab-toolbar">
            <span className="sub-info-text">마비노기 공략, 장비 세팅 팁, 아카이브 노트</span>
            <button className="create-archive-btn" onClick={() => setShowAddNoteModal(true)}>
              <Plus size={16} />
              <span>새 노트 작성</span>
            </button>
          </div>

          <div className="notes-list">
            {noteArchives.map(note => (
              <div className={`note-card ${note.is_pinned ? 'pinned' : ''}`} key={note.id}>
                <div className="note-header">
                  <div className="note-title-group">
                    {note.is_pinned && <Pin size={16} className="pin-icon" />}
                    <span className="category-tag">{note.category}</span>
                    <h4>{note.title}</h4>
                  </div>
                  <button className="delete-mini-btn" onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="note-content">
                  <p>{note.content}</p>
                </div>
                {note.tags && (
                  <div className="tags-container">
                    {note.tags.split(',').map((t, i) => (
                      <span className="tag-badge" key={i}>#{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}



      {/* MODAL 1: 아이템 수집 모달 */}
      {showAddItemModal && (
        <div className="modal-overlay" onClick={() => setShowAddItemModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3>새 마비노기 아이템 아카이브 추가</h3>
            <form onSubmit={handleCreateItemSubmit}>
              <div className="form-group">
                <label>아이템명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 페러시우스 클리브 아케인 헌터스 보우"
                  value={newItemForm.item_name}
                  onChange={e => setNewItemForm({ ...newItemForm, item_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>카테고리 분류</label>
                <select
                  value={newItemForm.category}
                  onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                >
                  {MABI_CATEGORIES.filter(c => c !== "전체").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  placeholder="종결, 종결활, 피어싱3"
                  value={newItemForm.tags}
                  onChange={e => setNewItemForm({ ...newItemForm, tags: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>설명 및 입수처</label>
                <textarea
                  rows={3}
                  placeholder="아이템 옵션 및 입수 방법에 대한 상세 기록..."
                  value={newItemForm.description}
                  onChange={e => setNewItemForm({ ...newItemForm, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddItemModal(false)}>취소</button>
                <button type="submit" className="save-btn">저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 새 노트 작성을 위한 모달 */}
      {showAddNoteModal && (
        <div className="modal-overlay" onClick={() => setShowAddNoteModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3>새 아카이브 노트 작성</h3>
            <form onSubmit={handleCreateNoteSubmit}>
              <div className="form-group">
                <label>제목</label>
                <input
                  type="text"
                  required
                  placeholder="노트 제목을 입력하세요"
                  value={newNoteForm.title}
                  onChange={e => setNewNoteForm({ ...newNoteForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>카테고리</label>
                <select
                  value={newNoteForm.category}
                  onChange={e => setNewNoteForm({ ...newNoteForm, category: e.target.value })}
                >
                  <option value="공략">던전/레이드 공략</option>
                  <option value="장비세팅">장비 세팅 팁</option>
                  <option value="시세분석">시세 분석</option>
                  <option value="일반">일반 노트</option>
                </select>
              </div>

              <div className="form-group">
                <label>본문 내용</label>
                <textarea
                  rows={5}
                  required
                  placeholder="노트 본문 내용을 입력하세요..."
                  value={newNoteForm.content}
                  onChange={e => setNewNoteForm({ ...newNoteForm, content: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddNoteModal(false)}>취소</button>
                <button type="submit" className="save-btn">노트 저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: 비밀번호 확인 및 초기화 모달 */}
      {showResetPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
          <div className="modal-container reset-password-modal" onClick={e => e.stopPropagation()}>
            <h3>🔒 {resetTarget === 'items' ? '아이템 아카이브' : '인챈트 도감'} 데이터 전체 초기화</h3>
            <form onSubmit={handleConfirmReset}>
              <div className="reset-warning-box" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                color: '#f87171',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>⚠️ 주의: 데이터가 전체 삭제됩니다!</p>
                <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                  해당 항목({resetTarget === 'items' ? '아이템' : '인챈트'})의 모든 DB 데이터가 영구 삭제됩니다.
                </p>
              </div>

              <div className="form-group">
                <label>관리자 비밀번호 입력</label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="비밀번호를 입력하세요"
                  value={resetPasswordInput}
                  onChange={e => {
                    setResetPasswordInput(e.target.value);
                    if (resetError) setResetError('');
                  }}
                />
              </div>

              {resetError && (
                <div className="reset-error-msg" style={{
                  color: '#ef4444',
                  fontSize: '13px',
                  marginTop: '8px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {resetError}
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="cancel-btn" onClick={() => setShowResetPasswordModal(false)}>취소</button>
                <button type="submit" className="save-btn reset-confirm-btn" style={{ background: '#dc2626', color: '#fff' }}>
                  초기화 실행
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
