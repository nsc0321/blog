import React, { useState, useEffect } from 'react';
import { Search, Database, Key, Plus, Trash2, Tag, ShieldAlert, Sparkles, Filter, RefreshCw, ChevronRight, ExternalLink, Award, User, ShoppingBag, BookOpen, Check, Layers, AlertCircle, FileText, Pin, TrendingUp, X, ArrowRight } from 'lucide-react';
import MabiAuctionChart from './MabiAuctionChart';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Official Nexon Mabinogi Auction Categories (73 categories)
const MABI_CATEGORIES = [
  "전체 카테고리 (전체)",
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
  const [selectedCategory, setSelectedCategory] = useState("전체 카테고리 (전체)");
  const [auctionSearchInput, setAuctionSearchInput] = useState('');
  const [isKeywordSearch, setIsKeywordSearch] = useState(false);
  const [auctionResults, setAuctionResults] = useState([]);
  const [nextCursor, setNextCursor] = useState('');
  const [auctionLoading, setAuctionLoading] = useState(false);

  // Trade History Modal States
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 2. DB Archive States
  const [itemArchives, setItemArchives] = useState([]);
  const [charArchives, setCharArchives] = useState([]);
  const [noteArchives, setNoteArchives] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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

    // Check array of option objects from Nexon API
    const rawOpts = item.item_option || item.options_list || item.raw_data?.item_option;
    if (Array.isArray(rawOpts) && rawOpts.length > 0) {
      rawOpts.forEach(o => {
        if (typeof o === 'object' && o !== null) {
          const type = o.option_type || o.type || '옵션';
          const subType = o.option_sub_type || o.sub_type || '';
          const val = o.option_value || o.value || o.option_value2 || '';
          const desc = o.option_desc || o.description || '';

          let label = [subType, val].filter(Boolean).join(' ');
          if (desc) label += ` (${desc})`;
          if (!label) label = type;

          list.push({ type, label });
        } else if (typeof o === 'string' && o.trim()) {
          list.push({ type: '옵션', label: o.trim() });
        }
      });
    }

    // String fallback if list is empty (e.g. "세공 1랭크 / 속성 6레벨 / S강 7단계")
    if (list.length === 0 && (item.option || item.item_option_json)) {
      const str = String(item.option || item.item_option_json);
      str.split('/').forEach(s => {
        const trimmed = s.trim();
        if (trimmed) {
          let type = '옵션';
          if (trimmed.includes('세공')) type = '세공';
          else if (trimmed.includes('인챈트')) type = '인챈트';
          else if (trimmed.includes('피어싱')) type = '피어싱';
          else if (trimmed.includes('에르그')) type = '에르그';
          else if (trimmed.includes('강화') || trimmed.includes('개조')) type = '개조';
          list.push({ type, label: trimmed });
        }
      });
    }

    return list;
  };

  // Modals state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Form States
  const [newItemForm, setNewItemForm] = useState({
    item_name: '',
    category: '무기',
    subcategory: '',
    price_estimate: '',
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
      }
    } catch (err) {
      console.error('Auction search error:', err);
    } finally {
      setAuctionLoading(false);
    }
  };

  // Item Click -> Open Trade History Modal & Fetch History Data
  const handleItemClickForHistory = async (item) => {
    setSelectedItemHistory(item);
    setHistoryLoading(true);
    setHistoryData([]);

    try {
      const headers = { 'ngrok-skip-browser-warning': 'true' };
      if (apiKey) headers['x-nxopen-api-key'] = apiKey;

      let categoryParam = item.category || (selectedCategory.includes("전체") ? "" : selectedCategory);
      const params = [];
      if (item.item_name) params.push(`item_name=${encodeURIComponent(item.item_name)}`);
      if (categoryParam) params.push(`auction_item_category=${encodeURIComponent(categoryParam)}`);

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const url = `${API_BASE}/api/mabinogi/auction/history${queryString}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data.history || []);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

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

              {/* Auction Results Table */}
              <div className="auction-results-header">
                <span className="results-count">조회 결과: {auctionResults.length}개 매물 (아이템 클릭 시 거래 내역 차트 확인)</span>
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
                    {auctionResults.length > 0 ? (
                      auctionResults.map((item, idx) => (
                        <tr key={idx} className="clickable-row" onClick={() => handleItemClickForHistory(item)}>
                          <td className="font-bold item-name-cell">
                            <span className="item-title">{item.item_name}</span>
                          </td>
                          <td><span className="category-badge">{item.category || selectedCategory}</span></td>
                          <td className="price-text">{getItemPrice(item).toLocaleString()} 골드</td>
                          <td>{item.item_count || 1}개</td>
                          <td className="option-text">{item.option || item.item_option_json || '-'}</td>
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
          <div className="tab-toolbar">
            <div className="filter-group">
              <Filter size={16} />
              {['ALL', '무기', '방어구', '인챈트', '에르그', '기타'].map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'ALL' ? '전체 보기' : cat}
                </button>
              ))}
            </div>

            <button className="create-archive-btn" onClick={() => setShowAddItemModal(true)}>
              <Plus size={16} />
              <span>새 아이템 아카이브 수집</span>
            </button>
          </div>

          <div className="archive-cards-grid">
            {filteredItems.map(item => (
              <div className="archive-item-card" key={item.id}>
                <div className="card-top">
                  <span className="category-pill">{item.category}</span>
                  <button className="delete-mini-btn" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4>{item.item_name}</h4>
                <p className="desc">{item.description || '상세 정보 없음'}</p>
                {item.price_estimate && (
                  <div className="price-tag">
                    <span className="k">예상 시세:</span>
                    <span className="v">{item.price_estimate}</span>
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
                <p>등록된 아이템 아카이브가 없습니다. 새로운 항목을 추가해보세요.</p>
              </div>
            )}
          </div>
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

      {/* TRADE HISTORY & DETAIL UNIFIED MODAL WITH INTERACTIVE CHART */}
      {selectedItemHistory && (
        <div className="modal-overlay history-modal-overlay" onClick={() => setSelectedItemHistory(null)}>
          <div className="history-modal-container unified-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <TrendingUp size={22} className="modal-icon" />
                <div>
                  <h3>[{selectedItemHistory.item_name}] 실시간 시세 및 거래 정보</h3>
                  <span className="modal-sub">Nexon Open API 실시간 거래 내역 & 아이템 옵션 분석</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedItemHistory(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body scrollable-modal-body">
              {historyLoading ? (
                <div className="history-loading-box">
                  <RefreshCw size={28} className="spin" />
                  <p>거래 내역 및 아이템 상세 데이터를 불러오는 중입니다...</p>
                </div>
              ) : (
                <div className="unified-modal-content">
                  {/* TOP SECTION: Interactive Dual Axis Chart */}
                  <div className="modal-section-block">
                    <MabiAuctionChart
                      itemName={selectedItemHistory.item_name}
                      historyData={historyData}
                    />
                  </div>

                  {/* TOP SECTION: Transaction History Log Table */}
                  <div className="history-table-section modal-section-block">
                    <h4>최근 실시간 체결 및 거래 기록 ({historyData.length}건)</h4>
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
                          {historyData.map((h, idx) => (
                            <tr key={idx}>
                              <td className="date-cell">{h.date_auction_buy || h.recorded_at}</td>
                              <td className="price-text font-bold">{getItemPrice(h).toLocaleString()} 골드</td>
                              <td>{h.item_count || 1}개</td>
                              <td>{h.seller || '익명'}</td>
                              <td className="option-text">{h.option || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* BOTTOM SECTION: Item Details & Extra Options Breakdown */}
                  <div className="item-details-panel modal-section-block">
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
                        <Database size={15} />
                        <span>내 DB 아카이브에 수집 저장</span>
                      </button>
                    </div>

                    <div className="detail-metrics-grid">
                      <div className="metric-card">
                        <span className="k">평균 시세</span>
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
                        <span className="k">판매 등록 수량</span>
                        <span className="v">{selectedItemHistory.item_count || 1} 개</span>
                      </div>
                    </div>

                    {/* EXTRA OPTIONS & REFORGE / ENCHANT BADGES LIST */}
                    <div className="detail-section-box">
                      <h4>아이템 세부 세공 / 인챈트 / 추가 옵션 정보</h4>
                      {getItemOptionsList(selectedItemHistory).length > 0 ? (
                        <div className="option-badges-grid">
                          {getItemOptionsList(selectedItemHistory).map((opt, i) => (
                            <div className="option-badge-item" key={i}>
                              <span className={`opt-type-tag ${opt.type}`}>{opt.type}</span>
                              <span className="opt-label-text">{opt.label}</span>
                            </div>
                          ))}
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
                </div>
              )}
            </div>
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

              <div className="form-row">
                <div className="form-group">
                  <label>카테고리</label>
                  <select
                    value={newItemForm.category}
                    onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="무기">무기</option>
                    <option value="방어구">방어구</option>
                    <option value="인챈트">인챈트</option>
                    <option value="에르그">에르그</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>예상 시세</label>
                  <input
                    type="text"
                    placeholder="예: 45,000,000 골드"
                    value={newItemForm.price_estimate}
                    onChange={e => setNewItemForm({ ...newItemForm, price_estimate: e.target.value })}
                  />
                </div>
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
    </div>
  );
}
