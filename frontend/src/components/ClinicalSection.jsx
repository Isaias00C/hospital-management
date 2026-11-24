import React from 'react';
import { Activity, Heart, Thermometer, Droplet, AlertCircle, FileText } from 'lucide-react';
import { ENUMS } from '../constants/fields';

export default function ClinicalSection({ formData, onChange, errors = {} }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          3. Estado Clínico na Alta & Exames Laboratoriais
        </h2>
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
            <select
              id="disease_category"
              name="disease_category"
              value={formData.disease_category}
              onChange={(e) => onChange('disease_category', e.target.value)}
              className="input-field"
            >
              {ENUMS.disease_category.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="disease_severity">
              Gravidade do Quadro *
            </label>
            <select
              id="disease_severity"
              name="disease_severity"
              value={formData.disease_severity}
              onChange={(e) => onChange('disease_severity', e.target.value)}
              className="input-field"
            >
              {ENUMS.disease_severity.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
            />
            {errors.systolic_bp ? (
              <p className="text-xs text-rose-600 mt-1">{errors.systolic_bp}</p>
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
            />
            {errors.diastolic_bp ? (
              <p className="text-xs text-rose-600 mt-1">{errors.diastolic_bp}</p>
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
            />
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
            />
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
              step="0.1"
              min="34.0"
              max="42.0"
              value={formData.temperature ?? ''}
              onChange={(e) => onChange('temperature', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.temperature ? 'input-field-error' : ''}`}
              placeholder="34.0 a 42.0"
            />
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
            />
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
            />
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
              step="0.1"
              min="0.3"
              max="15.0"
              value={formData.creatinine ?? ''}
              onChange={(e) => onChange('creatinine', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.creatinine ? 'input-field-error' : ''}`}
              placeholder="0.3 a 15.0"
            />
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
              step="0.1"
              min="4.0"
              max="20.0"
              value={formData.hemoglobin ?? ''}
              onChange={(e) => onChange('hemoglobin', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.hemoglobin ? 'input-field-error' : ''}`}
              placeholder="4.0 a 20.0"
            />
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
              step="0.1"
              min="1.0"
              max="50.0"
              value={formData.wbc_count ?? ''}
              onChange={(e) => onChange('wbc_count', e.target.value === '' ? '' : Number(e.target.value))}
              className={`input-field ${errors.wbc_count ? 'input-field-error' : ''}`}
              placeholder="1.0 a 50.0"
            />
            <p className="text-[11px] text-slate-400 mt-1">Referência: 4.0 a 11.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
