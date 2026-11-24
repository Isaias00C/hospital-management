import React from 'react';
import { Building2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { ENUMS } from '../constants/fields';

export default function EncounterSection({ formData, onChange, errors = {} }) {
  const getLosCategory = (days) => {
    if (days === 0) return '0 dias (Sem pernoite)';
    if (days >= 1 && days <= 1) return '0-1 dias (Muito curto)';
    if (days >= 2 && days <= 3) return '2-3 dias (Curto)';
    if (days >= 4 && days <= 7) return '4-7 dias (Médio)';
    if (days >= 8) return '8+ dias (Longo)';
    return '';
  };

  const isFirstAdmission = formData.is_first_admission;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          2. Contexto da Internação & Histórico
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Dados do episódio de internação atual e histórico prévio de atendimentos no hospital.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Tipo de Encontro */}
        <div>
          <label className="input-label" htmlFor="encounter_type">
            Tipo de Atendimento *
          </label>
          <select
            id="encounter_type"
            name="encounter_type"
            value={formData.encounter_type}
            onChange={(e) => onChange('encounter_type', e.target.value)}
            className="input-field"
          >
            {ENUMS.encounter_type.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Urgência da Admissão */}
        <div>
          <label className="input-label" htmlFor="admission_urgency">
            Urgência da Admissão *
          </label>
          <select
            id="admission_urgency"
            name="admission_urgency"
            value={formData.admission_urgency}
            onChange={(e) => onChange('admission_urgency', e.target.value)}
            className="input-field"
          >
            {ENUMS.admission_urgency.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Departamento */}
        <div>
          <label className="input-label" htmlFor="department">
            Departamento Hospitalar *
          </label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={(e) => onChange('department', e.target.value)}
            className="input-field"
          >
            {ENUMS.department.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tempo de Internação */}
        <div>
          <label className="input-label" htmlFor="length_of_stay_days">
            Tempo de Internação (dias) *
          </label>
          <input
            id="length_of_stay_days"
            name="length_of_stay_days"
            type="number"
            min="0"
            max="60"
            value={formData.length_of_stay_days ?? ''}
            onChange={(e) =>
              onChange('length_of_stay_days', e.target.value === '' ? '' : Number(e.target.value))
            }
            className={`input-field ${errors.length_of_stay_days ? 'input-field-error' : ''}`}
            placeholder="0 a 60 dias"
          />
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-400">0 a 60 dias</span>
            {formData.length_of_stay_days !== '' && (
              <span className="font-semibold text-teal-700">
                Faixa: {getLosCategory(Number(formData.length_of_stay_days))}
              </span>
            )}
          </div>
        </div>

        {/* Revisit Count */}
        <div>
          <label className="input-label" htmlFor="revisit_count">
            Revisitas Anteriores *
          </label>
          <input
            id="revisit_count"
            name="revisit_count"
            type="number"
            min="0"
            max="20"
            value={formData.revisit_count ?? ''}
            onChange={(e) =>
              onChange('revisit_count', e.target.value === '' ? '' : Number(e.target.value))
            }
            className={`input-field ${errors.revisit_count ? 'input-field-error' : ''}`}
            placeholder="0 a 20"
          />
          <p className="text-[11px] text-slate-400 mt-1">Quantas vezes o paciente já retornou</p>
        </div>

        {/* Primeira Internação / Dias desde Última Alta */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Primeira Internação?</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFirstAdmission}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onChange('is_first_admission', checked);
                  if (checked) {
                    onChange('days_since_last_discharge', null);
                  } else {
                    onChange('days_since_last_discharge', 45);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {!isFirstAdmission && (
            <div>
              <label className="input-label" htmlFor="days_since_last_discharge">
                Dias desde Última Alta
              </label>
              <input
                id="days_since_last_discharge"
                name="days_since_last_discharge"
                type="number"
                min="0"
                max="3650"
                value={formData.days_since_last_discharge ?? ''}
                onChange={(e) =>
                  onChange(
                    'days_since_last_discharge',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="input-field"
                placeholder="Ex: 45"
              />
              <p className="text-[11px] text-slate-400 mt-1">Tempo transcorrido desde a última alta</p>
            </div>
          )}

          {isFirstAdmission && (
            <p className="text-xs text-emerald-700 font-medium">
              Primeira internação registrada (modelo enviará valor nulo / flag=1).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
