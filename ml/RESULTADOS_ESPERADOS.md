# Resultados Esperados — Projeto ML: Predição de Readmissão Hospitalar 30 Dias

> **Dataset**: Hospital Management Data (Kaggle) — 4 tabelas principais + prescrições
> **Target**: `readmission_30d` (binária: 0 = não readmitido, 1 = readmitido em ≤30 dias)
> **Modelo**: Naive Bayes (Pipeline misto: `ColumnTransformer` + `CategoricalNB`/`GaussianNB`)
> **Entrega**: Notebooks, modelo serializado, contrato de API, documentação

---

## 1. O que o Modelo Prediz

| Saída | Descrição | Tipo |
|-------|-----------|------|
| **Classe prevista** | `0` (Baixo risco) ou `1` (Alto risco de readmissão) | Categórica |
| **Probabilidade por classe** | `P(readmission=0)`, `P(readmission=1)` — soma = 1.0 | Numérica [0,1] |
| **Score de risco** | `P(readmission=1)` × 100 → percentual (ex: 74%) | Inteiro 0–100 |

**Interpretação clínica**: Pacientes com score ≥ 50% (ou threshold definido pelo hospital) entram no protocolo de *follow-up* pós-alta: agendamento em 7 dias, telemonitoramento, reconciliação de medicação.

---

## 2. Dados de Entrada (Features — ~28 campos)

### A. Demografia e Comorbidades Basais (`patients.csv`)

| Campo | Tipo | Valores/Range | Fonte |
|-------|------|---------------|-------|
| `age` | Inteiro | 0–110 | `patients.age` |
| `is_elderly` | Binário | 0/1 (derivado: `age ≥ 65`) | Feature engineering |
| `gender` | Categórico | "M", "F" | `patients.gender` |
| `charlson_comorbidity_index` | Inteiro | 0–10+ | `patients.baseline_charlson_comorbidity_index` |
| `bmi` | Float | 10–60 | `patients.baseline_bmi` |
| `smoker_status` | Categórico (ordinal) | "Never", "Former", "Current" | `patients.smoker_status` |
| `socioeconomic_tier` | Categórico (ordinal) | "Low", "Middle", "High" | `patients.socioeconomic_tier` |
| `residential_zone` | Categórico (ordinal) | "Rural", "Suburban", "Urban" | `patients.residential_zone` |
| `marital_status` | Categórico | "Single", "Married", "Divorced", "Widowed" | `patients.marital_status` |

### B. Contexto da Internação (`visits_encounters.csv`)

| Campo | Tipo | Valores/Range | Fonte |
|-------|------|---------------|-------|
| `encounter_type` | Categórico | "Emergency", "Inpatient", "Outpatient" | `visits.encounter_type` |
| `admission_urgency` | Categórico (ordinal) | "Elective", "Urgent", "Emergency" | `visits.admission_urgency` |
| `department` | Categórico | "General Medicine", "Cardiology", "ICU", "Orthopedics", "General Surgery", "Pediatrics", "Oncology", "Obstetrics" | `visits.department` |
| `length_of_stay_days` | Inteiro | 0–60+ | `visits.length_of_stay_days` |
| `los_category` | Categórico (ordinal) | "0-1", "2-3", "4-7", "8+" (bins) | Feature engineering |
| `revisit_count` | Inteiro | 0–20+ | `visits.revisit_count` |
| `days_since_last_discharge` | Inteiro | 0–3650 (NaN = primeira internação) | `visits.days_since_last_discharge` |
| `first_admission_flag` | Binário | 0/1 (derivado: `days_since_last_discharge` is NaN) | Feature engineering |

### C. Estado Clínico na Alta (`clinical_details.csv` — vitais/labs mais recentes do encounter)

