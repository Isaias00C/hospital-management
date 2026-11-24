import { FileDown, RotateCcw } from 'lucide-react';

const formatPercent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function ProbabilityRow({ label, value, tone }) {
  return (
    <div className="probability-row">
      <div><span>{label}</span><strong>{formatPercent.format(value)}</strong></div>
      <div className="probability-track" aria-hidden="true">
        <span className={'probability-fill ' + tone} style={{ width: (value * 100) + '%' }} />
      </div>
    </div>
  );
}

export default function ResultCard({ result, formData, onReset }) {
  const factors = [];
  if (formData.age >= 65) factors.push(formData.age + ' anos');
  if (formData.charlson_comorbidity_index >= 3) factors.push('Charlson: ' + formData.charlson_comorbidity_index);
  if (formData.num_medications >= 5) factors.push('Polifarmácia: ' + formData.num_medications + ' fármacos');
  if (formData.has_high_risk_med === 1) factors.push('Medicação de alto risco');
  if (formData.has_anticoagulant === 1) factors.push('Terapia anticoagulante');
  if (formData.revisit_count > 0) factors.push('Revisitas anteriores: ' + formData.revisit_count);
  if (formData.spo2 < 95) factors.push('SpO₂: ' + formData.spo2 + '%');
  if (formData.creatinine > 1.3) factors.push('Creatinina: ' + formData.creatinine + ' mg/dL');

  return (
    <section className="result-panel" id="resultado-clinico" tabIndex={-1} aria-labelledby="result-title">
      <header className="result-header">
        <div>
          <p className="workspace-kicker">Resultado da avaliação</p>
          <h2 id="result-title">{result.class_label}</h2>
          <p>Readmissão em até 30 dias · Modelo v{result.model_version}</p>
        </div>
        <div className={'result-score ' + (result.predicted_class === 1 ? 'risk-high' : 'risk-low')}>
          <strong>{result.risk_score_percent}%</strong>
          <span>Risco estimado</span>
        </div>
      </header>

      <div className="result-body">
        <div className="probabilities">
          <h3>Probabilidades estimadas</h3>
          <ProbabilityRow label="Sem readmissão" value={result.probabilities['0']} tone="fill-muted" />
          <ProbabilityRow label="Com readmissão" value={result.probabilities['1']} tone={result.predicted_class === 1 ? 'fill-high' : 'fill-accent'} />
        </div>
        <div className="result-note">
          <h3>Sugestão do sistema</h3>
          <p>{result.recommendation}</p>
          <p className="result-disclaimer">Demonstração acadêmica. O resultado não determina a conduta clínica.</p>
        </div>
        {factors.length > 0 && (
          <div className="result-factors">
            <h3>Dados observados na avaliação</h3>
            <ul>{factors.map((factor) => <li key={factor}>{factor}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="form-actions print:hidden">
        <button type="button" className="button-secondary" onClick={onReset}><RotateCcw size={16} aria-hidden="true" /> Nova avaliação</button>
        <button type="button" className="button-primary" onClick={() => window.print()}><FileDown size={17} aria-hidden="true" /> Imprimir relatório</button>
      </div>
    </section>
  );
}
