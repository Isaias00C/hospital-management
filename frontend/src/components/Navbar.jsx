import { Activity, Info, RefreshCw } from 'lucide-react';

const labels = {
  ok: 'API conectada',
  checking: 'Verificando API',
  degraded: 'Modelo indisponível',
  offline: 'API offline',
};

export default function Navbar({ backendStatus, onRefreshHealth, onOpenModelInfo }) {
  return (
    <header className="app-header print:hidden">
      <div className="app-header-inner">
        <a className="brand" href="#topo" aria-label="HospPredict, início">
          <span className="brand-icon"><Activity size={22} aria-hidden="true" /></span>
          <span>HospPredict</span>
        </a>
        <nav className="site-nav" aria-label="Navegação principal">
          <a href="#avaliacao">Avaliação</a>
          <a href="#como-funciona">Como funciona</a>
        </nav>
        <div className="header-actions">
          <div className="api-indicator">
            <span role="status" className="api-label" data-status={backendStatus}>{labels[backendStatus]}</span>
            <button
              type="button"
              className="icon-action"
              aria-label="Verificar conexão da API"
              title="Verificar conexão da API"
              onClick={onRefreshHealth}
              disabled={backendStatus === 'checking'}
            >
              <RefreshCw size={15} aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="model-action" onClick={onOpenModelInfo} aria-label="Sobre o modelo">
            <Info size={17} aria-hidden="true" /> <span>Sobre o modelo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