| Campo | Tipo | Valores/Range | Unidade |
|-------|------|---------------|---------|
| `systolic_bp` | Inteiro | 60–250 | mmHg |
| `diastolic_bp` | Inteiro | 30–150 | mmHg |
| `heart_rate` | Inteiro | 30–200 | bpm |
| `respiratory_rate` | Inteiro | 5–60 | resp/min |
| `temperature` | Float | 34.0–42.0 | °C |
| `spo2` | Inteiro | 70–100 | % |
| `glucose` | Inteiro | 40–500 | mg/dL |
| `creatinine` | Float | 0.3–15.0 | mg/dL |
| `hemoglobin` | Float | 4.0–20.0 | g/dL |
| `wbc_count` | Float | 1.0–50.0 | ×10³/µL |
| `disease_category` | Categórico | 11 classes (Respiratory, Cardiovascular, Infectious, Renal, GI, Endocrine, Oncology, Musculoskeletal, Trauma, Pediatrics, Obstetrics) | `clinical.disease_category` |
| `disease_severity` | Categórico (ordinal) | "Mild", "Moderate", "Severe", "Critical" | `clinical.disease_severity` |

### D. Perfil de Medicação na Alta (`pharmacy_prescriptions.csv` — agregado por `encounter_id`)

| Campo | Tipo | Valores/Range | Descrição |
|-------|------|---------------|-----------|
| `num_medications` | Inteiro | 0–30+ | Count distinct `ndc_code` |
| `num_therapeutic_classes` | Inteiro | 0–15+ | Count distinct `therapeutic_class` |
| `polypharmacy_flag` | Binário | 0/1 (`num_medications ≥ 5`) | Polifarmácia |
| `has_high_risk_med` | Binário | 0/1 (any `high_risk_medication_flag == 1`) | Medicação de alto risco |
| `has_anticoagulant` | Binário | 0/1 | Warfarina, apixabana, rivaroxabana, etc. |
| `has_insulin` | Binário | 0/1 | Qualquer insulina |
| `has_diuretic` | Binário | 0/1 | Furosemida, hidroclorotiazida, etc. |
| `has_beta_blocker` | Binário | 0/1 | Metoprolol, carvedilol, etc. |
| `has_ace_arb` | Binário | 0/1 | Lisinopril, losartana, etc. |

---

## 3. Métricas de Avaliação (No Notebook `02_treino.ipynb`)

| Métrica | Valor Esperado (Referência) | Interpretação |
|---------|----------------------------|---------------|
| **Acurácia** | ~0.75–0.82 | % de predições corretas no geral |
| **Precision (macro)** | ~0.70–0.78 | Das preditas como "readmitir", quantas realmente readmitiram |
| **Recall / Sensibilidade (macro)** | ~0.65–0.75 | Dos que realmente readmitiram, quantos o modelo pegou |
| **F1-score (macro)** | ~0.68–0.76 | Média harmônica P/R — métrica principal (balanceada) |
| **AUC-ROC** | ~0.78–0.85 | Capacidade discriminativa geral |
| **AUC-PR** | ~0.55–0.65 | Relevante para classe minoritária (readmissão = 33%) |

### Matriz de Confusão (Exemplo Ilustrativo)

| | Predito: 0 (Não) | Predito: 1 (Sim) |
|--|------------------|------------------|
| **Real: 0 (Não)** | TN ≈ 1.550 | FP ≈ 220 |
| **Real: 1 (Sim)** | FN ≈ 300 | TP ≈ 600 |

*Valores baseados em 13.214 encounters × 20% test = ~2.643 amostras (67/33 split)*

### Relatório de Classificação (sklearn `classification_report`)

```
              precision    recall  f1-score   support

           0       0.84      0.88      0.86      1770
           1       0.73      0.67      0.70       873

    accuracy                           0.80      2643
   macro avg       0.78      0.77      0.78      2643
weighted avg       0.80      0.80      0.80      2643
```

---

## 4. Entregáveis Técnicos (Arquivos Gerados)

### Notebooks
```
ml/notebooks/
├── 01_exploracao.ipynb     # EDA completa, joins, feature engineering, justificativas
└── 02_treino.ipynb         # Pipeline, treino, avaliação, exportação, limitações
```

### Modelo Serializado
```
backend/model/
└── modelo_nb.joblib        # Pipeline completo (preprocess + Naive Bayes)
```

