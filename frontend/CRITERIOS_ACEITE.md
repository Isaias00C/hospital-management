# Critérios de Aceite — Modelo de Predição de Readmissão Hospitalar

> **Versão**: 1.0  
> **Data**: 2026-11-21  
> **Responsável ML**: Patric (Probabilidade e Estatística — IFCE)

---

## 1. Objetivo do Modelo

| Item | Especificação |
|------|---------------|
| **Problema** | Predição de readmissão hospitalar em ≤30 dias (`readmission_30d`) |
| **Tipo** | Classificação binária supervisionada |
| **Algoritmo** | Naive Bayes (GaussianNB) + ColumnTransformer — *requisito do trabalho* |
| **Target** | `0` = Baixo Risco (não readmite), `1` = Alto Risco (readmite em ≤30 dias) |
| **Dataset** | Hospital Management Data (Kaggle) — 13.214 encounters, 5.000 pacientes, 4 tabelas |
| **Features finais** | 38 (17 numéricas + 21 categóricas) → 85 colunas após OneHotEncoding |

---

## 2. Critérios de Aceite — Funcionalidade Atual

### 2.1 Qualidade do Modelo (Métricas Mínimas no Test Set 20%)

| Métrica | Valor Atual | Critério Mínimo | Status |
|---------|-------------|-----------------|--------|
| **Accuracy** | 0.6023 | ≥ 0.55 | ✅ |
| **Precision (macro)** | 0.6032 | ≥ 0.55 | ✅ |
| **Recall / Sensibilidade (macro)** | 0.6166 | ≥ 0.55 | ✅ |
| **F1-score (macro)** | 0.5909 | ≥ 0.55 | ✅ |
| **AUC-ROC** | 0.6518 | ≥ 0.60 | ✅ |
| **AUC-PR** | 0.4455 | ≥ 0.40 | ✅ |

> **Baseline comparativo**: Logistic Regression atinge Accuracy~0.64, F1-macro~0.62, AUC~0.70. O NB foi mantido por requisito acadêmico.

### 2.2 Reprodutibilidade
- [x] `random_state=42` fixo em split, treino e pipeline
- [x] Mesmo `ColumnTransformer` usado no treino e inferência (sem vazamento)
- [x] Pipeline serializado com `joblib` contém: imputers, scalers, encoders + classificador
- [x] Versões fixadas: Python 3.14.x, scikit-learn 1.9.1, pandas 3.1.x

### 2.3 Features de Entrada (38 campos — ordem fixa = ordem do treino)

| Grupo | Campos | Derivados pelo Backend |
|-------|--------|------------------------|
| **Demografia (9)** | age, gender, **baseline_charlson_comorbidity_index**, baseline_bmi, smoker_status, socioeconomic_tier, residential_zone, marital_status, is_elderly | `is_elderly = age >= 65` |
| **Internação (8)** | encounter_type, admission_urgency, department, length_of_stay_days, los_category, revisit_count, days_since_last_discharge_filled, first_admission_flag | `los_category` via `pd.cut(bins=[0,1,3,7,60], right=True)`<br>`first_admission_flag = days_since_last_discharge is null`<br>`days_since_last_discharge_filled = -1 se first_admission else valor` |
| **Clínico na Alta (12)** | systolic_bp, diastolic_bp, heart_rate, respiratory_rate, temperature, spo2, glucose, creatinine, hemoglobin, wbc_count, disease_category, disease_severity | — |
| **Medicações (9)** | num_medications, num_therapeutic_classes, polypharmacy_flag, has_high_risk_med, has_anticoagulant, has_insulin, has_diuretic, has_beta_blocker, has_ace_arb | `polypharmacy_flag = num_medications >= 5`<br>Flags de medicação = 0 se encounter sem prescrição |

> **Nota**: `charlson_comorbidity_index` (API amigável) → renomeado para `baseline_charlson_comorbidity_index` (nome do treino) no backend.

### 2.4 Comportamento de Edge Cases Validados

