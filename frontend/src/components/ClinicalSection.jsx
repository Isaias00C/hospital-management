import { fieldErrorProps } from '../constants/validation';
import React from 'react';
import { Activity, Heart, Thermometer, Droplet, AlertCircle, FileText } from 'lucide-react';
import FieldSelect from './FieldSelect';

export default function ClinicalSection({ formData, onChange, errors = {} }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 tabIndex={-1}>Estado clínico na alta</h2>
        <p className="text-xs text-slate-500 mt-1">
          Últimas aferições vitais e exames laboratoriais registrados antes do momento da alta médica.
        </p>
      </div>

      {/* Diagnóstico e Gravidade */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          Diagnóstico Principal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label" htmlFor="disease_category">
              Categoria da Doença *
            </label>
            <FieldSelect field="disease_category" value={formData.disease_category} onChange={onChange} errors={errors} />
          </div>

          <div>
            <label className="input-label" htmlFor="disease_severity">
              Gravidade do Quadro *
            </label>
            <FieldSelect field="disease_severity" value={formData.disease_severity} onChange={onChange} errors={errors} />
          </div>
        </div>
      </div>

      {/* Sinais Vitais */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          Sinais Vitais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* PA Sistólica */}
          <div>
            <label className="input-label" htmlFor="systolic_bp">
              PA Sistólica (mmHg) *
            </label>
            <input
              id="systolic_bp"
              name="systolic_bp"
              type="number"
              min="60"
              max="250"
              value={formData.systolic_bp ?? ''}
              onChange={(e) => onChange('systolic_bp', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.systolic_bp ? 'input-field-error' : ''}`}
              placeholder="60 a 250"
              {...fieldErrorProps(errors, 'systolic_bp')}
            />
            {errors.systolic_bp ? (
              <p id="systolic_bp-error" className="text-xs text-rose-600 mt-1">{errors.systolic_bp}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Normal: 90 a 120 mmHg</p>
            )}
          </div>

          {/* PA Diastólica */}
          <div>
            <label className="input-label" htmlFor="diastolic_bp">
              PA Diastólica (mmHg) *
            </label>
            <input
              id="diastolic_bp"
              name="diastolic_bp"
              type="number"
              min="30"
              max="150"
              value={formData.diastolic_bp ?? ''}
              onChange={(e) => onChange('diastolic_bp', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.diastolic_bp ? 'input-field-error' : ''}`}
              placeholder="30 a 150"
              {...fieldErrorProps(errors, 'diastolic_bp')}
            />
            {errors.diastolic_bp ? (
              <p id="diastolic_bp-error" className="text-xs text-rose-600 mt-1">{errors.diastolic_bp}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Normal: 60 a 80 mmHg</p>
            )}
          </div>

          {/* Frequência Cardíaca */}
          <div>
            <label className="input-label" htmlFor="heart_rate">
              Frequência Cardíaca (bpm) *
            </label>
            <input
              id="heart_rate"
              name="heart_rate"
              type="number"
              min="30"
              max="200"
              value={formData.heart_rate ?? ''}
              onChange={(e) => onChange('heart_rate', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.heart_rate ? 'input-field-error' : ''}`}
              placeholder="30 a 200"
              {...fieldErrorProps(errors, 'heart_rate')}
            />
            {errors.heart_rate && (
              <p id="heart_rate-error" className="mt-1 text-xs text-rose-700">{errors.heart_rate}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Normal: 60 a 100 bpm</p>
          </div>

          {/* Frequência Respiratória */}
          <div>
            <label className="input-label" htmlFor="respiratory_rate">
              Freq. Respiratória (irpm) *
            </label>
            <input
              id="respiratory_rate"
              name="respiratory_rate"
              type="number"
              min="5"
              max="60"
              value={formData.respiratory_rate ?? ''}
              onChange={(e) =>
                onChange('respiratory_rate', e.target.value === '' ? '' : Number(e.target.value))
              }
              className={`input-field ${errors.respiratory_rate ? 'input-field-error' : ''}`}
              placeholder="5 a 60"
              {...fieldErrorProps(errors, 'respiratory_rate')}
            />
            {errors.respiratory_rate && (
              <p id="respiratory_rate-error" className="mt-1 text-xs text-rose-700">{errors.respiratory_rate}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Normal: 12 a 20 irpm</p>
          </div>

          {/* Temperatura */}
          <div>
            <label className="input-label" htmlFor="temperature">
              Temperatura (°C) *
            </label>
            <input
              id="temperature"
              name="temperature"
              type="number"
              step="any"
              min="34.0"
              max="42.0"
              value={formData.temperature ?? ''}
              onChange={(e) => onChange('temperature', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.temperature ? 'input-field-error' : ''}`}
              placeholder="34.0 a 42.0"
              {...fieldErrorProps(errors, 'temperature')}
            />
            {errors.temperature && (
              <p id="temperature-error" className="mt-1 text-xs text-rose-700">{errors.temperature}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Normal: 36.0 a 37.2 °C</p>
          </div>

          {/* SpO2 */}
          <div>
            <label className="input-label" htmlFor="spo2">
              Saturação de O₂ SpO₂ (%) *
            </label>
            <input
              id="spo2"
              name="spo2"
              type="number"
              min="70"
              max="100"
              value={formData.spo2 ?? ''}
              onChange={(e) => onChange('spo2', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.spo2 ? 'input-field-error' : ''}`}
              placeholder="70 a 100"
              {...fieldErrorProps(errors, 'spo2')}
            />
            {errors.spo2 && (
              <p id="spo2-error" className="mt-1 text-xs text-rose-700">{errors.spo2}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Normal: ≥ 95%</p>
          </div>
        </div>
      </div>

      {/* Exames Laboratoriais */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Droplet className="w-4 h-4 text-sky-500" />
          Exames Laboratoriais na Alta
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Glicose */}
          <div>
            <label className="input-label" htmlFor="glucose">
              Glicose (mg/dL) *
            </label>
            <input
              id="glucose"
              name="glucose"
              type="number"
              min="40"
              max="500"
              value={formData.glucose ?? ''}
              onChange={(e) => onChange('glucose', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.glucose ? 'input-field-error' : ''}`}
              placeholder="40 a 500"
              {...fieldErrorProps(errors, 'glucose')}
            />
            {errors.glucose && (
              <p id="glucose-error" className="mt-1 text-xs text-rose-700">{errors.glucose}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Referência: 70 a 99 mg/dL</p>
          </div>

          {/* Creatinina */}
          <div>
            <label className="input-label" htmlFor="creatinine">
              Creatinina (mg/dL) *
            </label>
            <input
              id="creatinine"
              name="creatinine"
              type="number"
              step="any"
              min="0.3"
              max="15.0"
              value={formData.creatinine ?? ''}
              onChange={(e) => onChange('creatinine', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.creatinine ? 'input-field-error' : ''}`}
              placeholder="0.3 a 15.0"
              {...fieldErrorProps(errors, 'creatinine')}
            />
            {errors.creatinine && (
              <p id="creatinine-error" className="mt-1 text-xs text-rose-700">{errors.creatinine}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Função renal: 0.6 a 1.3</p>
          </div>

          {/* Hemoglobina */}
          <div>
            <label className="input-label" htmlFor="hemoglobin">
              Hemoglobina (g/dL) *
            </label>
            <input
              id="hemoglobin"
              name="hemoglobin"
              type="number"
              step="any"
              min="4.0"
              max="20.0"
              value={formData.hemoglobin ?? ''}
              onChange={(e) => onChange('hemoglobin', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.hemoglobin ? 'input-field-error' : ''}`}
              placeholder="4.0 a 20.0"
              {...fieldErrorProps(errors, 'hemoglobin')}
            />
            {errors.hemoglobin && (
              <p id="hemoglobin-error" className="mt-1 text-xs text-rose-700">{errors.hemoglobin}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Anemia se &lt; 12-13 g/dL</p>
          </div>

          {/* Leucócitos (WBC) */}
          <div>
            <label className="input-label" htmlFor="wbc_count">
              Leucócitos (×10³/µL) *
            </label>
            <input
              id="wbc_count"
              name="wbc_count"
              type="number"
              step="any"
              min="1.0"
              max="50.0"
              value={formData.wbc_count ?? ''}
              onChange={(e) => onChange('wbc_count', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.wbc_count ? 'input-field-error' : ''}`}
              placeholder="1.0 a 50.0"
              {...fieldErrorProps(errors, 'wbc_count')}
            />
            {errors.wbc_count && (
              <p id="wbc_count-error" className="mt-1 text-xs text-rose-700">{errors.wbc_count}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Referência: 4.0 a 11.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
