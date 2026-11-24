import { fieldErrorProps } from '../constants/validation';
import React from 'react';
import { User, HelpCircle, AlertCircle } from 'lucide-react';
import FieldSelect from './FieldSelect';

export default function DemographicsSection({ formData, onChange, errors = {} }) {
  const isElderly = Number(formData.age) >= 65;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 tabIndex={-1}>Perfil do paciente</h2>
          <p className="text-xs text-slate-500 mt-1">
            Características gerais do paciente e índice de comorbidades prévias.
          </p>
        </div>
        {isElderly && (
          <span className="badge-chip bg-amber-50 text-amber-700 border border-amber-200">
            Pessoa idosa (65 anos ou mais)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Idade */}
        <div>
          <label className="input-label" htmlFor="age">
            Idade (anos) *
          </label>
          <div className="relative">
            <input
              id="age"
              name="age"
              type="number"
              min="0"
              max="110"
              value={formData.age ?? ''}
              onChange={(e) => onChange('age', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.age ? 'input-field-error' : ''}`}
              placeholder="Ex: 68"
              {...fieldErrorProps(errors, 'age')}
            />
          </div>
          {errors.age ? (
            <p id="age-error" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.age}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">Válido entre 0 e 110 anos</p>
          )}
        </div>

        {/* Sexo */}
        <div>
          <label className="input-label" htmlFor="gender">
            Sexo Biológico *
          </label>
          <FieldSelect field="gender" value={formData.gender} onChange={onChange} errors={errors} />
          <p className="text-[11px] text-slate-400 mt-1">Gênero de nascimento</p>
        </div>

        {/* Índice de Charlson */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="input-label mb-0" htmlFor="charlson_comorbidity_index">
              Índice de Charlson (CCI)
            </label>
            <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
              <HelpCircle className="w-3.5 h-3.5" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-slate-900 text-slate-100 text-[11px] rounded shadow-lg z-20">
                Escore de comorbidades prévias (0 = sem comorbidades graves, 1-2 = leve, ≥3 = grave).
              </div>
            </div>
          </div>
          <input
            id="charlson_comorbidity_index"
            name="charlson_comorbidity_index"
            type="number"
            min="0"
            max="15"
            value={formData.charlson_comorbidity_index ?? ''}
            onChange={(e) =>
              onChange('charlson_comorbidity_index', e.target.value === '' ? null : Number(e.target.value))
            }
            className={`input-field ${errors.charlson_comorbidity_index ? 'input-field-error' : ''}`}
            placeholder="0 a 15"
            {...fieldErrorProps(errors, 'charlson_comorbidity_index')}
          />
          {errors.charlson_comorbidity_index && (
            <p id="charlson_comorbidity_index-error" className="mt-1 text-xs text-rose-700">{errors.charlson_comorbidity_index}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">Escala de 0 a 15 (opcional)</p>
        </div>

        {/* IMC */}
        <div>
          <label className="input-label" htmlFor="bmi">
            IMC Basal (kg/m²) *
          </label>
          <input
            id="bmi"
            name="bmi"
            type="number"
            step="any"
            min="10.0"
            max="60.0"
            value={formData.bmi ?? ''}
            onChange={(e) => onChange('bmi', e.target.value === '' ? '' : Number(e.target.value))}
            className={`input-field ${errors.bmi ? 'input-field-error' : ''}`}
            placeholder="Ex: 27.5"
            {...fieldErrorProps(errors, 'bmi')}
          />
          {errors.bmi ? (
            <p id="bmi-error" className="text-xs text-rose-600 mt-1">{errors.bmi}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">Índice de massa corporal (10.0 a 60.0)</p>
          )}
        </div>

        {/* Tabagismo */}
        <div>
          <label className="input-label" htmlFor="smoker_status">
            Status Tabágico *
          </label>
          <FieldSelect field="smoker_status" value={formData.smoker_status} onChange={onChange} errors={errors} />
        </div>

        {/* Nível Socioeconômico */}
        <div>
          <label className="input-label" htmlFor="socioeconomic_tier">
            Nível Socioeconômico *
          </label>
          <FieldSelect field="socioeconomic_tier" value={formData.socioeconomic_tier} onChange={onChange} errors={errors} />
        </div>

        {/* Zona Residencial */}
        <div>
          <label className="input-label" htmlFor="residential_zone">
            Zona Residencial *
          </label>
          <FieldSelect field="residential_zone" value={formData.residential_zone} onChange={onChange} errors={errors} />
        </div>

        {/* Estado Civil */}
        <div>
          <label className="input-label" htmlFor="marital_status">
            Estado Civil *
          </label>
          <FieldSelect field="marital_status" value={formData.marital_status} onChange={onChange} errors={errors} />
        </div>
      </div>
    </div>
  );
}