| Cenário | Comportamento Esperado | Validado |
|---------|------------------------|----------|
| `length_of_stay_days = 0` | `los_category = NaN` → imputado pelo pipeline (most_frequent) | ✅ |
| `days_since_last_discharge = null` | `first_admission_flag = 1`, `days_since_last_discharge_filled = -1` | ✅ |
| Categoria categórica não vista no treino | `OneHotEncoder(handle_unknown='ignore')` → coluna zerada | ✅ |
| Valores numéricos faltantes | `SimpleImputer(strategy='median')` → imputado com mediana do treino | ✅ |
| Charlson não informado (null) | Pipeline ignora (coluna existe mas valor NaN → imputado) | ✅ |

---

## 3. Critérios de Aceite — API para Consumo pelo Backend

### 3.1 Endpoint Principal

```http
POST /api/v1/predict/readmission-30d
Content-Type: application/json
```

**Request** (campos amigáveis — backend converte para nomes do treino):
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
  "admission_urgency": "Emergency",
  "department": "Cardiology",
  "length_of_stay_days": 5,
  "revisit_count": 2,
  "days_since_last_discharge": 45,
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
  "has_high_risk_med": 1,
  "has_anticoagulant": 1,
  "has_insulin": 0,
  "has_diuretic": 1,
  "has_beta_blocker": 1,
  "has_ace_arb": 1
}
```

**Response (HTTP 200)**:
```json
{
  "predicted_class": 1,
  "class_label": "Alto Risco",
  "probabilities": { "0": 0.02, "1": 0.98 },
  "risk_score_percent": 98,
  "recommendation": "ALTO RISCO CRÍTICO: Agendar follow-up em 48h + telemonitoramento contínuo + reconciliação medicamentosa + avaliação de suporte social",
  "model_version": "1.0"
}
```

**Response (HTTP 422)** — Validação Pydantic (campos obrigatórios, ranges, enums).

### 3.2 Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_version": "1.0",
  "sklearn_version": "1.9.1"
}
```

- `status = "degraded"` e `model_loaded = false` se arquivo `.joblib` não encontrado
- Backend **não falha na inicialização** se modelo ausente (resiliente)

### 3.3 Contrato de Dados (Pydantic Schemas)

- [x] `ReadmissionRequest` — entrada com validação (`extra="forbid"`, ranges, enums)
- [x] `ReadmissionResponse` — saída tipada
- [x] `HealthResponse` — health check tipado
- [x] Conversão automática: `charlson_comorbidity_index` → `baseline_charlson_comorbidity_index`, `bmi` → `baseline_bmi`

### 3.4 CORS & Configuração

- [x] CORS configurável via env `CORS_ORIGINS` (default: localhost:3000, localhost:5173)
- [x] Modelo carregado **uma única vez** no startup (`lifespan` FastAPI)
- [x] Path do modelo via env `MODEL_PATH` (default: `backend/model/modelo_nb.joblib`)

---

## 4. Critérios de Aceite — Extensibilidade Futura

> **Princípio**: O modelo atual é v1.0 (NB obrigatório). A arquitetura deve permitir evolução sem quebrar contratos.

### 4.1 Versionamento de Modelo
- [x] `model_version` no response (`"1.0"`)
- [x] `sklearn_version` no health check para detectar incompatibilidade
- [x] Pipeline serializado contém `feature_names_in_` (validação de compatibilidade)

### 4.2 Preparado para Novos Algoritmos/Targets

| Capacidade | Como Está Preparado |
|------------|---------------------|
| **Trocar algoritmo** (ex: XGBoost, LightGBM) | Mesmo contrato de entrada/saída; basta retreinar e sobrescrever `.joblib` |
| **Adicionar novo target** (ex: `mortality_30d`, `cost_prediction`) | Novo endpoint `/api/v1/predict/{target}`, novo modelo, mesmo padrão de saúde |
| **Ensemble / Model Registry** | Estrutura permite múltiplos `.joblib` em `backend/model/` com versionamento semântico |
| **A/B Testing** | `model_version` no response permite roteamento por versão |
| **Drift Detection** | Logs de entrada/saída (sem PII) + métricas de monitoramento podem ser adicionados no middleware |

