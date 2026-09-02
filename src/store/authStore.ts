import { create } from 'zustand';
import { disconnectSocket } from '../socket';

interface UserData {
  _id?: string;
  id?: string;
  nombre_completo?: string;
  nombre_usuario?: string;
  correo_electronico?: string;
  rol?: string;
  nivel?: number;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user?: UserData) => void;
  logout: () => void;
  setUser: (user: UserData) => void;
}

const getStoredUser = (): UserData | null => {
  try {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialUser = getStoredUser();
const initialToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken,
  isAdmin: initialUser?.rol === 'admin' || localStorage.getItem('isAdmin') === 'true',
  login: (token: string, user?: UserData) => {
    localStorage.setItem('token', token);
    const resolvedUser = user || getStoredUser();
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
      if (user.rol === 'admin') {
        localStorage.setItem('isAdmin', 'true');
      }
    }
    set({
      token,
      user: resolvedUser,
      isAuthenticated: true,
      isAdmin: resolvedUser?.rol === 'admin' || localStorage.getItem('isAdmin') === 'true'
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('isAdmin');
    disconnectSocket();
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
  },
  setUser: (user: UserData) => {
    localStorage.setItem('usuario', JSON.stringify(user));
    set({ user, isAdmin: user.rol === 'admin' });
  }
}));