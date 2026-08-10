import React, { useState, useEffect } from 'react';
import { Search, Database, Key, Plus, Trash2, Tag, ShieldAlert, Sparkles, Filter, RefreshCw, ChevronRight, ChevronLeft, ExternalLink, Award, User, ShoppingBag, BookOpen, Check, Layers, AlertCircle, FileText, Pin, TrendingUp, X, ArrowRight, ArrowLeft, Info, Zap, Coins, Lock, LogOut } from 'lucide-react';
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

  // Gold unit display mode state (Korean 만 unit toggle)
  const [isKoreanGoldUnit, setIsKoreanGoldUnit] = useState(() => {
    return localStorage.getItem('mabi_gold_format') === 'korean';
  });

  const toggleGoldFormat = () => {
    const nextVal = !isKoreanGoldUnit;
    setIsKoreanGoldUnit(nextVal);
    localStorage.setItem('mabi_gold_format', nextVal ? 'korean' : 'normal');
  };

  const formatGold = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '시세 정보 없음';
    const num = Math.floor(Number(amount));
    if (num <= 0) return '0 골드';

    if (!isKoreanGoldUnit) {
      return `${num.toLocaleString()} 골드`;
    }

    if (num < 10000) {
      return `${num.toLocaleString()} 골드`;
    }

    const totalMan = Math.floor(num / 10000);
    const eok = Math.floor(totalMan / 10000);
    const man = totalMan % 10000;

    if (eok > 0) {
      return man > 0 ? `${eok.toLocaleString()}억 ${man.toLocaleString()}만 골드` : `${eok.toLocaleString()}억 골드`;
    }
    return `${totalMan.toLocaleString()}만 골드`;
  };

  // User Authentication & Admin Check States
  const [userToken, setUserToken] = useState(() => localStorage.getItem('mabi_user_token') || '');
  const [userLoginName, setUserLoginName] = useState(() => localStorage.getItem('mabi_user_name') || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          username: loginForm.username ? loginForm.username.trim() : '',
          password: loginForm.password
        })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        const uName = data.username || loginForm.username;
        setUserToken(data.token);
        setUserLoginName(uName);
        localStorage.setItem('mabi_user_token', data.token);
        localStorage.setItem('mabi_user_name', uName);
        setShowLoginModal(false);
        setLoginForm({ username: '', password: '' });
      } else {
        setLoginError(data.detail || '로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.');
      }
    } catch (err) {
      setLoginError('서버 연결 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUserToken('');
    setUserLoginName('');
    localStorage.removeItem('mabi_user_token');
    localStorage.removeItem('mabi_user_name');
  };

  const isAdminLoggedIn = () => {
    const uLower = (userLoginName || '').toLowerCase();
    return Boolean(userToken) && (userLoginName === 'Yuha69' || uLower === 'yuha69' || uLower === 'admin');
  };

  // Nexon Open API Key State
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('mabinogi_api_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [searchType, setSearchType] = useState('auction');

  // Archive Detail View States (Artisan Upgrade & Reforge Collapsing/Search)
  const [artisanCollapsed, setArtisanCollapsed] = useState(false);
  const [reforgeCollapsed, setReforgeCollapsed] = useState(false);
  const [reforgeSearchQuery, setReforgeSearchQuery] = useState('');
  
  // Batch Management States
  const [batchConfig, setBatchConfig] = useState(null);
  const [batchLogs, setBatchLogs] = useState([]);
  const [batchLogsPage, setBatchLogsPage] = useState(1);
  const [batchLogsTotalPages, setBatchLogsTotalPages] = useState(1);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchTriggering, setBatchTriggering] = useState(false);

  const fetchBatchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/batch/config`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setBatchConfig(data);
      }
    } catch (e) {
      console.error("Failed to fetch batch config:", e);
    }
  };

  const fetchBatchLogs = async (page = 1) => {
    try {
      setBatchLoading(true);
      const res = await fetch(`${API_BASE}/api/mabinogi/batch/logs?page=${page}&page_size=15`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setBatchLogs(data.logs || []);
        setBatchLogsPage(data.page || 1);
        setBatchLogsTotalPages(data.total_pages || 1);
      }
    } catch (e) {
      console.error("Failed to fetch batch logs:", e);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleUpdateBatchConfig = async (is_enabled, interval_minutes, item_target_count) => {
    try {
      const payload = {};
      if (is_enabled !== undefined && is_enabled !== null) payload.is_enabled = is_enabled;
      if (interval_minutes !== undefined && interval_minutes !== null) payload.interval_minutes = interval_minutes;
      if (item_target_count !== undefined && item_target_count !== null) payload.item_target_count = item_target_count;

      const res = await fetch(`${API_BASE}/api/mabinogi/batch/config`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchBatchConfig();
      }
    } catch (e) {
      console.error("Failed to update batch config:", e);
    }
  };

  const handleTriggerBatch = async () => {
    try {
      setBatchTriggering(true);
      const res = await fetch(`${API_BASE}/api/mabinogi/batch/trigger`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        setTimeout(() => {
          fetchBatchConfig();
          fetchBatchLogs(1);
          setBatchTriggering(false);
        }, 1500);
      } else {
        setBatchTriggering(false);
      }
    } catch (e) {
      console.error("Failed to trigger batch:", e);
      setBatchTriggering(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'management') {
      fetchBatchConfig();
      fetchBatchLogs(1);
    }
  }, [activeTab]);

  // Auction Search & Filters
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [auctionSearchInput, setAuctionSearchInput] = useState('');
  const [isKeywordSearch, setIsKeywordSearch] = useState(false);
  const [auctionResults, setAuctionResults] = useState([]);
  const [nextCursor, setNextCursor] = useState('');
  const [auctionLoading, setAuctionLoading] = useState(false);
  const [enchantTypeFilter, setEnchantTypeFilter] = useState('ALL');

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
  const [itemSearchInput, setItemSearchInput] = useState('');
  const [itemPage, setItemPage] = useState(1);
  const [itemLimit, setItemLimit] = useState(50);
  const [itemTotal, setItemTotal] = useState(0);
  const [itemTotalPages, setItemTotalPages] = useState(1);
  const [itemLoading, setItemLoading] = useState(false);

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
  const [enchantPage, setEnchantPage] = useState(1);
  const [enchantLimit, setEnchantLimit] = useState(20);
  const [enchantTotal, setEnchantTotal] = useState(0);
  const [enchantTotalPages, setEnchantTotalPages] = useState(1);
  const [enchantLoading, setEnchantLoading] = useState(false);

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
  const fetchItemArchives = async (overridePage, overrideLimit, overrideCategory, overrideQuery) => {
    setItemLoading(true);
    try {
      const pageToFetch = overridePage !== undefined ? overridePage : itemPage;
      const limitToFetch = overrideLimit !== undefined ? overrideLimit : itemLimit;
      const catToFetch = overrideCategory !== undefined ? overrideCategory : categoryFilter;
      const queryToFetch = overrideQuery !== undefined ? overrideQuery : itemSearchInput;

      const params = new URLSearchParams();
      params.append('page', pageToFetch);
      params.append('limit', limitToFetch);
      if (catToFetch && catToFetch !== 'ALL' && catToFetch !== '전체') {
        params.append('category', catToFetch);
      }
      if (queryToFetch && queryToFetch.trim()) {
        params.append('query', queryToFetch.trim());
      }

      const res = await fetch(`${API_BASE}/api/mabinogi/archives/items?${params.toString()}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          let filtered = data || [];
          if (catToFetch && catToFetch !== 'ALL' && catToFetch !== '전체') {
            filtered = filtered.filter(i => i.category === catToFetch);
          }
          if (queryToFetch && queryToFetch.trim()) {
            const q = queryToFetch.trim().toLowerCase();
            filtered = filtered.filter(i => 
              (i.item_name || '').toLowerCase().includes(q) ||
              (i.item_display_name || '').toLowerCase().includes(q) ||
              (i.description || '').toLowerCase().includes(q) ||
              (i.options_json || '').toLowerCase().includes(q) ||
              (i.tags || '').toLowerCase().includes(q)
            );
          }
          const totalCount = filtered.length;
          const totalPages = Math.ceil(totalCount / limitToFetch) || 1;
          const startIndex = (pageToFetch - 1) * limitToFetch;
          const pagedItems = filtered.slice(startIndex, startIndex + limitToFetch);

          setItemArchives(pagedItems);
          setItemTotal(totalCount);
          setItemPage(pageToFetch);
          setItemLimit(limitToFetch);
          setItemTotalPages(totalPages);
        } else {
          setItemArchives(data.items || []);
          setItemTotal(data.total || data.total_count || 0);
          setItemPage(data.page || pageToFetch);
          setItemLimit(data.limit || data.page_size || limitToFetch);
          setItemTotalPages(data.total_pages || 1);
        }
      }
    } catch (err) {
      console.log('Using local fallback for items', err);
    } finally {
      setItemLoading(false);
    }
  };

  const handleItemPageChange = (newPage) => {
    if (newPage < 1 || newPage > itemTotalPages || newPage === itemPage) return;
    setItemPage(newPage);
    fetchItemArchives(newPage, itemLimit, categoryFilter, itemSearchInput);
  };

  const handleItemLimitChange = (newLimit) => {
    setItemLimit(newLimit);
    setItemPage(1);
    fetchItemArchives(1, newLimit, categoryFilter, itemSearchInput);
  };

  const handleItemCategoryChange = (newCat) => {
    setCategoryFilter(newCat);
    setItemPage(1);
    fetchItemArchives(1, itemLimit, newCat, itemSearchInput);
  };

  const handleItemSearchChange = (val) => {
    setItemSearchInput(val);
  };

  useEffect(() => {
    if (activeTab === 'items') {
      const timer = setTimeout(() => {
        setItemPage(1);
        fetchItemArchives(1, itemLimit, categoryFilter, itemSearchInput);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [itemSearchInput]);

  const fetchEnchantArchives = async (overridePage, overrideLimit, overrideFilter, overrideQuery) => {
    setEnchantLoading(true);
    try {
      const pageToFetch = overridePage !== undefined ? overridePage : enchantPage;
      const limitToFetch = overrideLimit !== undefined ? overrideLimit : enchantLimit;
      const filterToFetch = overrideFilter !== undefined ? overrideFilter : enchantArchiveFilter;
      const queryToFetch = overrideQuery !== undefined ? overrideQuery : enchantSearchInput;

      const params = new URLSearchParams();
      params.append('page', pageToFetch);
      params.append('limit', limitToFetch);
      if (filterToFetch && filterToFetch !== 'ALL') {
        params.append('enchant_type', filterToFetch);
      }
      if (queryToFetch && queryToFetch.trim()) {
        params.append('query', queryToFetch.trim());
      }

      const res = await fetch(`${API_BASE}/api/mabinogi/archives/enchants?${params.toString()}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          let filtered = data || [];
          if (filterToFetch && filterToFetch !== 'ALL') {
            filtered = filtered.filter(e => e.enchant_type === filterToFetch);
          }
          if (queryToFetch && queryToFetch.trim()) {
            const q = queryToFetch.trim().toLowerCase();
            filtered = filtered.filter(e => 
              (e.enchant_name || '').toLowerCase().includes(q) ||
              (e.effect_summary || '').toLowerCase().includes(q) ||
              (e.target_equip || '').toLowerCase().includes(q) ||
              (e.rank || '').toLowerCase().includes(q)
            );
          }
          const totalCount = filtered.length;
          const totalPages = Math.ceil(totalCount / limitToFetch) || 1;
          const startIndex = (pageToFetch - 1) * limitToFetch;
          const pagedItems = filtered.slice(startIndex, startIndex + limitToFetch);

          setEnchantArchives(pagedItems);
          setEnchantTotal(totalCount);
          setEnchantPage(pageToFetch);
          setEnchantLimit(limitToFetch);
          setEnchantTotalPages(totalPages);
        } else {
          setEnchantArchives(data.items || []);
          setEnchantTotal(data.total || 0);
          setEnchantPage(data.page || pageToFetch);
          setEnchantLimit(data.limit || limitToFetch);
          setEnchantTotalPages(data.total_pages || 1);
        }
      }
    } catch (err) {
      console.log('Using local fallback for enchants', err);
    } finally {
      setEnchantLoading(false);
    }
  };

  const handleEnchantPageChange = (newPage) => {
    if (newPage < 1 || newPage > enchantTotalPages || newPage === enchantPage) return;
    setEnchantPage(newPage);
    fetchEnchantArchives(newPage, enchantLimit, enchantArchiveFilter, enchantSearchInput);
  };

  const handleEnchantLimitChange = (newLimit) => {
    setEnchantLimit(newLimit);
    setEnchantPage(1);
    fetchEnchantArchives(1, newLimit, enchantArchiveFilter, enchantSearchInput);
  };

  const handleEnchantFilterChange = (newFilter) => {
    setEnchantArchiveFilter(newFilter);
    setEnchantPage(1);
    fetchEnchantArchives(1, enchantLimit, newFilter, enchantSearchInput);
  };

  const handleEnchantSearchChange = (val) => {
    setEnchantSearchInput(val);
  };

  const getPageNumbers = (current, total) => {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  useEffect(() => {
    if (activeTab === 'enchants') {
      const timer = setTimeout(() => {
        setEnchantPage(1);
        fetchEnchantArchives(1, enchantLimit, enchantArchiveFilter, enchantSearchInput);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [enchantSearchInput]);

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
    const pwd = prompt('삭제 비밀번호를 입력하세요:');
    if (!pwd) return;
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/items/${id}?password=${encodeURIComponent(pwd)}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItemArchives();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || '삭제 실패: 비밀번호가 올바르지 않거나 권한이 없습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 실패: ' + err.message);
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
        let errMsg = '초기화 처리 중 오류가 발생했습니다.';
        if (typeof errData.detail === 'string') {
          errMsg = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          errMsg = errData.detail.map(d => d.msg || JSON.stringify(d)).join(', ');
        } else if (errData.detail && typeof errData.detail === 'object') {
          errMsg = JSON.stringify(errData.detail);
        }
        setResetError(errMsg);
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
    const pwd = prompt('삭제 비밀번호를 입력하세요:');
    if (!pwd) return;
    try {
      const res = await fetch(`${API_BASE}/api/mabinogi/archives/notes/${id}?password=${encodeURIComponent(pwd)}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNoteArchives();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || '삭제 실패: 비밀번호가 올바르지 않거나 권한이 없습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 실패: ' + err.message);
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
                      <span className="val">{formatGold(getItemPrice(selectedItemHistory))}</span>
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
                      {formatGold(
                        historyData.reduce((a, b) => a + getItemPrice(b), 0) / (historyData.length || 1)
                      )}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="k">최저 거래가</span>
                    <span className="v blue">
                      {formatGold(
                        historyData.length > 0
                          ? Math.min(...historyData.map(getItemPrice))
                          : getItemPrice(selectedItemHistory)
                      )}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="k">최고 거래가</span>
                    <span className="v green">
                      {formatGold(
                        historyData.length > 0
                          ? Math.max(...historyData.map(getItemPrice))
                          : getItemPrice(selectedItemHistory)
                      )}
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
                  formatGold={formatGold}
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
                            <td className="price-text font-bold">{formatGold(getItemPrice(h))}</td>
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

        <div className="mabi-api-status-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`gold-unit-toggle-btn ${isKoreanGoldUnit ? 'active' : ''}`}
            onClick={toggleGoldFormat}
            title="골드 표기 단위 전환 (전체 골드 ↔ 만 단위 표기)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: isKoreanGoldUnit ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
              background: isKoreanGoldUnit ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: isKoreanGoldUnit ? '#fbbf24' : '#e2e8f0',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Coins size={14} />
            <span>{isKoreanGoldUnit ? '만 단위 표기 (1만)' : '전체 골드 표기 (10,000)'}</span>
          </button>
          {userToken ? (
            <div className="user-login-status-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '13px' }}>
              <User size={14} />
              <span><strong>{userLoginName}</strong> {isAdminLoggedIn() ? '🔑 (어드민)' : '(일반)'}</span>
              <button className="logout-mini-btn" onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', marginLeft: '4px', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <LogOut size={12} />
                로그아웃
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowLoginModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(37, 99, 235, 0.2)', color: '#93c5fd', fontSize: '13px', cursor: 'pointer' }}>
              <User size={14} />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="mabi-tabs">
        <button className={`mabi-tab ${activeTab === 'live_search' ? 'active' : ''}`} onClick={() => setActiveTab('live_search')}>
          <Search size={16} />
          <span>경매장 검색</span>
        </button>
        <button className={`mabi-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
          <Layers size={16} />
          <span>아이템/장비 아카이브 ({itemTotal || itemArchives.length})</span>
        </button>
        <button className={`mabi-tab ${activeTab === 'enchants' ? 'active' : ''}`} onClick={() => setActiveTab('enchants')}>
          <Sparkles size={16} />
          <span>인챈트 도감 ({enchantTotal || enchantArchives.length})</span>
        </button>
        <button className={`mabi-tab ${activeTab === 'management' ? 'active' : ''}`} onClick={() => setActiveTab('management')}>
          <Database size={16} />
          <span>수집 관리</span>
        </button>
      </div>

      {/* TAB 1: 경매장 검색 */}
      {activeTab === 'live_search' && (
        <div className="tab-content live-search-tab">
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
                          <td className="price-text">{formatGold(getItemPrice(item))}</td>
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

                  {/* 3, 4, 8. 그룹별 옵션 유동 수치 범위 (기본 옵션, 개조, 에르그 등) */}
                  <div className="detail-card-box">
                    <h3><Zap size={18} /> 그룹별 옵션 유동 수치 범위 (Min~Max Range)</h3>
                    {selectedArchiveItem.grouped_options_json ? (
                      (() => {
                        try {
                          const grp = JSON.parse(selectedArchiveItem.grouped_options_json);
                          const grpNames = {
                            base_stats: '📊 3. 기본 옵션 유동수치 범위 (Min~Max)',
                            modification: '🛠️ 4. 개조 및 강화 단계 (일반/보석/특별 개조)',
                            erg: '🔥 8. 에르그 단계/효과',
                            reforge: '⚡ 세공 레벨 범위',
                            set_effects: '✨ 세트 효과 포인트'
                          };

                          const displayKeys = ['base_stats', 'modification', 'erg'];
                          const hasItems = displayKeys.some(catKey => grp[catKey] && Object.keys(grp[catKey]).length > 0);
                          
                          if (!hasItems) {
                            return <p className="empty-text font-medium">수집된 기본 옵션 및 개조/에르그 범위 데이터가 없습니다.</p>;
                          }

                          return (
                            <div className="grouped-options-sections-container">
                              {displayKeys.map(catKey => {
                                const itemsDict = grp[catKey];
                                const entries = Object.entries(itemsDict || {});
                                if (entries.length === 0) return null;

                                return (
                                  <div className="option-category-group" key={catKey} style={{ marginBottom: '16px' }}>
                                    <h4 className="group-title" style={{ fontSize: '0.95rem', color: '#60a5fa', marginBottom: '8px' }}>{grpNames[catKey] || catKey}</h4>
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

                  {/* 5. 장인 개조 (Artisan Upgrades - Foldable) */}
                  <div className="detail-card-box collapsible-card">
                    <div 
                      className="card-header-toggle" 
                      onClick={() => setArtisanCollapsed(!artisanCollapsed)} 
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3><Layers size={18} /> 🛠️ 5. 장인 개조 (Artisan Upgrades)</h3>
                      <span className="collapse-badge" style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                        {artisanCollapsed ? '펼치기 ▲' : '접기 ▼'}
                      </span>
                    </div>
                    {!artisanCollapsed && (
                      <div className="collapsible-body" style={{ marginTop: '12px' }}>
                        {(() => {
                          let artisanMap = {};
                          if (selectedArchiveItem.artisan_upgrades_json) {
                            try { artisanMap = JSON.parse(selectedArchiveItem.artisan_upgrades_json); } catch(e){}
                          }
                          const entries = Object.entries(artisanMap);
                          if (entries.length === 0) {
                            return <p className="empty-text">수집된 장인 개조 정보가 없습니다.</p>;
                          }
                          return (
                            <div className="artisan-grid-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {entries.map(([statName, info], idx) => {
                                const valStr = (info.min === info.max || info.min === null || info.min === undefined)
                                  ? `${info.max ?? info.min ?? info.raw}`
                                  : `${info.min}~${info.max}`;
                                return (
                                  <div className="artisan-item-card" key={idx} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                                    <span style={{ color: '#9ca3af', fontWeight: 'bold' }}>-</span>
                                    <span className="font-bold" style={{ color: '#e5e7eb' }}>{statName}</span>
                                    <span style={{ color: '#6ee7b7', fontWeight: 600 }}>{valStr}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* 6. 세트 효과 (Set Effects) */}
                  <div className="detail-card-box">
                    <h3><Sparkles size={18} /> ✨ 6. 발동 세트 효과 (Set Effects)</h3>
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

                  {/* 7. 세공 목록 (Reforging Options List - Foldable & Searchable) */}
                  <div className="detail-card-box collapsible-card">
                    <div 
                      className="card-header-toggle" 
                      onClick={() => setReforgeCollapsed(!reforgeCollapsed)} 
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3><Zap size={18} /> ⚡ 7. 세공 목록 (Reforging Options)</h3>
                      <span className="collapse-badge" style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                        {reforgeCollapsed ? '펼치기 ▲' : '접기 ▼'}
                      </span>
                    </div>
                    {!reforgeCollapsed && (
                      <div className="collapsible-body" style={{ marginTop: '12px' }}>
                        <div className="reforge-search-box" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <Search size={14} style={{ color: '#9ca3af' }} />
                          <input
                            type="text"
                            placeholder="세공 효과 검색 (예: 스매시, 마법 공격력)..."
                            value={reforgeSearchQuery}
                            onChange={e => setReforgeSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '0.88rem' }}
                          />
                          {reforgeSearchQuery && (
                            <X size={14} style={{ cursor: 'pointer', color: '#9ca3af' }} onClick={() => setReforgeSearchQuery('')} />
                          )}
                        </div>
                        {(() => {
                          let reforgeList = [];
                          if (selectedArchiveItem.reforge_options_json) {
                            try { reforgeList = JSON.parse(selectedArchiveItem.reforge_options_json); } catch(e){}
                          }
                          const filtered = reforgeList.filter(item => {
                            const query = reforgeSearchQuery.toLowerCase();
                            return (item.display || item.name || '').toLowerCase().includes(query);
                          });

                          if (filtered.length === 0) {
                            return <p className="empty-text">검색 조건에 맞는 세공 옵션이 없습니다.</p>;
                          }
                          return (
                            <div className="reforge-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                              {filtered.map((rf, idx) => (
                                <div className="reforge-card" key={idx} style={{ padding: '8px 12px', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '6px' }}>
                                  <span className="bullet">⚡ </span>
                                  <span className="reforge-display font-medium" style={{ color: '#c084fc' }}>
                                    {rf.display || `${rf.name}(${rf.level}레벨:${rf.value})`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
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
              <div className="tab-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div className="toolbar-left-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="filter-group">
                    <Filter size={16} />
                    <select
                      className="mabi-select category-filter-select"
                      value={categoryFilter}
                      onChange={e => handleItemCategoryChange(e.target.value)}
                    >
                      <option value="ALL">전체 아이템 분류 보기</option>
                      {MABI_CATEGORIES.filter(c => c !== "전체").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="item-search-input-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '6px 12px', width: '320px' }}>
                    <Search size={14} style={{ color: '#9ca3af' }} />
                    <input
                      type="text"
                      placeholder="아이템 명칭 / 세공 / 옵션 / 태그 검색..."
                      value={itemSearchInput}
                      onChange={e => handleItemSearchChange(e.target.value)}
                      style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                    {itemSearchInput && (
                      <button
                        onClick={() => {
                          handleItemSearchChange('');
                          setItemPage(1);
                          fetchItemArchives(1, itemLimit, categoryFilter, '');
                        }}
                        title="검색어 초기화"
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {itemLoading ? (
                <div className="loading-state-box" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <RefreshCw size={24} className="spin-icon" style={{ marginBottom: '8px' }} />
                  <p>아이템/장비 수집 데이터를 불러오는 중...</p>
                </div>
              ) : (
                <>
                  <div className="archive-cards-grid">
                    {filteredItems.map(item => {
                      const updatedTimeStr = item.updated_at || item.created_at;
                      const formattedDate = updatedTimeStr ? new Date(updatedTimeStr).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '';

                      return (
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

                          <div className="card-footer" style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <span className="price-lbl" style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
                              💰 평균: {item.avg_price ? formatGold(item.avg_price) : (item.price_estimate || '평균 가격 미상')}
                            </span>
                            {formattedDate && (
                              <span className="collected-date-badge" style={{ fontSize: '11px', color: '#9ca3af', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                📅 {formattedDate}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {filteredItems.length === 0 && (
                      <div className="empty-archive-box">
                        <Database size={32} />
                        <p>등록된 아이템 아카이브가 없습니다. 실시간 API 검색을 통해 카테고리별 아이템 정보를 자동으로 등록할 수 있습니다.</p>
                      </div>
                    )}
                  </div>

                  {/* Item Archive Pagination Controls Bar */}
                  {itemTotalPages > 0 && (
                    <div className="archive-pagination" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <div className="pagination-info" style={{ color: '#9ca3af', fontSize: '13px' }}>
                        전체 <strong style={{ color: '#60a5fa' }}>{itemTotal}</strong>건 중{' '}
                        <strong style={{ color: '#e2e8f0' }}>
                          {itemTotal === 0 ? 0 : (itemPage - 1) * itemLimit + 1} - {Math.min(itemPage * itemLimit, itemTotal)}
                        </strong>건 표시 ({itemPage} / {itemTotalPages} 페이지)
                      </div>

                      <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="page-nav-btn"
                          disabled={itemPage <= 1 || itemLoading}
                          onClick={() => handleItemPageChange(itemPage - 1)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.6)', color: itemPage <= 1 ? '#475569' : '#e2e8f0', cursor: itemPage <= 1 ? 'not-allowed' : 'pointer' }}
                        >
                          <ChevronLeft size={16} /> 이전
                        </button>

                        <div className="page-numbers" style={{ display: 'flex', gap: '4px' }}>
                          {getPageNumbers(itemPage, itemTotalPages).map((pNum, idx) => (
                            pNum === '...' ? (
                              <span key={`ellipsis-${idx}`} className="page-ellipsis" style={{ padding: '6px 8px', color: '#64748b' }}>...</span>
                            ) : (
                              <button
                                key={`page-${pNum}`}
                                className={`page-number-btn ${itemPage === pNum ? 'active' : ''}`}
                                disabled={itemLoading}
                                onClick={() => handleItemPageChange(pNum)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: itemPage === pNum ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                                  background: itemPage === pNum ? '#2563eb' : 'rgba(15, 23, 42, 0.4)',
                                  color: '#ffffff',
                                  fontWeight: itemPage === pNum ? 'bold' : 'normal',
                                  cursor: 'pointer'
                                }}
                              >
                                {pNum}
                              </button>
                            )
                          ))}
                        </div>

                        <button
                          className="page-nav-btn"
                          disabled={itemPage >= itemTotalPages || itemLoading}
                          onClick={() => handleItemPageChange(itemPage + 1)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.6)', color: itemPage >= itemTotalPages ? '#475569' : '#e2e8f0', cursor: itemPage >= itemTotalPages ? 'not-allowed' : 'pointer' }}
                        >
                          다음 <ChevronRight size={16} />
                        </button>

                        <select
                          className="page-limit-select"
                          value={itemLimit}
                          onChange={(e) => handleItemLimitChange(Number(e.target.value))}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#0f172a', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', marginLeft: '8px' }}
                        >
                          <option value={20}>20개씩</option>
                          <option value={50}>50개씩 (기본)</option>
                          <option value={100}>100개씩</option>
                          <option value={200}>200개씩</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}</div>
      )}

      {/* TAB 3: 인챈트 도감 (Dedicated Enchant Master Knowledge Base) */}
      {activeTab === 'enchants' && (
        <div className="tab-content enchants-tab">
          <div className="tab-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div className="toolbar-left-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="enchant-type-toggle-group">
                <button
                  className={`enchant-type-btn ${enchantArchiveFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => handleEnchantFilterChange('ALL')}
                >
                  전체 인챈트
                </button>
                <button
                  className={`enchant-type-btn prefix ${enchantArchiveFilter === '접두' ? 'active' : ''}`}
                  onClick={() => handleEnchantFilterChange('접두')}
                >
                  ✨ 접두 (Prefix)
                </button>
                <button
                  className={`enchant-type-btn suffix ${enchantArchiveFilter === '접미' ? 'active' : ''}`}
                  onClick={() => handleEnchantFilterChange('접미')}
                >
                  🔮 접미 (Suffix)
                </button>
              </div>

              <div className="item-search-input-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '6px 12px', width: '320px' }}>
                <Search size={14} style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="인챈트 명칭 / 효과 / 랭크 / 대상 검색..."
                  value={enchantSearchInput}
                  onChange={e => handleEnchantSearchChange(e.target.value)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '13px', width: '100%', outline: 'none' }}
                />
                {enchantSearchInput && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => {
                      handleEnchantSearchChange('');
                      setEnchantPage(1);
                      fetchEnchantArchives(1, enchantLimit, enchantArchiveFilter, '');
                    }}
                    title="검색어 초기화"
                    style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enchant Master Cards Grid */}
          {enchantLoading ? (
            <div className="loading-state-box" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <RefreshCw size={24} className="spin-icon" style={{ marginBottom: '8px' }} />
              <p>인챈트 도감 수집 데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="enchant-master-cards-grid">
                {enchantArchives.map(enc => {
                  let statsMap = {};
                  try {
                    if (enc.stats_min_max_json) statsMap = JSON.parse(enc.stats_min_max_json);
                  } catch (e) {}

                  const updatedTimeStr = enc.updated_at || enc.created_at;
                  const formattedDate = updatedTimeStr ? new Date(updatedTimeStr).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '';

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

                      <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <span className="price-lbl" style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
                          💰 평균: {enc.avg_price ? formatGold(enc.avg_price) : '평균 가격 미상'}
                        </span>
                        {formattedDate && (
                          <span className="collected-date-badge" style={{ fontSize: '11px', color: '#9ca3af', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                            📅 {formattedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {enchantArchives.length === 0 && (
                <div className="empty-archive-box">
                  <Sparkles size={32} />
                  <p>수집된 인챈트 도감 데이터가 없습니다. 경매장 검색 시 자동으로 수집 수치 범위가 등록됩니다.</p>
                </div>
              )}

              {/* Pagination Controls Bar */}
              {enchantTotalPages > 0 && (
                <div className="archive-pagination" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div className="pagination-info" style={{ color: '#9ca3af', fontSize: '13px' }}>
                    전체 <strong style={{ color: '#60a5fa' }}>{enchantTotal}</strong>건 중{' '}
                    <strong style={{ color: '#e2e8f0' }}>
                      {enchantTotal === 0 ? 0 : (enchantPage - 1) * enchantLimit + 1} - {Math.min(enchantPage * enchantLimit, enchantTotal)}
                    </strong>건 표시 ({enchantPage} / {enchantTotalPages} 페이지)
                  </div>

                  <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="page-nav-btn"
                      disabled={enchantPage <= 1 || enchantLoading}
                      onClick={() => handleEnchantPageChange(enchantPage - 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.6)', color: enchantPage <= 1 ? '#475569' : '#e2e8f0', cursor: enchantPage <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronLeft size={16} /> 이전
                    </button>

                    <div className="page-numbers" style={{ display: 'flex', gap: '4px' }}>
                      {getPageNumbers(enchantPage, enchantTotalPages).map((pNum, idx) => (
                        pNum === '...' ? (
                          <span key={`ellipsis-${idx}`} className="page-ellipsis" style={{ padding: '6px 8px', color: '#64748b' }}>...</span>
                        ) : (
                          <button
                            key={`page-${pNum}`}
                            className={`page-number-btn ${enchantPage === pNum ? 'active' : ''}`}
                            disabled={enchantLoading}
                            onClick={() => handleEnchantPageChange(pNum)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: enchantPage === pNum ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: enchantPage === pNum ? '#2563eb' : 'rgba(15, 23, 42, 0.4)',
                              color: '#ffffff',
                              fontWeight: enchantPage === pNum ? 'bold' : 'normal',
                              cursor: 'pointer'
                            }}
                          >
                            {pNum}
                          </button>
                        )
                      ))}
                    </div>

                    <button
                      className="page-nav-btn"
                      disabled={enchantPage >= enchantTotalPages || enchantLoading}
                      onClick={() => handleEnchantPageChange(enchantPage + 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.6)', color: enchantPage >= enchantTotalPages ? '#475569' : '#e2e8f0', cursor: enchantPage >= enchantTotalPages ? 'not-allowed' : 'pointer' }}
                    >
                      다음 <ChevronRight size={16} />
                    </button>

                    <select
                      className="page-limit-select"
                      value={enchantLimit}
                      onChange={(e) => handleEnchantLimitChange(Number(e.target.value))}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#0f172a', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', marginLeft: '8px' }}
                    >
                      <option value={20}>20개씩 (기본)</option>
                      <option value={50}>50개씩</option>
                      <option value={100}>100개씩</option>
                      <option value={200}>200개씩</option>
                      <option value={500}>500개씩</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 4: 수집 관리 (Batch Scheduler & Collection Monitor) */}
      {activeTab === 'management' && (
        <div className="tab-content management-tab">
          {!isAdminLoggedIn() ? (
            <div className="admin-lock-panel" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', maxWidth: '480px', margin: '40px auto' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#f87171' }}>
                <Lock size={28} />
              </div>
              <h3 style={{ color: '#ffffff', marginBottom: '8px', fontSize: '20px' }}>🔒 어드민 (Admin) 로그인 필요</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                백그라운드 수집 관리, 수집 배치 설정 및 DB 데이터 초기화 기능은 <strong>어드민 계정 로그인</strong> 후 이용 가능합니다.
              </p>
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>어드민 계정 아이디</label>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>비밀번호</label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                {loginError && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>⚠️ {loginError}</div>
                )}
                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                >
                  {loginLoading ? '로그인 처리 중...' : '어드민 계정으로 로그인'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="archive-section-header">
                <div>
                  <h3>⚙️ 백그라운드 자동 수집 & 수집 관리</h3>
                  <p className="sub">매시간 백그라운드 경매장 데이터 전체 조회 배치 제어 및 신규/업데이트 수집 이력 모니터링</p>
                </div>
                <div className="header-actions">
                  <button 
                    className="trigger-batch-btn" 
                    onClick={handleTriggerBatch} 
                    disabled={batchTriggering || batchConfig?.is_running}
                  >
                    <RefreshCw size={16} className={batchTriggering || batchConfig?.is_running ? "spin-icon" : ""} />
                    <span>{batchTriggering || batchConfig?.is_running ? '백그라운드 수집 실행 중...' : '즉시 수집 실행'}</span>
                  </button>
                  <button className="refresh-logs-btn" onClick={() => { fetchBatchConfig(); fetchBatchLogs(batchLogsPage); }}>
                    <RefreshCw size={16} />
                    <span>새로고침</span>
                  </button>
                </div>
              </div>

              {/* Config Controls & Status Box */}
              <div className="batch-status-panel">
                <div className="status-card-main">
                  <div className="status-badge-row">
                    <span className={`batch-status-pill ${batchConfig?.is_enabled ? 'enabled' : 'disabled'}`}>
                      {batchConfig?.is_enabled ? '● 자동 수집 활성화' : '○ 수집 일시 정지'}
                    </span>
                    {batchConfig?.is_running && (
                      <span className="batch-status-pill running">
                        ⚡ 수집 작업 실행 중...
                      </span>
                    )}
                  </div>
                  <div className="schedule-info-group">
                    <div className="info-item">
                      <span className="lbl">수집 주기 설정</span>
                      <select 
                        className="mabi-select interval-select"
                        value={batchConfig?.interval_minutes || 60}
                        onChange={e => handleUpdateBatchConfig(batchConfig?.is_enabled ?? true, parseInt(e.target.value), batchConfig?.item_target_count || 500)}
                      >
                        <option value={30}>30분 마다 수집</option>
                        <option value={60}>60분 (매시간 수집 - 기본)</option>
                        <option value={120}>120분 (2시간 마다 수집)</option>
                        <option value={240}>240분 (4시간 마다 수집)</option>
                      </select>
                    </div>
                    <div className="info-item">
                      <span className="lbl">수집 분량 설정 (1page = 500건 / max 5page)</span>
                      <select 
                        className="mabi-select interval-select"
                        value={batchConfig?.max_pages || Math.ceil((batchConfig?.item_target_count || 500) / 500)}
                        onChange={e => handleUpdateBatchConfig(batchConfig?.is_enabled ?? true, batchConfig?.interval_minutes || 60, parseInt(e.target.value) * 500)}
                      >
                        <option value={1}>1 page (500건 수집 - 기본)</option>
                        <option value={2}>2 page (1,000건 수집)</option>
                        <option value={3}>3 page (1,500건 수집)</option>
                        <option value={4}>4 page (2,000건 수집)</option>
                        <option value={5}>5 page (2,500건 수집 - 최대)</option>
                      </select>
                    </div>
                    <div className="info-item">
                      <span className="lbl">자동 수집 On/Off</span>
                      <button 
                        className={`toggle-switch-btn ${batchConfig?.is_enabled ? 'active' : ''}`}
                        onClick={() => handleUpdateBatchConfig(!batchConfig?.is_enabled, batchConfig?.interval_minutes || 60)}
                      >
                        {batchConfig?.is_enabled ? '수집 중지하기' : '자동 수집 시작하기'}
                      </button>
                    </div>
                    <div className="info-item">
                      <span className="lbl">최근 실행 시각</span>
                      <span className="val">{batchConfig?.last_run_at ? new Date(batchConfig.last_run_at).toLocaleString() : '실행 이력 없음'}</span>
                    </div>
                    <div className="info-item">
                      <span className="lbl">다음 예정 수집 시각</span>
                      <span className="val highlight">{batchConfig?.next_run_at ? new Date(batchConfig.next_run_at).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Totals Summary Cards */}
                <div className="batch-totals-grid">
                  <div className="total-stat-card">
                    <span className="stat-num">{batchConfig?.totals?.total_batch_runs || 0}회</span>
                    <span className="stat-label">총 배치 수집 실행</span>
                  </div>
                  <div className="total-stat-card green">
                    <span className="stat-num">+{batchConfig?.totals?.total_new_items || 0}개</span>
                    <span className="stat-label">신규 등록 아이템</span>
                  </div>
                  <div className="total-stat-card blue">
                    <span className="stat-num">{batchConfig?.totals?.total_updated_items || 0}개</span>
                    <span className="stat-label">옵션 업데이트 아이템</span>
                  </div>
                  <div className="total-stat-card purple">
                    <span className="stat-num">+{batchConfig?.totals?.total_new_enchants || 0}개</span>
                    <span className="stat-label">신규 등록 인챈트</span>
                  </div>
                  <div className="total-stat-card cyan">
                    <span className="stat-num">{batchConfig?.totals?.total_updated_enchants || 0}개</span>
                    <span className="stat-label">인챈트 옵션 업데이트</span>
                  </div>
                </div>
              </div>

              {/* Batch History Table */}
              <div className="batch-history-section">
                <h4>📋 회차별 데이터 수집 실행 이력 ({batchLogs.length}건)</h4>
                <div className="table-responsive">
                  <table className="mabi-table compact">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>실행 유형</th>
                        <th>상태</th>
                        <th>시작 시각</th>
                        <th>소요 시간</th>
                        <th>처리 개수</th>
                        <th>신규 아이템</th>
                        <th>업데이트 아이템</th>
                        <th>신규 인챈트</th>
                        <th>업데이트 인챈트</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchLogs.map(log => (
                        <tr key={log.id}>
                          <td>#{log.id}</td>
                          <td>
                            <span className={`job-type-badge ${log.job_type}`}>
                              {log.job_type === 'manual_trigger' ? '수동 실행' : '자동 주기 배치'}
                            </span>
                          </td>
                          <td>
                            <span className={`log-status-pill ${log.status}`}>
                              {log.status === 'completed' ? '성공' : (log.status === 'running' ? '진행중' : '실패')}
                            </span>
                          </td>
                          <td>{log.started_at ? new Date(log.started_at).toLocaleString() : '-'}</td>
                          <td>{log.duration_seconds ? `${log.duration_seconds.toFixed(1)}초` : '-'}</td>
                          <td><strong>{log.total_items_processed || 0}개</strong></td>
                          <td><span className="text-green font-bold">+{log.new_items_count || 0}개</span></td>
                          <td><span className="text-blue">{log.updated_items_count || 0}개</span></td>
                          <td><span className="text-purple font-bold">+{log.new_enchants_count || 0}개</span></td>
                          <td><span className="text-cyan">{log.updated_enchants_count || 0}개</span></td>
                        </tr>
                      ))}
                      {batchLogs.length === 0 && (
                        <tr>
                          <td colSpan="10" className="text-center py-6">
                            {batchLoading ? '수집 이력을 불러오는 중...' : '저장된 배치 수집 이력이 없습니다.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {batchLogsTotalPages > 1 && (
                  <div className="pagination-bar">
                    <button 
                      className="page-btn" 
                      disabled={batchLogsPage <= 1}
                      onClick={() => fetchBatchLogs(batchLogsPage - 1)}
                    >
                      <ArrowLeft size={14} /> 이전
                    </button>
                    <span className="page-info">{batchLogsPage} / {batchLogsTotalPages} 페이지</span>
                    <button 
                      className="page-btn" 
                      disabled={batchLogsPage >= batchLogsTotalPages}
                      onClick={() => fetchBatchLogs(batchLogsPage + 1)}
                    >
                      다음 <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* API Key Management Section (Moved to Management Page) */}
              <div className="batch-status-panel" style={{ marginTop: '24px' }}>
                <div className="archive-section-header" style={{ marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Key size={18} style={{ color: '#fbbf24' }} />
                      Nexon Open API Key 연동 관리
                    </h3>
                    <p className="sub" style={{ marginTop: '4px' }}>
                      실시간 경매장 시세 조회 및 데이터 자동 수집에 사용할 넥슨 오픈 API 키(NEXON Open API Key)를 등록 및 설정합니다.
                    </p>
                  </div>
                  <button
                    className="api-key-btn"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fbbf24',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    <Key size={16} />
                    <span>{showKeyInput ? '설정 닫기' : 'API Key 변경 및 설정'}</span>
                  </button>
                </div>

                {showKeyInput && (
                  <div className="api-key-panel" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                      넥슨 개발자 센터(developers.nexon.com)에서 발급받은 Mabinogi Open API Key를 입력하세요.
                    </p>
                    <form onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="password"
                        placeholder="test_50f21448675d40d..."
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#0f172a', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                      />
                      <button
                        type="submit"
                        style={{ padding: '10px 20px', borderRadius: '8px', background: '#f59e0b', color: '#000000', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                      >
                        저장 및 연동
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* DB Data Reset Section (Moved to Management Page) */}
              <div className="batch-status-panel" style={{ marginTop: '24px' }}>
                <div className="archive-section-header" style={{ marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trash2 size={18} style={{ color: '#ef4444' }} />
                      DB 아카이브 데이터 전체 초기화 관리
                    </h3>
                    <p className="sub" style={{ marginTop: '4px' }}>
                      수집된 아이템 아카이브 및 인챈트 도감 DB 데이터를 영구 삭제합니다. 관리자 비밀번호 확인 절차가 필요합니다.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button
                    className="reset-archive-btn"
                    onClick={openItemResetModal}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    <Trash2 size={16} />
                    <span>아이템 아카이브 데이터 전체 초기화</span>
                  </button>

                  <button
                    className="reset-archive-btn"
                    onClick={openEnchantResetModal}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    <Trash2 size={16} />
                    <span>인챈트 도감 데이터 전체 초기화</span>
                  </button>
                </div>
              </div>
            </>
          )}
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

      {/* MODAL: 로그인 모달 */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} style={{ color: '#3b82f6' }} />
                로그인
              </h3>
              <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>아이디 (Username)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginForm.username}
                  onChange={e => {
                    setLoginForm({ ...loginForm, username: e.target.value });
                    if (loginError) setLoginError('');
                  }}
                />
              </div>

              <div className="form-group">
                <label>비밀번호 (Password)</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={e => {
                    setLoginForm({ ...loginForm, password: e.target.value });
                    if (loginError) setLoginError('');
                  }}
                />
              </div>

              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="cancel-btn" onClick={() => setShowLoginModal(false)}>취소</button>
                <button type="submit" className="save-btn" disabled={loginLoading}>
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
