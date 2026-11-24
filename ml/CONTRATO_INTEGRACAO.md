# Contrato de Integração ML ↔ Backend ↔ Frontend
## Predição de Readmissão Hospitalar 30 Dias

---

## 1. Visão Geral

Este documento define o contrato completo entre os três componentes do sistema:

| Componente | Responsabilidade | Tecnologia |
|------------|------------------|------------|
| **ML (Machine Learning)** | Treinar, avaliar e exportar modelo Naive Bayes | Python, Scikit-Learn, Jupyter, Joblib |
| **Backend (API)** | Servir modelo via REST, validar entrada, logar auditoria | Flask, Pydantic, Joblib |
| **Frontend (Web)** | Formulário clínico, exibição de risco, recomendações | HTML5, CSS3, Vanilla JS (fetch API) |

**Objetivo**: Prever probabilidade de readmissão hospitalar em ≤30 dias para apoiar protocolo de *follow-up* pós-alta.

**Variável-alvo**: `readmission_30d` (binária: 0 = não readmite, 1 = readmite)

**Dataset**: Hospital Management Data (Kaggle) — 13.214 encounters, 5.000 pacientes, 4 tabelas principais

---

## 2. Entregáveis do ML (Pasta `ml/`)

### 2.1 Notebooks
```
ml/notebooks/
├── 01_exploracao.ipynb    # EDA, feature engineering, joins, decisões documentadas
└── 02_treino.ipynb        # Pipeline, treino, avaliação, exportação
```

### 2.2 Modelo Serializado
```
backend/model/
└── modelo_nb.joblib       # Pipeline completo: ColumnTransformer + GaussianNB (38 features, sklearn 1.9.1)
```

### 2.3 Script de Validação
```
ml/teste_carregamento.py   # Carrega .joblib, testa predict/predict_proba standalone
```

### 2.4 Documentação
```
ml/CONTRATO.md             # Este arquivo (campos, tipos, saída)
ml/README.md               # Decisões, versões, como rodar, limitações
ml/requirements.txt        # Dependências fixas (pip freeze)
```

---

## 3. Features de Entrada (28 campos — Ordem Fixa = Ordem do Treino)

> **IMPORTANTE**: O backend deve montar o DataFrame com **exatamente estas colunas nesta ordem** antes de chamar `pipeline.predict_proba()`.

### A. Demografia e Comorbidades (9 features)

| Campo | Tipo | Valores Aceitos | Descrição |
|-------|------|-----------------|-----------|
| `age` | integer | 0–110 | Idade do paciente |
| `is_elderly` | integer (0/1) | 0 ou 1 | Flag: `age >= 65` (derivado no backend se não vier) |
| `gender` | string | "M" \| "F" | Sexo biológico |
| `charlson_comorbidity_index` | integer | 0–15 | Índice de Charlson |
| `bmi` | float | 10.0–60.0 | Índice de massa corporal |
| `smoker_status` | string | "Never" \| "Former" \| "Current" | Status tabágico |
| `socioeconomic_tier` | string | "Low" \| "Middle" \| "High" | Nível socioeconômico |
| `residential_zone` | string | "Rural" \| "Suburban" \| "Urban" | Zona residencial |
| `marital_status` | string | "Single" \| "Married" \| "Divorced" \| "Widowed" | Estado civil |

### B. Contexto da Internação (8 features)

| Campo | Tipo | Valores Aceitos | Descrição |
|-------|------|-----------------|-----------|
| `encounter_type` | string | "Emergency" \| "Inpatient" \| "Outpatient" | Tipo de encontro |
| `admission_urgency` | string | "Elective" \| "Urgent" \| "Emergency" | Urgência da admissão |
| `department` | string | "General Medicine" \| "Cardiology" \| "ICU" \| "Orthopedics" \| "General Surgery" \| "Pediatrics" \| "Oncology" \| "Obstetrics" | Departamento |
| `length_of_stay_days` | integer | 0–60 | Dias de internação |
| `los_category` | string | "0-1" \| "2-3" \| "4-7" \| "8+" | Bin de LOS (derivado: ver lógica abaixo) |
| `revisit_count` | integer | 0–20 | Contador de reinternações prévias |
| `days_since_last_discharge` | integer \| null | 0–3650 ou null | Dias desde última alta (null = primeira) |
| `first_admission_flag` | integer (0/1) | 0 ou 1 | Flag: `days_since_last_discharge` is null |

