/**
 * Capa Base de Conexión HTTP con el Backend REST API
 * Inyecta tokens Bearer automáticamente y normaliza respuestas y errores.
 */

const API_BASE_URL = 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('hit_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE_URL}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (err) {
    throw new ApiError(
      'No se pudo conectar con el servidor backend en ' + API_BASE_URL + '. Asegúrate de que el servidor esté activo.',
      0
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `Error HTTP ${response.status}`;
    const errorDetails = data?.details || null;

    // Si recibimos 401 y hay token guardado, puede haber expirado
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  return data;
};

