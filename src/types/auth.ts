export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  nombre_completo: string;
  linea_llamadas: string;
  linea_whatsapp: string;
  cuenta_numero: string;
  banco: string;
  titular_cuenta: string;
  correo_electronico: string;
  nivel: number;
  dni: string;
  nombre_usuario: string;
  password: string;
  codigo_referido?: string;
}