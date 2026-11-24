import { fieldErrorProps } from '../constants/validation';
import React from 'react';
import { Building2, Calendar, Clock, AlertCircle } from 'lucide-react';
import FieldSelect from './FieldSelect';

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
        <h2 tabIndex={-1}>Internação e histórico</h2>
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
          <FieldSelect field="encounter_type" value={formData.encounter_type} onChange={onChange} errors={errors} />
        </div>

        {/* Urgência da Admissão */}
        <div>
          <label className="input-label" htmlFor="admission_urgency">
            Urgência da Admissão *
          </label>
          <FieldSelect field="admission_urgency" value={formData.admission_urgency} onChange={onChange} errors={errors} />
        </div>

        {/* Departamento */}
        <div>
          <label className="input-label" htmlFor="department">
            Departamento Hospitalar *
          </label>
          <FieldSelect field="department" value={formData.department} onChange={onChange} errors={errors} />
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
            {...fieldErrorProps(errors, 'length_of_stay_days')}
          />
          {errors.length_of_stay_days && (
            <p id="length_of_stay_days-error" className="mt-1 text-xs text-rose-700">{errors.length_of_stay_days}</p>
          )}
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
            {...fieldErrorProps(errors, 'revisit_count')}
          />
          {errors.revisit_count && (
            <p id="revisit_count-error" className="mt-1 text-xs text-rose-700">{errors.revisit_count}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">Quantas vezes o paciente já retornou</p>
        </div>

        {/* Primeira Internação / Dias desde Última Alta */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div>
            <label htmlFor="is_first_admission" className="input-label">É a primeira internação? *</label>
            <FieldSelect
              field="is_first_admission"
              value={isFirstAdmission == null ? '' : String(isFirstAdmission)}
              onChange={(field, value) => onChange(field, value === 'true')}
              errors={errors}
              options={[{ value: 'true', label: 'Sim' }, { value: 'false', label: 'Não' }]}
            />
          </div>

          {isFirstAdmission === false && (
            <div>
              <label className="input-label" htmlFor="days_since_last_discharge">
                Dias desde Última Alta *
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
                className={`input-field ${errors.days_since_last_discharge ? 'input-field-error' : ''}`}
                placeholder="Ex: 45"
                {...fieldErrorProps(errors, 'days_since_last_discharge')}
              />
              {errors.days_since_last_discharge && (
                <p id="days_since_last_discharge-error" className="mt-1 text-xs text-rose-700">{errors.days_since_last_discharge}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">Tempo transcorrido desde a última alta</p>
            </div>
          )}

          {isFirstAdmission && (
            <p className="text-xs text-emerald-700 font-medium">
              Sem internação anterior.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
