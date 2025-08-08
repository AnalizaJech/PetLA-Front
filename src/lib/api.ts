// API service for backend communication
// Backend API configuration
const API_BASE_URL = (() => {
  // En GitHub Codespaces, usar la URL pública del backend (puerto 5000 fijo)
  if (window.location.hostname.includes('github.dev') || window.location.hostname.includes('codespaces')) {
    // Extraer el nombre base del codespace y usar puerto 5000 para el backend
    const codespaceBase = window.location.hostname.replace(/-\d+\.app\.github\.dev$/, '');
    const backendUrl = `https://${codespaceBase}-5000.app.github.dev`;
    console.log('🏗️ Detectado GitHub Codespaces - usando URL pública del backend:', backendUrl);
    return backendUrl;
  }
  
  // Desarrollo local
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5000';
  }
  
  // Producción
  return 'https://api.petla.com';
})();

console.log('🔧 API_BASE_URL configurada:', API_BASE_URL);
console.log('🌍 window.location:', window.location.href);

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellidos?: string;
  username?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  genero?: string;
  documento?: string;
  tipoDocumento?: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    nombre: string;
    apellidos?: string;
    username?: string;
    email: string;
    telefono?: string;
    direccion?: string;
    fechaNacimiento?: string;
    genero?: string;
    rol: string;
    fechaRegistro?: string;
    foto?: string;
    documento?: string;
    tipoDocumento?: string;
    especialidad?: string;
    experiencia?: string;
    colegiatura?: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    // Asegurar que la base URL incluya /api
    this.baseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    console.log('🔧 API Service initialized with baseUrl:', this.baseUrl);
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
  }

  private saveTokensToStorage(tokens: { access_token: string; refresh_token: string }) {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    this.accessToken = tokens.access_token;
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('📡 Request URL:', url);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('📡 Raw response data:', data);
      
      // El backend ya devuelve el formato correcto {success, tokens, user}
      // Solo necesitamos mapear "user" y "tokens" a "data"
      if (data.success && (data.user || data.tokens)) {
        return {
          success: true,
          data: data as T
        };
      }
      
      // Para otras respuestas, usar el formato directo
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ mongo: boolean; status: string }> {
    try {
      // Health check está en la raíz, no en /api
      const healthUrl = this.baseUrl.replace('/api', '') + '/health';
      console.log('🏥 Health check URL:', healthUrl);
      const response = await fetch(healthUrl);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { mongo: false, status: 'error' };
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    console.log('🔍 API: Starting login request with:', { identifier: credentials.identifier, password: '***' });
    
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('🔍 API: Login response received:', response);

    if (response.success && response.data?.tokens) {
      console.log('✅ API: Saving tokens to localStorage');
      this.saveTokensToStorage(response.data.tokens);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.tokens) {
      this.saveTokensToStorage(response.data.tokens);
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await this.request<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.success && response.data?.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      this.accessToken = response.data.access_token;
    }

    return response;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.accessToken = null;
  }

  // Users
  async getUsers(filters?: { rol?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.rol) params.append('rol', filters.rol);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Mascotas
  async getMascotas(filters?: { clienteId?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.clienteId) params.append('clienteId', filters.clienteId);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = `/mascotas${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getMascota(id: string) {
    return this.request(`/mascotas/${id}`);
  }

  async createMascota(mascotaData: any) {
    return this.request('/mascotas', {
      method: 'POST',
      body: JSON.stringify(mascotaData),
    });
  }

  async updateMascota(id: string, updates: any) {
    return this.request(`/mascotas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMascota(id: string) {
    return this.request(`/mascotas/${id}`, {
      method: 'DELETE',
    });
  }

  // Citas
  async getCitas(filters?: { 
    clienteId?: string; 
    veterinarioId?: string; 
    estado?: string;
    fecha?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.clienteId) params.append('clienteId', filters.clienteId);
    if (filters?.veterinarioId) params.append('veterinarioId', filters.veterinarioId);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.fecha) params.append('fecha', filters.fecha);
    
    const queryString = params.toString();
    const endpoint = `/citas${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getCita(id: string) {
    return this.request(`/citas/${id}`);
  }

  async createCita(citaData: any) {
    return this.request('/citas', {
      method: 'POST',
      body: JSON.stringify(citaData),
    });
  }

  async updateCita(id: string, updates: any) {
    return this.request(`/citas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCita(id: string) {
    return this.request(`/citas/${id}`, {
      method: 'DELETE',
    });
  }

  // Historial Clínico
  async getHistorialMascota(mascotaId: string) {
    return this.request(`/historial/mascota/${mascotaId}`);
  }

  async createHistorialEntry(historialData: any) {
    return this.request('/historial', {
      method: 'POST',
      body: JSON.stringify(historialData),
    });
  }

  async updateHistorialEntry(id: string, updates: any) {
    return this.request(`/historial/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteHistorialEntry(id: string) {
    return this.request(`/historial/${id}`, {
      method: 'DELETE',
    });
  }

  // Notificaciones
  async getNotificaciones(usuarioId?: string) {
    const params = new URLSearchParams();
    if (usuarioId) params.append('usuarioId', usuarioId);
    
    const queryString = params.toString();
    const endpoint = `/notificaciones${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async createNotificacion(notificacionData: any) {
    return this.request('/notificaciones', {
      method: 'POST',
      body: JSON.stringify(notificacionData),
    });
  }

  async markNotificacionAsRead(id: string) {
    return this.request(`/notificaciones/${id}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotificacion(id: string) {
    return this.request(`/notificaciones/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