### C. Estado Clínico na Alta (11 features)

| Campo | Tipo | Valores/Range | Unidade |
|-------|------|---------------|---------|
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
| `disease_category` | string | 11 classes (ver abaixo) | Categoria diagnóstica |
| `disease_severity` | string | "Mild" \| "Moderate" \| "Severe" \| "Critical" | Severidade |

**Valores `disease_category`**: `Respiratory`, `Cardiovascular`, `Infectious`, `Renal`, `GI`, `Endocrine`, `Oncology`, `Musculoskeletal`, `Trauma`, `Pediatrics`, `Obstetrics`

### D. Perfil de Medicação na Alta (9 features)

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `num_medications` | integer | 0–30 | Count distinct NDC codes |
| `num_therapeutic_classes` | integer | 0–15 | Classes terapêuticas distintas |
| `polypharmacy_flag` | integer (0/1) | 0 ou 1 | `num_medications >= 5` |
| `has_high_risk_med` | integer (0/1) | 0 ou 1 | Any `high_risk_medication_flag == 1` |
| `has_anticoagulant` | integer (0/1) | 0 ou 1 | Classe "Anticoagulant" |
| `has_insulin` | integer (0/1) | 0 ou 1 | Classe "Basal Insulin" |
| `has_diuretic` | integer (0/1) | 0 ou 1 | Classe "Loop Diuretic" |
| `has_beta_blocker` | integer (0/1) | 0 ou 1 | Classe "Beta-Blocker" |
| `has_ace_arb` | integer (0/1) | 0 ou 1 | Classe "ACE Inhibitor" |

---

## 4. Lógica de Features Derivadas (Backend Deve Implementar)

```python
def derive_features(input_dict: dict) -> dict:
    """Aplica feature engineering igual ao treino."""
    df = pd.DataFrame([input_dict])
    
    # is_elderly
    df['is_elderly'] = (df['age'] >= 65).astype(int)
    
    # los_category
    df['los_category'] = pd.cut(df['length_of_stay_days'],
                                 bins=[-1, 1, 3, 7, 60],
                                 labels=['0-1', '2-3', '4-7', '8+'])
    
    # first_admission_flag
    df['first_admission_flag'] = df['days_since_last_discharge'].isna().astype(int)
    
    # polypharmacy_flag
    df['polypharmacy_flag'] = (df['num_medications'] >= 5).astype(int)
    
    # Preencher nulos de medicação (encounters sem prescrição)
    pharm_cols = ['num_medications', 'num_therapeutic_classes', 'has_high_risk_med',
                  'has_anticoagulant', 'has_insulin', 'has_diuretic',
                  'has_beta_blocker', 'has_ace_arb', 'polypharmacy_flag']
    for c in pharm_cols:
        if c in df.columns:
            df[c] = df[c].fillna(0)
    
    return df.iloc[0].to_dict()
```

---

## 5. Saída da API (JSON)

### Endpoint
```
POST /api/v1/predict/readmission-30d
```

