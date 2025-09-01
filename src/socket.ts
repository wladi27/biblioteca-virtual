import { useAuthStore } from './store/authStore';

let ws: WebSocket | null = null;

export const initSocket = (token: string) => {
  if (ws) {
    ws.close();
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//api-bv-backend-glxpqf-28ec37-72-60-70-200.traefik.me?token=${token}`);

  ws.onopen = () => {
    console.log('Conectado al servidor de WebSockets');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'FORCE_LOGOUT') {
      console.log('Sesión cerrada forzosamente desde otro dispositivo.');
      alert(data.message || 'Tu sesión ha sido cerrada porque has iniciado sesión en otro dispositivo.');
      useAuthStore.getState().logout(); // Call the logout action from the store
    }
  };

  ws.onclose = () => {
    console.log('Desconectado del servidor de WebSockets');
  };

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };
};

export const disconnectSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};