### Script de Validação
```
ml/teste_carregamento.py    # Carrega .joblib, testa predict/predict_proba com exemplo
```

### Contrato de API (Frontend ↔ Backend)
```
ml/CONTRATO.md              # Campos do formulário, tipos, valores aceitos, saída
```

### Documentação
```
ml/README.md                # Decisões, versões, como rodar, limitações
ml/requirements.txt         # Dependências fixas (Python, sklearn, pandas, etc.)
```

---

## 5. Estrutura do `CONTRATO.md` (Resumo)

```markdown
# Contrato de API — Predição Readmissão 30 Dias

## Entrada (POST /predict)
Campos obrigatórios (ordem fixa = ordem do treino):

### Demografia
- age: integer, 0-110
- gender: "M" | "F"
- charlson_comorbidity_index: integer, 0-15
- bmi: float, 10-60
- smoker_status: "Never" | "Former" | "Current"
- socioeconomic_tier: "Low" | "Middle" | "High"
- residential_zone: "Rural" | "Suburban" | "Urban"
- marital_status: "Single" | "Married" | "Divorced" | "Widowed"

### Internação
- encounter_type: "Emergency" | "Inpatient" | "Outpatient"
- admission_urgency: "Elective" | "Urgent" | "Emergency"
- department: "General Medicine" | "Cardiology" | "ICU" | "Orthopedics" | "General Surgery" | "Pediatrics" | "Oncology" | "Obstetrics"
- length_of_stay_days: integer, 0-60
- revisit_count: integer, 0-20
- days_since_last_discharge: integer, 0-3650 (ou null para primeira)
- first_admission_flag: 0 | 1

### Clínico na Alta
- systolic_bp: integer, 60-250
- diastolic_bp: integer, 30-150
- heart_rate: integer, 30-200
- respiratory_rate: integer, 5-60
- temperature: float, 34.0-42.0
- spo2: integer, 70-100
- glucose: integer, 40-500
- creatinine: float, 0.3-15.0
- hemoglobin: float, 4.0-20.0
- wbc_count: float, 1.0-50.0
- disease_category: "Respiratory" | "Cardiovascular" | "Infectious" | "Renal" | "GI" | "Endocrine" | "Oncology" | "Musculoskeletal" | "Trauma" | "Pediatrics" | "Obstetrics"
- disease_severity: "Mild" | "Moderate" | "Severe" | "Critical"

### Medicações
- num_medications: integer, 0-30
- num_therapeutic_classes: integer, 0-15
- polypharmacy_flag: 0 | 1
- has_high_risk_med: 0 | 1
- has_anticoagulant: 0 | 1
- has_insulin: 0 | 1
- has_diuretic: 0 | 1
- has_beta_blocker: 0 | 1
- has_ace_arb: 0 | 1

## Saída (JSON)
{
  "predicted_class": 0 | 1,
  "class_label": "Baixo Risco" | "Alto Risco",
  "probabilities": {
    "0": 0.26,
    "1": 0.74
  },
  "risk_score_percent": 74,
  "recommendation": "Agendar follow-up 7 dias + telemonitoramento + reconciliação medicamentosa"
}
```

---

## 6. O que a Aplicação Web Entrega (Frontend + Backend)

### Frontend (HTML/CSS/JS)
- **Formulário em 4 abas/seções** colapsáveis (Demografia, Internação, Clínico, Medicações)
- **Validação client-side**: ranges, required fields, tooltips com definições clínicas
- **Botão "Calcular Risco"** → chama `POST /predict`
- **Exibição do resultado**:
  - Badge colorido: 🟢 Baixo Risco / 🔴 Alto Risco
  - Score percentual grande (ex: "74%")
  - Barras de probabilidade horizontais
  - Recomendação textual acionável
  - Botão "Limpar" / "Novo Paciente"