### Request Body
```json
{
  "age": 72,
  "gender": "M",
  "charlson_comorbidity_index": 3,
  "bmi": 28.5,
  "smoker_status": "Former",
  "socioeconomic_tier": "Middle",
  "residential_zone": "Urban",
  "marital_status": "Married",
  "encounter_type": "Emergency",
  "admission_urgency": "Urgent",
  "department": "Cardiology",
  "length_of_stay_days": 5,
  "revisit_count": 2,
  "days_since_last_discharge": 45,
  "systolic_bp": 138,
  "diastolic_bp": 82,
  "heart_rate": 88,
  "respiratory_rate": 18,
  "temperature": 36.8,
  "spo2": 95,
  "glucose": 112,
  "creatinine": 1.2,
  "hemoglobin": 13.4,
  "wbc_count": 7.8,
  "disease_category": "Cardiovascular",
  "disease_severity": "Moderate",
  "num_medications": 6,
  "num_therapeutic_classes": 4,
  "has_high_risk_med": 1,
  "has_anticoagulant": 1,
  "has_insulin": 0,
  "has_diuretic": 1,
  "has_beta_blocker": 1,
  "has_ace_arb": 1
}
```

> **Nota**: `is_elderly`, `los_category`, `first_admission_flag`, `polypharmacy_flag` são **derivados pelo backend** (não obrigatórios no request).

### Response (Sucesso — HTTP 200)
```json
{
  "predicted_class": 1,
  "class_label": "Alto Risco",
  "probabilities": {
    "0": 0.26,
    "1": 0.74
  },
  "risk_score_percent": 74,
  "recommendation": "Agendar follow-up 7 dias + telemonitoramento + reconciliação medicamentosa"
}
```

### Response (Erro de Validação — HTTP 422)
```json
{
  "detail": [
    {
      "loc": ["body", "age"],
      "msg": "ensure this value is less than or equal to 110",
      "type": "value_error.number.not_le"
    }
  ]
}
```

### Health Check
```
GET /health
```
```json
{
  "status": "ok",
  "model_version": "1.0",
  "sklearn_version": "1.9.1",
  "model_loaded": true
}
```

---

## 6. Validações Requeridas (Backend)

| Campo | Validação |
|-------|-----------|
| `age` | integer, 0 ≤ age ≤ 110 |
| `gender` | enum ["M", "F"] |
| `charlson_comorbidity_index` | integer, 0 ≤ x ≤ 15 |
| `bmi` | float, 10.0 ≤ x ≤ 60.0 |
| `smoker_status` | enum ["Never", "Former", "Current"] |
| `socioeconomic_tier` | enum ["Low", "Middle", "High"] |
| `residential_zone` | enum ["Rural", "Suburban", "Urban"] |
| `marital_status` | enum ["Single", "Married", "Divorced", "Widowed"] |
| `encounter_type` | enum ["Emergency", "Inpatient", "Outpatient"] |
| `admission_urgency` | enum ["Elective", "Urgent", "Emergency"] |
| `department` | enum das 8 classes |
| `length_of_stay_days` | integer, 0 ≤ x ≤ 60 |
| `revisit_count` | integer, 0 ≤ x ≤ 20 |
| `days_since_last_discharge` | integer ≥ 0 ou null |
| Vitais (systolic_bp, etc.) | Ranges conforme tabela seção 3C |
| `disease_category` | enum das 11 classes |
| `disease_severity` | enum ["Mild", "Moderate", "Severe", "Critical"] |
| Medicações | integers 0/1 para flags; contadores ≥ 0 |

---

## 7. Métricas de Referência (Para Validação de Qualidade)

| Métrica | Valor Esperado (atual) | Critério de Aceite |
|---------|------------------------|-------------------|
| **Acurácia** | 0.6023 | ≥ 0.55 |
| **Precision (macro)** | 0.6032 | ≥ 0.55 |
| **Recall / Sensibilidade (macro)** | 0.6166 | ≥ 0.55 |
| **F1-score (macro)** | 0.5909 | ≥ 0.55 |
| **AUC-ROC** | 0.6518 | ≥ 0.60 |
| **AUC-PR** | 0.4455 | ≥ 0.40 |

> **Nota**: Métricas do Naive Bayes (GaussianNB) com Charlson incluído. Baseline Logistic Regression obtém Accuracy~0.64, F1-macro~0.62, AUC~0.70. Se o modelo em produção divergir significativamente, **re-treinar com `02_treino.ipynb`**.

