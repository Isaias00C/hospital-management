const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

function requestSignal(signal, controller) {
  return signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
}

export async function checkBackendHealth(signal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: { Accept: 'application/json' },
      signal: requestSignal(signal, controller),
    });
    if (!response.ok) return 'offline';
    const data = await response.json();
    if (data?.status === 'ok' && data.model_loaded === true) return 'ok';
    if (data?.status === 'degraded' || data?.model_loaded === false) return 'degraded';
    return 'offline';
  } catch {
    return 'offline';
  } finally {
    clearTimeout(timeout);
  }
}

function validPrediction(data) {
  const validProbability = (value) => Number.isFinite(value) && value >= 0 && value <= 1;
  return data && [0, 1].includes(data.predicted_class) &&
    typeof data.class_label === 'string' && typeof data.recommendation === 'string' &&
    typeof data.model_version === 'string' && validProbability(data.risk_score_percent / 100) &&
    Number.isFinite(data.risk_score_percent) && validProbability(data.probabilities?.['0']) &&
    validProbability(data.probabilities?.['1']);
}

export async function requestPrediction(formData, signal, onSlowWarning) {
  const controller = new AbortController();
  const slowTimer = setTimeout(() => onSlowWarning?.(), 4000);
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/predict/readmission-30d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(formData),
      signal: requestSignal(signal, controller),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (error.name === 'AbortError') throw error;
    }
    if (response.status === 422) {
      return { success: false, status: 422, message: 'Revise os dados do formulário.', details: data?.detail };
    }
    if (response.status === 503 && typeof data?.detail === 'string') {
      return { success: false, status: 503, message: 'A API respondeu, mas o modelo está indisponível.' };
    }
    if (!response.ok) {
      return { success: false, status: response.status, message: 'A API não conseguiu processar a avaliação. Verifique se o backend está disponível e tente novamente.' };
    }
    if (!validPrediction(data)) {
      return { success: false, status: response.status, message: 'A API enviou uma resposta inesperada. Confira a configuração do backend.' };
    }
    return { success: true, data };
  } catch {
    if (controller.signal.aborted) {
      return { success: false, status: 408, message: 'A API demorou mais de 60 segundos para responder. Tente novamente.' };
    }
    return { success: false, status: 0, message: 'Não foi possível conectar à API. Confira a configuração e se o backend está rodando.' };
  } finally {
    clearTimeout(slowTimer);
    clearTimeout(timeout);
  }
}
