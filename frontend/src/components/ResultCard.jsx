import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Printer,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function ResultCard({ result, formData, onReset }) {
  if (!result) return null;

  const isHighRisk = result.predicted_class === 1;
  const riskScore = result.risk_score_percent;
  const p0 = (result.probabilities['0'] * 100).toFixed(1);
  const p1 = (result.probabilities['1'] * 100).toFixed(1);

  // Fatores de risco observados no paciente para enriquecer a devolutiva clínica
  const observedFactors = [];
  if (formData.age >= 65) observedFactors.push(`Idoso (${formData.age} anos)`);
  if (formData.charlson_comorbidity_index >= 3)
    observedFactors.push(`CCI elevado (${formData.charlson_comorbidity_index})`);
  if (formData.num_medications >= 5)
    observedFactors.push(`Polifarmácia (${formData.num_medications} fármacos)`);
  if (formData.has_high_risk_med === 1) observedFactors.push('Uso de medicação de alto risco');
  if (formData.has_anticoagulant === 1) observedFactors.push('Terapia anticoagulante');
  if (formData.revisit_count > 0)
    observedFactors.push(`Histórico de ${formData.revisit_count} revisita(s)`);
  if (formData.spo2 < 95) observedFactors.push(`SpO₂ limítrofe (${formData.spo2}%)`);
  if (formData.creatinine > 1.3) observedFactors.push(`Creatinina elevada (${formData.creatinine} mg/dL)`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="resultado-clinico"
      className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Top Banner de Status */}
      <div
        className={`p-6 sm:p-8 text-white ${
          isHighRisk
            ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              {isHighRisk ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
                  Resultado da Inferência
                </span>
                <span className="text-xs text-white/80 font-mono">
                  v{result.model_version || '1.0'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {result.class_label}
              </h2>
              <p className="text-sm text-white/90 mt-0.5">
                {isHighRisk
                  ? 'Paciente elegível para o Protocolo de Prevenção de Readmissão Hospitalar.'
                  : 'Paciente com parâmetros estáveis, elegível para alta padrão.'}
              </p>
            </div>
          </div>

          {/* Score Circular / Grande */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center shrink-0 min-w-[140px]">
            <span className="text-xs uppercase font-medium tracking-wider text-white/80 block">
              Score de Risco
            </span>
            <div className="text-4xl font-black tracking-tight mt-1">
              {riskScore}%
            </div>
            <span className="text-[11px] text-white/80 block mt-0.5 font-medium">
              Probabilidade de Readmissão
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Barras de Probabilidades */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Distribuição de Probabilidades do Modelo Naive Bayes
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">P(Sem Readmissão em 30d):</span>
                <span className="text-emerald-700">{p0}%</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${p0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">P(Readmissão em ≤30d):</span>
                <span className={isHighRisk ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                  {p1}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isHighRisk ? 'bg-rose-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${p1}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recomendação Clínica Acionável */}
        <div
          className={`rounded-xl p-5 border ${
            isHighRisk
              ? 'bg-rose-50/60 border-rose-200 text-rose-950'
              : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                isHighRisk ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Conduta Clínica Recomendada
              </h4>
              <p className="text-sm font-medium mt-1 leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Fatores Contribuintes Observados */}
        {observedFactors.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Sinais e Fatores de Risco Identificados na Entrada
            </h4>
            <div className="flex flex-wrap gap-2">
              {observedFactors.map((factor, index) => (
                <span
                  key={index}
                  className="badge-chip bg-slate-100 text-slate-800 border border-slate-300/80"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ações / Botões */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Nova Avaliação / Limpar
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório Clínico
          </button>
        </div>
      </div>
    </div>
  );
}
