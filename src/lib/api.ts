import { useAuthStore } from '../store/authStore';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function handleResponse(res: Response) {
  if (res.status === 401) {
    // token inválido / no es el último -> forzar logout en el cliente
    try {
      useAuthStore.getState().logout();
    } catch (e) {
      console.error('Error during auto-logout', e);
    }
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  let body: any = text;
  if (contentType.includes('application/json') && text) {
    try { body = JSON.parse(text); } catch (e) { body = text; }
  }

  if (!res.ok) {
    const err: any = new Error(body && body.message ? body.message : 'API Error');
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const res = await fetch(url, { ...options, headers });
  return handleResponse(res);
}

export const apiGet = (path: string, options: RequestInit = {}) => apiRequest(path, { ...options, method: 'GET' });
export const apiPost = (path: string, body?: any, options: RequestInit = {}) => apiRequest(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const apiPut = (path: string, body?: any, options: RequestInit = {}) => apiRequest(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined });
export const apiPatch = (path: string, body?: any, options: RequestInit = {}) => apiRequest(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
export const apiDelete = (path: string, options: RequestInit = {}) => apiRequest(path, { ...options, method: 'DELETE' });
