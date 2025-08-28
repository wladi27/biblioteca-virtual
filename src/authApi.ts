import { useAuthStore } from './store/authStore';

export const login = (token: string) => {
  useAuthStore.getState().login(token);
};

export const logout = () => {
  useAuthStore.getState().logout();
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    logout();
    // Throw an error to stop the promise chain
    throw new Error('Autenticación fallida');
  }

  return response;
};