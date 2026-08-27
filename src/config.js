// Central API Configuration & Connection Helper
export const DEFAULT_FALLBACK_API = 'https://ragweed-blighted-skylight.ngrok-free.dev';

export function getApiBase() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('custom_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )) {
    return DEFAULT_FALLBACK_API;
  }

  return '';
}

export function setCustomApiBase(url) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('custom_api_url', url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('custom_api_url');
    }
  }
}

export function getCustomApiBase() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('custom_api_url') || '';
  }
  return '';
}

export async function testApiConnection(targetUrl) {
  const base = (targetUrl !== undefined ? targetUrl : getApiBase()).replace(/\/+$/, '');
  if (!base) {
    return { ok: false, error: 'API 주소가 설정되지 않았습니다.' };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(`${base}/api/trading/status`, {
      signal: controller.signal,
      headers: {
        'ngrok-skip-browser-warning': '69420'
      }
    });
    clearTimeout(timeoutId);
    if (resp.ok || resp.status === 401) {
      return { ok: true, status: resp.status };
    }
    return { ok: false, status: resp.status, error: `서버 응답 상태 코드: ${resp.status}` };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? '연결 시간 초과 (Timeout)' : (err.message || '연결 실패') };
  }
}
