import assert from 'node:assert/strict';
import { INITIAL_FORM_DATA } from '../frontend/src/constants/fields.js';

function httpsOrigin(value, name) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${name} deve usar HTTPS.`);
  assert.ok(url.pathname === '/' && !url.username && !url.password &&
    !url.search && !url.hash, `${name} deve conter só a origem publicada.`);
  return url.origin;
}

async function request(url, options) {
  const response = await fetch(url, {
    ...options,
    redirect: 'error',
    signal: AbortSignal.timeout(90000),
  });
  assert.ok(response.ok, `${url} respondeu com HTTP ${response.status}.`);
  return response;
}

function checkCors(response, frontend) {
  assert.equal(response.headers.get('access-control-allow-origin'), frontend,
    'Inclua a origem exata do front em CORS_ORIGINS no Render.');
}

const frontend = httpsOrigin(process.env.FRONTEND_URL, 'FRONTEND_URL');
const api = httpsOrigin(process.env.API_URL, 'API_URL');
const homepage = await request(frontend);
const html = await homepage.text();
assert.match(html, /<title>HospPredict/i, 'A URL do front deve abrir o HospPredict.');
const asset = html.match(/<script[^>]+src="([^"]*\/assets\/[^"]+\.js)"[^>]*>/i)?.[1];
assert.ok(asset, 'O HTML publicado não aponta para o bundle do Vite.');
const bundleUrl = new URL(asset, frontend);
assert.equal(bundleUrl.origin, frontend, 'O bundle deve pertencer ao front publicado.');
const bundle = await request(bundleUrl);
assert.ok((await bundle.text()).includes(api),
  'Configure VITE_API_URL com a origem da API e refaça o deploy do front.');
console.log('Front publicado e configurado para a API informada.');

const health = await request(`${api}/health`, { headers: { Origin: frontend } });
checkCors(health, frontend);
const { status, model_loaded } = await health.json();
assert.equal(status, 'ok');
assert.equal(model_loaded, true, 'O modelo não está carregado.');
console.log('API respondeu e o modelo está pronto.');

const endpoint = `${api}/api/v1/predict/readmission-30d`;
const preflight = await request(endpoint, {
  method: 'OPTIONS',
  headers: {
    Origin: frontend,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type',
  },
});
checkCors(preflight, frontend);

const { is_first_admission: firstAdmission, ...payload } = INITIAL_FORM_DATA;
if (firstAdmission) payload.days_since_last_discharge = null;
const prediction = await request(endpoint, {
  method: 'POST',
  headers: { Origin: frontend, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
checkCors(prediction, frontend);
const result = await prediction.json();
assert.ok([0, 1].includes(result.predicted_class));
assert.ok(Number.isInteger(result.risk_score_percent) &&
  result.risk_score_percent >= 0 && result.risk_score_percent <= 100);
assert.ok(typeof result.model_version === 'string' && result.model_version);
console.log('Predição com dados sintéticos concluída com sucesso.');
