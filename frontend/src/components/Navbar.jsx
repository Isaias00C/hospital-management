import React from 'react';
import { Activity, ShieldCheck, AlertCircle, Info, Stethoscope, RefreshCw } from 'lucide-react';

export default function Navbar({ backendStatus, onRefreshHealth, onOpenModelInfo, onSelectPreset }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">HospPredict</span>
                <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-md font-semibold border border-teal-200">
                  ML 1.0 (Naive Bayes)
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Apoio à Decisão Clínica — Predição de Readmissão em 30 Dias (IFCE)
              </p>
            </div>
          </div>

          {/* Ações e Status */}
          <div className="flex items-center gap-3">
            {/* Status do Backend */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                backendStatus === 'ok'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'degraded'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : backendStatus === 'checking'
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'ok'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'degraded'
                    ? 'bg-amber-500'
                    : backendStatus === 'checking'
                    ? 'bg-slate-400 animate-spin'
                    : 'bg-rose-500'
                }`}
              />
              <span className="hidden md:inline">
                {backendStatus === 'ok'
                  ? 'API Conectada'
                  : backendStatus === 'degraded'
                  ? 'API Degradada (Sem Modelo)'
                  : backendStatus === 'checking'
                  ? 'Verificando Conexão...'
                  : 'API Offline'}
              </span>
              <button
                onClick={onRefreshHealth}
                title="Checar status da API novamente"
                className="hover:opacity-75 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Botão Sobre o Modelo */}
            <button
              onClick={onOpenModelInfo}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Critérios & Métricas</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
