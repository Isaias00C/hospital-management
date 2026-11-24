import { ENUMS } from './fields.js';

const selectionSteps = {
  gender: 1,
  smoker_status: 1,
  socioeconomic_tier: 1,
  residential_zone: 1,
  marital_status: 1,
  encounter_type: 2,
  admission_urgency: 2,
  department: 2,
  is_first_admission: 2,
  disease_category: 3,
  disease_severity: 3,
};

const numericFields = {
  age: [1, 'Idade', 0, 110, true],
  charlson_comorbidity_index: [1, 'Índice de Charlson', 0, 15, true],
  bmi: [1, 'IMC', 10, 60],
  length_of_stay_days: [2, 'Tempo de internação', 0, 60, true],
  revisit_count: [2, 'Revisitas anteriores', 0, 20, true],
  days_since_last_discharge: [2, 'Dias desde a última alta', 0, 3650, true],
  systolic_bp: [3, 'Pressão sistólica', 60, 250, true],
  diastolic_bp: [3, 'Pressão diastólica', 30, 150, true],
  heart_rate: [3, 'Frequência cardíaca', 30, 200, true],
  respiratory_rate: [3, 'Frequência respiratória', 5, 60, true],
  temperature: [3, 'Temperatura', 34, 42],
  spo2: [3, 'SpO₂', 70, 100, true],
  glucose: [3, 'Glicose', 40, 500, true],
  creatinine: [3, 'Creatinina', 0.3, 15],
  hemoglobin: [3, 'Hemoglobina', 4, 20],
  wbc_count: [3, 'Leucócitos', 1, 50],
  num_medications: [4, 'Total de medicações', 0, 30, true],
  num_therapeutic_classes: [4, 'Classes terapêuticas', 0, 15, true],
};

export function validateForm(data) {
  const errors = {};
  for (const [field, [, label, min, max, integer]] of Object.entries(numericFields)) {
    const value = data[field];
    const missing = value == null || value === '';
    if (field === 'days_since_last_discharge' && data.is_first_admission !== false) continue;
    if (field === 'charlson_comorbidity_index' && missing) continue;
    if (missing || !Number.isFinite(value) || value < min || value > max ||
        (integer && !Number.isInteger(value))) {
      const expected = integer ? 'um número inteiro' : 'um número';
      errors[field] = `${label}: informe ${expected} entre ${min} e ${max}.`;
    }
  }
  for (const [field, options] of Object.entries(ENUMS)) {
    if (!options.some(({ value }) => value === data[field])) errors[field] = 'Selecione uma opção.';
  }
  if (typeof data.is_first_admission !== 'boolean') errors.is_first_admission = 'Selecione Sim ou Não.';
  return errors;
}

export function getFieldTab(field) {
  return numericFields[field]?.[0] ?? selectionSteps[field];
}

export function fieldErrorProps(errors, field) {
  if (!errors[field]) return {};
  return { 'aria-invalid': true, 'aria-describedby': `${field}-error` };
}
