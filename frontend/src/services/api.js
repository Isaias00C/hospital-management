/**
 * Serviço de comunicação com o Backend FastAPI.
 * Respeita a URL configurada em VITE_API_URL e inclui tratamento para:
 * - Cold start (plano gratuito que dorme)
 * - Erros de validação (422)
 * - Serviço temporariamente indisponível (503)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { status: 'error', httpStatus: res.status };
    }
    const data = await res.json();
    return { status: 'ok', data };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      status: 'offline',
      error: err.name === 'AbortError' ? 'Timeout ao conectar' : 'Backend indisponível'
    };
  }
}

export async function requestPrediction(formData, onSlowWarning) {
  const controller = new AbortController();

  // Se demorar mais de 4s, aciona aviso de "acordando servidor"
  const slowWarningTimer = setTimeout(() => {
    if (onSlowWarning) onSlowWarning(true);
  }, 4000);

  // Timeout total de 45 segundos para servidores em cold start (Render / Vercel)
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/predict/readmission-30d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: controller.signal,
    });

    clearTimeout(slowWarningTimer);
    clearTimeout(timeoutId);
    if (onSlowWarning) onSlowWarning(false);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: 'Erro desconhecido do servidor.' };
      }

      if (response.status === 422) {
        return {
          success: false,
          status: 422,
          message: 'Dados inválidos no formulário.',
          details: errorData.detail || errorData,
        };
      }

      if (response.status === 503) {
        return {
          success: false,
          status: 503,
          message: 'Modelo de machine learning indisponível no servidor.',
          details: errorData.detail,
        };
      }

      return {
        success: false,
        status: response.status,
        message: errorData.detail || `Erro na requisição (${response.status})`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    clearTimeout(slowWarningTimer);
    clearTimeout(timeoutId);
    if (onSlowWarning) onSlowWarning(false);

    if (err.name === 'AbortError') {
      return {
        success: false,
        status: 408,
        message: 'A requisição demorou muito para responder (timeout de 45s). Se o servidor estiver iniciando, tente novamente em alguns instantes.',
      };
    }

    return {
      success: false,
      status: 0,
      message: 'Não foi possível conectar ao backend. Verifique se o servidor está em execução em ' + API_BASE_URL,
    };
  }
}