### 4.3 Evolução de Features
- [x] `ColumnTransformer` com `handle_unknown='ignore'` aceita novas categorias sem quebrar
- [x] Imputers tratam features faltantes futuras
- [x] Ordem das features fixada em `MODEL_COLUMNS` (fallback) + `feature_names_in_` (runtime)
- [x] Derivações (`is_elderly`, `los_category`, `polypharmacy_flag`) isoladas em `ml.py` — fáceis de modificar

### 4.4 Documentação para Futuras Equipes
- [x] `ml/CONTRATO.md` — campos, tipos, ranges, exemplo cURL
- [x] `ml/CONTRATO_INTEGRACAO.md` — integração ML↔Backend↔Frontend
- [x] `ml/README.md` — como rodar, métricas, limitações, versões
- [x] `ml/requirements.txt` — `pip freeze` fixo para reprodutibilidade
- [x] `ml/teste_carregamento.py` — teste standalone do artefato

---

## 5. Checklist de Entrega (Definition of Done)

| Item | Status |
|------|--------|
| Notebook `01_exploracao.ipynb` — EDA, joins, feature engineering | ✅ |
| Notebook `02_treino.ipynb` — Pipeline, treino, avaliação, exportação (corrigido Charlson) | ✅ |
| Modelo `backend/model/modelo_nb.joblib` — 38 features, sklearn 1.9.1 | ✅ |
| Script `ml/teste_carregamento.py` — passa standalone | ✅ |
| `ml/CONTRATO.md` — 38 campos documentados | ✅ |
| `ml/CONTRATO_INTEGRACAO.md` — integração completa | ✅ |
| `ml/README.md` — decisões, versões, como rodar, limitações | ✅ |
| `ml/requirements.txt` — dependências fixas | ✅ |
| `.gitignore` — ignora `.venv/`, `ml/data/`, permite `backend/model/modelo_nb.joblib` | ✅ |
| `GET /health` → `model_loaded: true` | ✅ |
| `POST /api/v1/predict/readmission-30d` → predição válida com probabilidades | ✅ |
| Validação Pydantic (422 em entrada inválida) | ✅ |
| CORS funcionando para frontend local | ✅ |

---

## 6. Limitações Conhecidas (Para Apresentação e Decisão de Evolução)

| Limitação | Impacto | Próximo Passo Sugerido |
|-----------|---------|------------------------|
| **Dataset sintético** | Padrões podem não generalizar para EHR reais | Validar em coorte própria antes de uso clínico |
| **Features de alta (vazamento potencial)** | Vitals/labs/meds só existem *após* decisão de alta | Em produção, usar valores *pré-alta* (24h antes) |
| **`days_since_last_discharge` = 38% NaN** | Flag `first_admission_flag` captura; imputação com mediana viesaria | Manter flag binária, não imputar |
| **Independência NB** | Features correlacionadas (PA, meds cardíacas, labs) violam假设 | Trocar por LR/GBDT quando não for requisito acadêmico |
| **Desbalanceamento 67/33** | Macro-F1 usado; recall classe 1 ~0.66 | *Threshold tuning* se custo FN >> FP |
| **Split aleatório** | Não time-series; pode superestimar performance | Em produção usar *time-series split* |
| **Generalização geográfica** | Dataset sem localização; práticas de alta variam | Validar práticas de alta por região/país |

---

## 7. Aprovação

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| **ML Owner** | Patric | | 2026-11-21 |
| **Backend Lead** | | | |
| **Frontend Lead** | | | |
| **Professor/Orientador** | Valberto Feitosa | | |

---

> **Próxima iteração sugerida**: Retreinar com **Logistic Regression** ou **Gradient Boosting** (mesmo pipeline, mesmo contrato) para ganhar ~10-15% em AUC/F1. O endpoint e o backend **não precisam mudar** — apenas substituir o `.joblib` e atualizar `model_version` para `"2.0"`.