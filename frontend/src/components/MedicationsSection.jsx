import { fieldErrorProps } from '../constants/validation';
import React from 'react';
import { Pill, AlertTriangle, ShieldAlert } from 'lucide-react';

const MEDICATION_FLAGS = [
  {
    key: 'has_high_risk_med',
    label: 'Medicação de Alto Risco',
    desc: 'Medicamentos potencialmente perigosos (ex: opioides, imunossupressores).',
    color: 'rose',
  },
  {
    key: 'has_anticoagulant',
    label: 'Anticoagulante',
    desc: 'Varfarina, Apixabana, Rivaroxabana, Heparina, etc.',
    color: 'amber',
  },
  {
    key: 'has_insulin',
    label: 'Insulina',
    desc: 'Qualquer regime de insulina prescrito.',
    color: 'sky',
  },
  {
    key: 'has_diuretic',
    label: 'Diurético de Alça / Tiazídico',
    desc: 'Furosemida, Hidroclorotiazida, Espironolactona, etc.',
    color: 'blue',
  },
  {
    key: 'has_beta_blocker',
    label: 'Betabloqueador',
    desc: 'Metoprolol, Carvedilol, Atenolol, etc.',
    color: 'indigo',
  },
  {
    key: 'has_ace_arb',
    label: 'IECA / BRA',
    desc: 'Lisinopril, Enalapril, Losartana, Valsartana, etc.',
    color: 'teal',
  },
];

export default function MedicationsSection({ formData, onChange, errors = {} }) {
  const isPolypharmacy = Number(formData.num_medications) >= 5;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2>Medicações na alta</h2>
          <p className="text-xs text-slate-500 mt-1">
            Contagem de fármacos prescritos e detecção de medicamentos de alta relevância clínica.
          </p>
        </div>
        {isPolypharmacy && (
          <span className="badge-chip bg-amber-50 text-amber-700 border border-amber-200">
            Alerta: Polifarmácia (≥ 5 fármacos)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Total de Medicações */}
        <div>
          <label className="input-label" htmlFor="num_medications">
            Total de Medicações Distintas *
          </label>
          <input
            id="num_medications"
            name="num_medications"
            type="number"
            min="0"
            max="30"
            value={formData.num_medications ?? ''}
            onChange={(e) =>
              onChange('num_medications', e.target.value === '' ? '' : Number(e.target.value))
            }
            className={`input-field ${errors.num_medications ? 'input-field-error' : ''}`}
            placeholder="0 a 30"
            {...fieldErrorProps(errors, 'num_medications')}
          />
          {errors.num_medications && (
            <p id="num_medications-error" className="mt-1 text-xs text-rose-700">{errors.num_medications}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">
            Contagem de códigos NDC prescritos (≥5 ativa flag de polifarmácia)
          </p>
        </div>

        {/* Classes Terapêuticas */}
        <div>
          <label className="input-label" htmlFor="num_therapeutic_classes">
            Classes Terapêuticas Distintas *
          </label>
          <input
            id="num_therapeutic_classes"
            name="num_therapeutic_classes"
            type="number"
            min="0"
            max="15"
            value={formData.num_therapeutic_classes ?? ''}
            onChange={(e) =>
              onChange(
                'num_therapeutic_classes',
                e.target.value === '' ? '' : Number(e.target.value)
              )
            }
            className={`input-field ${errors.num_therapeutic_classes ? 'input-field-error' : ''}`}
            placeholder="0 a 15"
            {...fieldErrorProps(errors, 'num_therapeutic_classes')}
          />
          {errors.num_therapeutic_classes && (
            <p id="num_therapeutic_classes-error" className="mt-1 text-xs text-rose-700">{errors.num_therapeutic_classes}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">Número de grupos farmacológicos diferentes</p>
        </div>
      </div>

      {/* Cards de Flags de Medicação */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Classes e Alertas Farmacológicos Específicos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDICATION_FLAGS.map((flag) => {
            const isChecked = formData[flag.key] === 1;

            return (
              <label
                key={flag.key}
                className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none flex items-start gap-3 ${
                  isChecked
                    ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  aria-labelledby={`${flag.key}-label`}
                  aria-describedby={`${flag.key}-description`}
                  onChange={(event) => onChange(flag.key, event.target.checked ? 1 : 0)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                    <span id={`${flag.key}-label`}>{flag.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isChecked ? 'bg-teal-200 text-teal-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isChecked ? 'SIM' : 'NÃO'}
                    </span>
                  </div>
                  <p id={`${flag.key}-description`} className="text-xs text-slate-500 mt-1 leading-relaxed">{flag.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