### Backend (Flask/Django)
- **Endpoint**: `POST /api/v1/predict/readmission-30d`
- **Input**: JSON com 28 campos (validação via Pydantic/DRF serializer)
- **Processamento**: Carrega `modelo_nb.joblib` → `pipeline.predict_proba(df)`
- **Output**: JSON do contrato acima
- **Logs**: Request/response auditados (LGPD: sem PII no log)
- **Health check**: `GET /health` → `{status: "ok", model_version: "1.0", sklearn_version: "1.5.2"}`

---

## 7. Limitações Documentadas (Para Apresentação)

| Limitação | Mitigação / Nota |
|-----------|------------------|
| **Dataset sintético** | Padrões podem não generalizar para dados reais; validar em coorte própria |
| **Vazamento potencial** | Features de alta (vitals, meds) só existem *após* decisão de alta; em produção usar valores *pré-alta* ou prever *antes* da alta |
| **`days_since_last_discharge` = 38% NaN** | Flag `first_admission_flag` captura isso; imputação com mediana viesaria |
| **Naive Bayes assume independência** | Features clínicas correlacionadas (ex: PA sistólica/diastólica); performance pode ser subótima vs. modelos não-lineares |
| **Desbalanceamento 67/33** | Macro-F1 usado; considerar *threshold tuning* para maximizar recall se custo de FN >> FP |
| **Sem validação temporal** | Split aleatório; em produção usar *time-series split* (treino: meses antigos, teste: mês recente) |
| **Generalização geográfica** | Dataset não especifica localização; práticas de alta variam por país/sistema |

---

## 8. Slides Sugeridos para Apresentação Individual (10 min)

| Slide | Conteúdo | Tempo |
|-------|----------|-------|
| 1 | Problema: Readmissão 30d = penalidade financeira + qualidade | 1 min |
| 2 | Dataset: 4 tabelas, 13k encounters, 5k pacientes, target 33% | 1 min |
| 3 | Feature Engineering: 28 features de 4 fontes (demo, enc, clin, pharma) | 2 min |
| 4 | Pipeline: ColumnTransformer + GaussianNB/CategoricalNB, stratify, random_state=42 | 1 min |
| 5 | Resultados: Macro-F1 ~0.73, Recall ~0.67, AUC ~0.82 | 1 min |
| 6 | Matriz de confusão + análise de erros (FN: idosos com alta complexidade) | 1 min |
| 7 | Limitações honestas (sintético, vazamento, independência NB) | 1 min |
| 8 | Demo: Formulário → Score 74% → Recomendação clínica | 1 min |
| 9 | Próximos passos: Validação real, threshold tuning, calibração, SHAP | 1 min |

---

## 9. Checklist de Entrega Final

- [ ] `01_exploracao.ipynb` — EDA completa, joins, feature engineering, justificativas em markdown
- [ ] `02_treino.ipynb` — Pipeline, treino, avaliação (todas métricas), exportação, limitações
- [ ] `modelo_nb.joblib` — Em `backend/model/` (pipeline completo)
- [ ] `teste_carregamento.py` — Funciona standalone (fora do notebook)
- [ ] `CONTRATO.md` — 28 campos documentados com tipos, ranges, saída JSON
- [ ] `README.md` — Decisões, versões (Python, sklearn), como rodar, limitações
- [ ] `requirements.txt` — Versões fixas (`pip freeze`)
- [ ] `.gitignore` — Inclui `.venv/`, `ml/data/`, `*.joblib`, `__pycache__/`
- [ ] Apresentação individual ensaiada (explicar cada etapa em 10 min)

---

## 10. Próximos Passos Imediatos

1. **Confirmar target**: `readmission_30d` (versão completa com 4 tabelas) ✓
2. **Criar ambiente**: `cd ml && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`
3. **Baixar dados**: Colocar CSVs em `ml/data/` (Kaggle CLI ou manual)
4. **Rodar Fase 1**: Criar `01_exploracao.ipynb` — *próxima ação do agente*
5. **Validar features**: Confirmar lista final antes da Fase 2

---

*Documento gerado em 2026-11-20 para alinhamento da equipe (ML + Backend + Frontend).*