---

## 8. Limitações Conhecidas (Para Documentação e Apresentação)

| Limitação | Impacto | Mitigação |
|-----------|---------|-----------|
| **Dataset sintético** | Padrões podem não generalizar para dados reais | Validar em coorte própria antes de uso clínico |
| **Vazamento potencial** | Features de alta (vitals, meds) só existem *após* decisão de alta | Em produção, usar valores *pré-alta* ou prever *antes* da alta |
| **`days_since_last_discharge` = 38% NaN** | Flag `first_admission_flag` captura; imputação com mediana viesaria | Manter flag binária, não imputar |
| **Naive Bayes assume independência** | Features correlacionadas (ex: PA sistólica/diastólica) | Performance subótima vs. modelos não-lineares |
| **Desbalanceamento 67/33** | Macro-F1 usado; recall classe 1 ~0.67 | *Threshold tuning* se custo FN >> FP |
| **Sem validação temporal** | Split aleatório; não time-series | Em produção usar *time-series split* |
| **Generalização geográfica** | Dataset não especifica localização | Validar práticas de alta por região |

---

## 9. Como Rodar (Para Equipe Backend)

### 9.1 Ambiente
```bash
cd ml
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

### 9.2 Treinar Modelo (se necessário)
```bash
jupyter nbconvert --to notebook --execute notebooks/01_exploracao.ipynb
jupyter nbconvert --to notebook --execute notebooks/02_treino.ipynb
# Gera backend/model/modelo_nb.joblib
```

### 9.3 Testar Carregamento
```bash
python ml/teste_carregamento.py
# Deve printar: predict=[0|1], predict_proba=[[p0, p1]]
```

### 9.4 Versões Críticas (Registrar no README)
```bash
python --version          # Ex: 3.11.9
python -c "import sklearn; print(sklearn.__version__)"  # Ex: 1.9.1
```

> **Regra**: Backend **deve usar a mesma versão do scikit-learn** do treino (1.9.1). Se versions divergirem, re-treinar.

---

## 10. Checklist de Entrega (ML → Backend)

- [ ] `ml/notebooks/01_exploracao.ipynb` — EDA completa, joins, feature engineering
- [ ] `ml/notebooks/02_treino.ipynb` — Pipeline, treino, avaliação, exportação
- [ ] `backend/model/modelo_nb.joblib` — Pipeline completo (preprocess + NB)
- [ ] `ml/teste_carregamento.py` — Funciona standalone
- [ ] `ml/CONTRATO.md` — 28 campos + derived + saída JSON documentados
- [ ] `ml/README.md` — Decisões, versões, como rodar, limitações
- [ ] `ml/requirements.txt` — `pip freeze` fixo
- [ ] `.gitignore` — Inclui `.venv/`, `ml/data/`, `*.joblib`, `__pycache__/`

---

## 11. Próximos Passos (Backlog)

1. **Backend**: Implementar `/api/v1/predict/readmission-30d` com Pydantic schemas
2. **Backend**: Carregar `modelo_nb.joblib` no startup, health check
3. **Backend**: Logs de auditoria (request/response sem PII — LGPD)
4. **Frontend**: Formulário 4 abas (Demografia, Internação, Clínico, Medicações)
5. **Frontend**: Validação client-side + tooltips clínicos
6. **Frontend**: Exibição: badge colorido, score %, barras prob., recomendação
7. **Integração**: Testes E2E com exemplos conhecidos
8. **Documentação**: Swagger/OpenAPI auto-gerado do endpoint

---

## 12. Contato

- **ML Owner**: Patric (Probabilidade e Estatística — IFCE)
- **Dataset**: https://www.kaggle.com/datasets/deeplumiere/hospital-management-data
- **Modelo**: Naive Bayes (GaussianNB) + ColumnTransformer
- **Random State**: 42 (reprodutibilidade)

---

*Documento versão 1.0 — 2026-11-20 — Para alinhamento Backend + Frontend + ML*