# Contrato de API — Predição Readmissão 30 Dias

> **Versão do modelo**: 1.0  
> **Algoritmo**: Naive Bayes (GaussianNB) com ColumnTransformer  
> **Features**: 38 (17 numéricas + 21 categóricas) → 85 colunas após OneHot  
> **Target**: `readmission_30d` (0 = Não readmite, 1 = Readmite em ≤30 dias)

---

## Entrada (POST /api/v1/predict/readmission-30d)

Campos **obrigatórios**, na **ordem exata** usada no treino:

### 1. Demografia (9 campos)

| Campo | Tipo | Valores Aceitos | Descrição |
|-------|------|-----------------|-----------|
| `age` | integer | 0–110 | Idade do paciente |
| `gender` | string | `"M"`, `"F"` | Sexo biológico |
| `charlson_comorbidity_index` | integer | 0–15 | Índice de Charlson (comorbidades basais) |
| `baseline_bmi` | float | 10.0–60.0 | IMC basal (kg/m²) |
| `smoker_status` | string | `"Never"`, `"Former"`, `"Current"` | Status tabágico |
| `socioeconomic_tier` | string | `"Low"`, `"Middle"`, `"High"` | Nível socioeconômico |
| `residential_zone` | string | `"Rural"`, `"Suburban"`, `"Urban"` | Zona residencial |
| `marital_status` | string | `"Single"`, `"Married"`, `"Divorced"`, `"Widowed"` | Estado civil |
| `is_elderly` | integer | `0`, `1` | Flag derivado: `age >= 65` |

### 2. Internação (8 campos)

| Campo | Tipo | Valores Aceitos | Descrição |
|-------|------|-----------------|-----------|
| `encounter_type` | string | `"Emergency"`, `"Inpatient"`, `"Outpatient"` | Tipo de atendimento |
| `admission_urgency` | string | `"Elective"`, `"Urgent"`, `"Emergency"` | Urgência da admissão |
| `department` | string | `"General Medicine"`, `"Cardiology"`, `"ICU"`, `"Orthopedics"`, `"General Surgery"`, `"Pediatrics"`, `"Oncology"`, `"Obstetrics"` | Departamento |
| `length_of_stay_days` | integer | 0–60 | Dias de internação |
| `los_category` | string | `"0-1"`, `"2-3"`, `"4-7"`, `"8+"` | Bin de LOS (derivado) |
| `revisit_count` | integer | 0–20 | Número de revisitas anteriores |
| `days_since_last_discharge_filled` | integer | -1 a 3650 | Dias desde última alta (-1 = primeira internação) |
| `first_admission_flag` | integer | `0`, `1` | Flag: 1 se primeira internação |

### 3. Clínico na Alta (12 campos)

| Campo | Tipo | Valores Aceitos | Unidade |
|-------|------|-----------------|---------|
| `systolic_bp` | integer | 60–250 | mmHg |
| `diastolic_bp` | integer | 30–150 | mmHg |
| `heart_rate` | integer | 30–200 | bpm |
| `respiratory_rate` | integer | 5–60 | resp/min |
| `temperature` | float | 34.0–42.0 | °C |
| `spo2` | integer | 70–100 | % |
| `glucose` | integer | 40–500 | mg/dL |
| `creatinine` | float | 0.3–15.0 | mg/dL |
| `hemoglobin` | float | 4.0–20.0 | g/dL |
| `wbc_count` | float | 1.0–50.0 | ×10³/µL |
| `disease_category` | string | `"Respiratory"`, `"Cardiovascular"`, `"Infectious"`, `"Renal"`, `"GI"`, `"Endocrine"`, `"Oncology"`, `"Musculoskeletal"`, `"Trauma"`, `"Pediatrics"`, `"Obstetrics"` | Categoria da doença |
| `disease_severity` | string | `"Mild"`, `"Moderate"`, `"Severe"`, `"Critical"` | Gravidade da doença |

### 4. Medicações na Alta (9 campos)

