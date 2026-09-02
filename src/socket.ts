import { useAuthStore } from './store/authStore';

let ws: WebSocket | null = null;

export const initSocket = (token: string) => {
  if (ws) {
    ws.close();
  }

  // Obtener URL de WebSocket de variables de entorno o derivar de la API
  let wsUrl = import.meta.env.VITE_WS_URL;
  if (!wsUrl) {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_URL_LOCAL || window.location.origin;
    const isHttps = apiUrl.startsWith('https') || window.location.protocol === 'https:';
    const wsProtocol = isHttps ? 'wss:' : 'ws:';
    const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    wsUrl = `${wsProtocol}//${host}`;
  }

  try {
    ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      console.log('✅ Conectado al servidor de WebSockets');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'FORCE_LOGOUT') {
          console.log('Sesión cerrada forzosamente desde otro dispositivo.');
          alert(data.message || 'Tu sesión ha sido cerrada porque has iniciado sesión en otro dispositivo.');
          useAuthStore.getState().logout();
        }
      } catch (e) {
        console.error('Error procesando mensaje WebSocket:', e);
      }
    };

    ws.onclose = () => {
      console.log('Desconectado del servidor de WebSockets');
    };

    ws.onerror = (error) => {
      console.warn('WebSocket warning/error:', error);
    };
  } catch (error) {
    console.error('Error inicializando WebSocket:', error);
  }
};

export const disconnectSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};