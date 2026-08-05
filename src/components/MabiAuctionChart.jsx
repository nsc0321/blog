import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Calendar, BarChart2, TrendingUp, Info } from 'lucide-react';

export default function MabiAuctionChart({ itemName, historyData = [] }) {
  // Time unit scale: 'hour', 'day', 'month', 'year' (Default: 'month')
  const [timeScale, setTimeScale] = useState('month');

  // Zoom / Viewport State (start index, end index)
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 }); // percentages 0% to 100%
  const [hoverData, setHoverData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const containerRef = useRef(null);

  // Group raw history records based on selected timeScale ('hour', 'day', 'month', 'year')
  const groupedData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    // Sort history by timestamp ascending
    const sorted = [...historyData].sort((a, b) => {
      const tA = new Date(a.date_auction_buy || a.recorded_at).getTime();
      const tB = new Date(b.date_auction_buy || b.recorded_at).getTime();
      return tA - tB;
    });

    const map = new Map();

    sorted.forEach(item => {
      const dateObj = new Date(item.date_auction_buy || item.recorded_at);
      if (isNaN(dateObj.getTime())) return;

      let key = '';
      if (timeScale === 'year') {
        key = `${dateObj.getFullYear()}년`;
      } else if (timeScale === 'month') {
        key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      } else if (timeScale === 'day') {
        key = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      } else if (timeScale === 'hour') {
        key = `${String(dateObj.getDate()).padStart(2, '0')}일 ${String(dateObj.getHours()).padStart(2, '0')}:00`;
      }

      const price = item.item_buy_price || item.price || 0;
      const count = item.item_count || 1;

      if (!map.has(key)) {
        map.set(key, {
          label: key,
          timestamp: dateObj.getTime(),
          prices: [price],
          totalPrice: price * count,
          totalVolume: count,
          count: 1
        });
      } else {
        const entry = map.get(key);
        entry.prices.push(price);
        entry.totalPrice += price * count;
        entry.totalVolume += count;
        entry.count += 1;
      }
    });

    // Calculate avg, min, max for each grouped time bucket
    return Array.from(map.values()).map(d => ({
      label: d.label,
      timestamp: d.timestamp,
      avgPrice: Math.round(d.totalPrice / d.totalVolume),
      minPrice: Math.min(...d.prices),
      maxPrice: Math.max(...d.prices),
      totalVolume: d.totalVolume,
      count: d.count
    }));
  }, [historyData, timeScale]);

  // Reset zoom on timeScale change
  useEffect(() => {
    setZoomRange({ start: 0, end: 100 });
  }, [timeScale, historyData]);

  // Slice visible data according to zoomRange
  const visibleData = useMemo(() => {
    if (groupedData.length === 0) return [];
    const total = groupedData.length;
    const startIdx = Math.floor((zoomRange.start / 100) * total);
    const endIdx = Math.max(startIdx + 2, Math.ceil((zoomRange.end / 100) * total));
    return groupedData.slice(startIdx, endIdx);
  }, [groupedData, zoomRange]);

  // Non-passive native wheel listener to isolate scroll from parent modal & page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelNative = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? -8 : 8; // negative deltaY is scroll up (zoom in)

      setZoomRange(prev => {
        let newStart = prev.start - zoomFactor;
        let newEnd = prev.end + zoomFactor;

        // Bound checks (minimum 15% span)
        if (newEnd - newStart < 15) {
          const center = (prev.start + prev.end) / 2;
          newStart = center - 7.5;
          newEnd = center + 7.5;
        }

        if (newStart < 0) newStart = 0;
        if (newEnd > 100) newEnd = 100;

        return { start: newStart, end: newEnd };
      });
    };

    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, []);

  // Drag Pan handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    setDragStartX(e.clientX);

    const shiftPercent = (deltaX / (containerRef.current?.offsetWidth || 500)) * -50;

    setZoomRange(prev => {
      const span = prev.end - prev.start;
      let newStart = prev.start + shiftPercent;
      let newEnd = prev.end + shiftPercent;

      if (newStart < 0) {
        newStart = 0;
        newEnd = span;
      }
      if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - span;
      }

      return { start: newStart, end: newEnd };
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 320;
  const padding = { top: 30, right: 60, bottom: 40, left: 70 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // Min/Max calculations for dual Y axis
  const maxPrice = useMemo(() => {
    if (visibleData.length === 0) return 100;
    return Math.max(...visibleData.map(d => d.maxPrice)) * 1.1;
  }, [visibleData]);

  const minPrice = useMemo(() => {
    if (visibleData.length === 0) return 0;
    const min = Math.min(...visibleData.map(d => d.minPrice));
    return Math.max(0, min * 0.9);
  }, [visibleData]);

  const maxVolume = useMemo(() => {
    if (visibleData.length === 0) return 10;
    return Math.max(...visibleData.map(d => d.totalVolume)) * 1.25;
  }, [visibleData]);

  // Coordinate mappers
  const getX = (idx) => {
    if (visibleData.length <= 1) return padding.left + chartW / 2;
    return padding.left + (idx / (visibleData.length - 1)) * chartW;
  };

  const getYPrice = (val) => {
    if (maxPrice === minPrice) return padding.top + chartH / 2;
    return padding.top + chartH - ((val - minPrice) / (maxPrice - minPrice)) * chartH;
  };

  const getYVolume = (val) => {
    if (maxVolume === 0) return padding.top + chartH;
    return padding.top + chartH - (val / maxVolume) * (chartH * 0.45); // volume occupies bottom 45%
  };

  // Generate SVG Price Path
  const pricePathD = useMemo(() => {
    if (visibleData.length === 0) return '';
    return visibleData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYPrice(d.avgPrice)}`).join(' ');
  }, [visibleData, maxPrice, minPrice]);

  const priceAreaD = useMemo(() => {
    if (visibleData.length === 0) return '';
    const path = visibleData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYPrice(d.avgPrice)}`).join(' ');
    const lastX = getX(visibleData.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + chartH;
    return `${path} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [visibleData, maxPrice, minPrice]);

  return (
    <div className="mabi-chart-wrapper">
      {/* Chart Control Toolbar */}
      <div className="chart-toolbar">
        <div className="toolbar-left">
          <TrendingUp size={18} className="chart-icon" />
          <h4 className="chart-title">{itemName} 실시간/히스토리 시세 차트</h4>
        </div>

        {/* Time Scale Buttons */}
        <div className="scale-selector">
          <span className="scale-label"><Calendar size={13} /> 기준 축:</span>
          {[
            { key: 'year', label: '년' },
            { key: 'month', label: '월 (기본)' },
            { key: 'day', label: '일' },
            { key: 'hour', label: '시간' }
          ].map(s => (
            <button
              key={s.key}
              className={`scale-btn ${timeScale === s.key ? 'active' : ''}`}
              onClick={() => setTimeScale(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="zoom-actions">
          <button className="zoom-btn" onClick={() => setZoomRange(p => ({ start: Math.min(p.start + 10, 40), end: Math.max(p.end - 10, 60) }))} title="줌 인 (확대)">
            <ZoomIn size={14} />
          </button>
          <button className="zoom-btn" onClick={() => setZoomRange(p => ({ start: Math.max(p.start - 10, 0), end: Math.min(p.end + 10, 100) }))} title="줌 아웃 (축소)">
            <ZoomOut size={14} />
          </button>
          <button className="zoom-btn" onClick={() => setZoomRange({ start: 0, end: 100 })} title="초기화">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="chart-hint">
        <Info size={13} />
        <span>마우스 스크롤 휠로 **줌 인/아웃(확대/축소)** 하거나 드래그하여 시점을 이동할 수 있습니다.</span>
      </div>

      {/* SVG Interactive Dual Axis Chart */}
      <div
        className="svg-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {visibleData.length > 0 ? (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chart-svg">
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + chartH * ratio;
              const priceVal = Math.round(maxPrice - ratio * (maxPrice - minPrice));
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">
                    {(priceVal / 10000).toLocaleString()}만
                  </text>
                </g>
              );
            })}

            {/* Volume Bars (Right Axis) */}
            {visibleData.map((d, i) => {
              const x = getX(i);
              const barW = Math.max(4, (chartW / visibleData.length) * 0.45);
              const yVol = getYVolume(d.totalVolume);
              const hVol = padding.top + chartH - yVol;
              return (
                <rect
                  key={i}
                  x={x - barW / 2}
                  y={yVol}
                  width={barW}
                  height={hVol}
                  fill="rgba(56, 189, 248, 0.35)"
                  rx="2"
                />
              );
            })}

            {/* Area & Price Line */}
            <path d={priceAreaD} fill="url(#priceGradient)" />
            <path d={pricePathD} fill="none" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round" />

            {/* Price Points & Interactive Hover Circles */}
            {visibleData.map((d, i) => {
              const cx = getX(i);
              const cy = getYPrice(d.avgPrice);
              const isHovered = hoverData?.label === d.label;
              return (
                <g key={i} onMouseEnter={() => setHoverData(d)}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 7 : 4}
                    fill={isHovered ? "#38bdf8" : "#8b5cf6"}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 3 : 1.5}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  />
                  {/* X Axis Labels */}
                  <text x={cx} y={svgHeight - 12} textAnchor="middle" fill="#94a3b8" fontSize="11">
                    {d.label}
                  </text>
                </g>
              );
            })}

            {/* Y2 Volume Axis Text */}
            <text x={svgWidth - 10} y={padding.top} textAnchor="end" fill="#38bdf8" fontSize="10" fontWeight="bold">
              거래량 (개)
            </text>
            <text x={10} y={padding.top} textAnchor="start" fill="#a78bfa" fontSize="10" fontWeight="bold">
              가격 (골드)
            </text>
          </svg>
        ) : (
          <div className="empty-chart-msg">
            <BarChart2 size={32} />
            <span>선택한 기간 내 거래 내역 데이터가 존재하지 않습니다.</span>
          </div>
        )}
      </div>

      {/* Hover Info Tooltip & Highlights */}
      {hoverData && (
        <div className="chart-tooltip-box">
          <div className="tooltip-header">
            <span className="tooltip-date">🗓️ {hoverData.label}</span>
            <span className="tooltip-count">거래 {hoverData.count}건 ({hoverData.totalVolume}개)</span>
          </div>
          <div className="tooltip-metrics">
            <div className="m-item">
              <span className="lbl">평균 거래가</span>
              <span className="val purple">{hoverData.avgPrice.toLocaleString()} 골드</span>
            </div>
            <div className="m-item">
              <span className="lbl">최저 / 최고가</span>
              <span className="val">{hoverData.minPrice.toLocaleString()} ~ {hoverData.maxPrice.toLocaleString()}</span>
            </div>
            <div className="m-item">
              <span className="lbl">총 거래량</span>
              <span className="val blue">{hoverData.totalVolume} 개</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