| Campo | Tipo | Valores Aceitos | Descrição |
|-------|------|-----------------|-----------|
| `num_medications` | integer | 0–30 | Número de medicações distintas (NDC) |
| `num_therapeutic_classes` | integer | 0–15 | Número de classes terapêuticas distintas |
| `polypharmacy_flag` | integer | `0`, `1` | `num_medications >= 5` |
| `has_high_risk_med` | integer | `0`, `1` | Alguma medicação de alto risco (flag original) |
| `has_anticoagulant` | integer | `0`, `1` | Warfarina, apixabana, rivaroxabana, heparina, etc. |
| `has_insulin` | integer | `0`, `1` | Qualquer insulina |
| `has_diuretic` | integer | `0`, `1` | Furosemida, hidroclorotiazida, espironolactona, etc. |
| `has_beta_blocker` | integer | `0`, `1` | Metoprolol, carvedilol, atenolol, etc. |
| `has_ace_arb` | integer | `0`, `1` | Lisinopril, losartana, ramipril, valsartana, etc. |

---

## Saída (JSON Response)

```json
{
  "predicted_class": 0,
  "class_label": "Baixo Risco",
  "probabilities": {
    "0": 0.74,
    "1": 0.26
  },
  "risk_score_percent": 26,
  "recommendation": "BAIXO RISCO: Alta padrão com orientações de rotina",
  "model_version": "1.0"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `predicted_class` | integer | `0` (Baixo Risco) ou `1` (Alto Risco) |
| `class_label` | string | Rótulo legível para exibição |
| `probabilities` | object | Probabilidade por classe (soma = 1.0) |
| `risk_score_percent` | integer | `probabilities["1"] * 100` arredondado |
| `recommendation` | string | Recomendação clínica acionável |
| `model_version` | string | Versão do modelo deployado |

---

## Exemplo de Requisição (cURL)

```bash
curl -X POST http://localhost:5000/api/v1/predict/readmission-30d   -H "Content-Type: application/json"   -d '{
    "age": 72,
    "gender": "M",
    "charlson_comorbidity_index": 3,
    "baseline_bmi": 28.5,
    "smoker_status": "Former",
    "socioeconomic_tier": "Middle",
    "residential_zone": "Urban",
    "marital_status": "Married",
    "is_elderly": 1,
    "encounter_type": "Emergency",
    "admission_urgency": "Emergency",
    "department": "Cardiology",
    "length_of_stay_days": 5,
    "los_category": "4-7",
    "revisit_count": 2,
    "days_since_last_discharge_filled": 45,
    "first_admission_flag": 0,
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "heart_rate": 78,
    "respiratory_rate": 18,
    "temperature": 36.8,
    "spo2": 95,
    "glucose": 140,
    "creatinine": 1.3,
    "hemoglobin": 11.2,
    "wbc_count": 9.1,
    "disease_category": "Cardiovascular",
    "disease_severity": "Moderate",
    "num_medications": 8,
    "num_therapeutic_classes": 5,
    "polypharmacy_flag": 1,
    "has_high_risk_med": 1,
    "has_anticoagulant": 1,
    "has_insulin": 0,
    "has_diuretic": 1,
    "has_beta_blocker": 1,
    "has_ace_arb": 1
  }'
```

---

## Notas para Backend

1. **Ordem das colunas**: O `ColumnTransformer` espera as features na ordem exata listada acima.
2. **Valores categóricos**: Devem corresponder exatamente (case-sensitive) aos valores vistos no treino.
3. **`days_since_last_discharge_filled`**: Use `-1` para primeira internação (o modelo aprendeu isso).
4. **`los_category`**: É derivado de `length_of_stay_days`; o backend pode calcular ou receber pré-calculado.
5. **`is_elderly`**: Derivado de `age >= 65`; o backend deve calcular.
6. **Missing values**: O pipeline trata NaN nas numéricas (imputação via treino) e `handle_unknown='ignore'` nas categóricas.
7. **`predict_proba`**: Disponível e funcional — retorna array shape (n_samples, 2).
8. **Versão sklearn**: Treinado com scikit-learn 1.9.1; backend deve usar a mesma versão.
