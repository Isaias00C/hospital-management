import { ArrowRight, FlaskConical, X } from 'lucide-react';
import { CLINICAL_PRESETS } from '../constants/fields';

function CaseOptions({ onSelect, formData, detailed = false }) {
  return (
    <div className={detailed ? 'case-dialog-options' : 'sample-options'}>
      {CLINICAL_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          aria-pressed={formData === preset.data}
          onClick={() => onSelect(preset)}
        >
          <span>
            <strong>{preset.title.split(' (')[0]}</strong>
            {detailed && <span className="case-description">{preset.description}</span>}
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function ExampleCases({ onSelect, formData, assessmentStarted }) {
  return (
    <section className="example-panel" aria-labelledby="example-title">
      <div className="example-heading">
        <span className="guide-icon"><FlaskConical size={19} aria-hidden="true" /></span>
        <h3 id="example-title">Casos de exemplo</h3>
      </div>
      <p>{assessmentStarted
        ? 'Ao escolher um caso, os dados do formulário são substituídos.'
        : 'Escolha um caso fictício para preencher o formulário.'}</p>
      <CaseOptions onSelect={onSelect} formData={formData} />
    </section>
  );
}

export function ExampleCaseDialog({ dialogRef, onSelect, formData, assessmentStarted }) {
  return (
    <dialog
      className="case-dialog print:hidden"
      id="case-picker"
      ref={dialogRef}
      aria-labelledby="case-dialog-title"
      aria-describedby="case-dialog-description"
    >
      <div className="case-dialog-header">
        <h2 id="case-dialog-title">Escolha um caso de exemplo</h2>
        <button
          type="button"
          className="icon-action"
          aria-label="Fechar casos de exemplo"
          onClick={() => dialogRef.current?.close()}
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>
      <p id="case-dialog-description">
        {assessmentStarted
          ? 'Ao escolher um caso, os dados atuais do formulário serão substituídos.'
          : 'Os casos usam dados fictícios e preenchem as quatro etapas da avaliação.'}
      </p>
      <CaseOptions detailed formData={formData} onSelect={onSelect} />
    </dialog>
  );
}
