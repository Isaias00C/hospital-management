# Análise de Variáveis-Alvo Candidatas

> Dataset: **Hospital Management Data (Kaggle)** — 5 CSVs + 1 XLSX
> Foco: Classificação supervisionada com **Naive Bayes** (requisito do trabalho)

---

## Resumo dos Arquivos

| Arquivo | Linhas | Entidade | Chaves de Junção |
|---------|--------|----------|------------------|
| `clinical_details.csv` | 13.214 | Encounter clínico | `encounter_id`, `patient_id` |
| `visits_encounters.csv` | 13.214 | Encounter administrativo | `encounter_id`, `patient_id` |
| `patients.csv` | 5.000 | Paciente | `patient_id` |
| `hospital_billing.csv` | 13.214 | Faturamento | `encounter_id`, `patient_id` |
| `pharmacy_prescriptions.csv` | 26.715 | Prescrições (múltiplas/encounter) | `encounter_id`, `patient_id` |
| `hospital_management_system.xlsx` | — | (provavelmente versão consolidada) | — |

> Os 4 CSVs principais têm **13.214 linhas** = 1 linha por *encounter*. O `patients` tem 5.000 pacientes únicos.

---

## Variáveis-Alvo por Arquivo

### 1. `clinical_details.csv` — Dados Clínicos do Atendimento

| Variável | Tipo | Classes | Distribuição | Insights Possíveis |
|----------|------|---------|--------------|-------------------|
| **`disease_category`** | Categórica | 11 | Respiratory (19%), Cardiovascular (16%), Infectious (13%), Renal (11%), GI (10%), Endocrine (10%), Oncology (7%), Musculoskeletal (6%), Trauma (5%), Pediatrics (2%), Obstetrics (2%) | **Classificação de especialidade** — Roteamento automático para departamento, alocação de leitos/equipes por perfil de doença. |
| **`disease_severity`** | Categórica ordinal | 4 | Moderate (39%), Severe (26%), Mild (24%), Critical (11%) | **Triagem de gravidade** — Priorização de atendimento, alocação de recursos (UTI, monitoramento), alerta precoce de deterioração. **Melhor candidata**: balanceada, ordinal, clinicamente acionável. |
| **`procedure_complexity`** | Categórica ordinal | 4 (+ 43% NaN) | Moderate (25%), Major (20%), High-Complexity (7%), Minor (6%) | **Planejamento cirúrgico** — Estimativa de tempo de sala, equipe necessária, custos. **Problema**: muitos NaN (procedimentos não registrados). |
| **`hospital_acquired_infection`** | Binária | 2 | 0: 97%, 1: 3% | **Vigilância epidemiológica** — Detecção precoce de infecção hospitalar, isolamento preventivo. **Problema**: extremamente desbalanceada (precisa oversampling/SMOTE ou métricas específicas). |

**Features clínicas ricas** (numéricas, sem NaN ou poucos): sinais vitais (PA, FC, FR, Temp, SpO2), laboratoriais (glicose, creatinina, hemoglobina, leucócitos). Ótimas para predição.

---

### 2. `visits_encounters.csv` — Dados Administrativos do Atendimento

| Variável | Tipo | Classes | Distribuição | Insights Possíveis |
|----------|------|---------|--------------|-------------------|
| **`encounter_type`** | Categórica | 3 | Outpatient (41%), Inpatient (37%), Emergency (22%) | **Gestão de fluxo** — Previsão de tipo de atendimento na admissão, dimensionamento de ambulatório vs. internação vs. emergência. |
| **`admission_urgency`** | Categórica ordinal | 3 | Elective (49%), Emergency (32%), Urgent (19%) | **Triagem de urgência** — Priorização na fila, alocação de leitos de emergência, staffing. **Boa candidata**: balanceada, ordinal. |
| **`department`** | Categórica | 8 | General Medicine (37%), Cardiology (16%), Orthopedics (11%), ICU (10%), General Surgery (10%), Pediatrics (7%), Oncology (7%), Obstetrics (2%) | **Roteamento de paciente** — Encaminhamento automático para especialidade, planejamento de capacidade por departamento. |
| **`discharge_disposition`** | Categórica | 6 (+ 5% NaN) | Home (71%), Expired (10%), SNF (8%), Rehab (3%), Transferred (2%), Left AMA (1%) | **Planejamento de alta** — Previsão de destino pós-alta, coordenação com reabilitação/SNF, identificação de risco de óbito. **Problema**: muito desbalanceada (Home domina). |
| **`readmission_30d`** | Binária | 2 | 0: 67%, 1: 33% | **Gestão de readmissão** — Intervenção precoce (follow-up, telemonitoramento), redução de penalidades financeiras (HRRP nos EUA), qualidade do cuidado. **Melhor candidata binária**: bem balanceada, alto impacto operacional/financeiro. |
| **`in_hospital_mortality`** | Binária | 2 | 0: 90%, 1: 10% | **Identificação de risco de morte** — Alocação de cuidados paliativos, discussão de metas de cuidado, auditoria de qualidade. **Problema**: desbalanceada (precisa peso de classe ou undersampling). |
| **`icu_admitted`** | Binária | 2 | 0: 96%, 1: 4% | **Previsão de necessidade de UTI** — Antecipação de leito, preparação de equipe, triagem de gravidade. **Problema**: muito desbalanceada. |
| **`news2_acuity_score`** | Numérica (0–?) | — | Distribuição contínua | **Score de gravidade validado** — Pode ser binarizado (ex: ≥5 = alto risco) ou usado como target de regressão. |

**Features administrativas**: `length_of_stay_days`, `revisit_count`, `days_since_last_discharge`, `admission_urgency`, `department`. `previous_encounter_id` e `days_since_last_discharge` têm 38% NaN (primeiro encounter do paciente).

---

### 3. `patients.csv` — Demografia e Comorbidades Basais

| Variável | Tipo | Classes | Distribuição | Insights Possíveis |
|----------|------|---------|--------------|-------------------|
| **`gender`** | Binária | 2 | Female (50.3%), Male (49.7%) | Ajuste de risco por sexo, medicina personalizada. **Alvo fraco**: pouco preditivo sozinho. |
| **`age`** | Numérica | — | Média ~50a, range 0–100+ | Pode ser binarizada (idoso ≥65) ou faixas etárias. Feature forte para qualquer modelo. |
| **`blood_group`** | Categórica | 8 | O+ (38%), A+ (34%), B+ (9%), O- (7%), A- (6%), AB+ (3%), B- (2%), AB- (1%) | Compatibilidade transfusional, risco trombótico (não-O). **Alvo fraco**: muitas classes, pouca variabilidade preditiva. |
| **`marital_status`** | Categórica | 4 | Married (46%), Single (35%), Divorced (10%), Widowed (9%) | Proxy de suporte social, adesão ao tratamento. |
| **`race_ethnicity`** | Categórica | 5 | Caucasian (59%), African American (18%), Hispanic (14%), Asian (6%), Other (3%) | Desigualdades em saúde, risco genético/ambiental. **Atenção**: viés étnico — documentar limitação ética. |
| **`residential_zone`** | Categórica ordinal | 3 | Urban (54%), Suburban (32%), Rural (14%) | Acesso a cuidado, determinantes sociais. |
| **`socioeconomic_tier`** | Categórica ordinal | 3 | Middle (49%), Low (29%), High (22%) | **Determinante social** — Risco de readmissão, adesão, acesso a medicação. Feature forte. |
| **`smoker_status`** | Categórica ordinal | 3 (+ 5% NaN) | Never (60%), Former (20%), Current (15%) | Risco cardiovascular/respiratório, desfechos cirúrgicos. |
| **`baseline_charlson_comorbidity_index`** | Numérica (0–?) | — | Índice validado de comorbidade | **Feature poderosa** — Preditor forte de mortalidade, readmissão, LOS. Pode ser alvo (binarizado ≥2 ou ≥3). |
| **`baseline_bmi`** | Numérica | — | Média ~35, 6% NaN | Obesidade como fator de risco. |

**Identificadores a remover**: `patient_id`, `first_name`, `last_name`, `date_of_birth`, `insurance_policy_id`, `contact_phone`, `emergency_contact_phone`, `street_address`, `zip_code`, `registration_date`.

---

### 4. `hospital_billing.csv` — Faturamento

| Variável | Tipo | Classes | Insights |
|----------|------|---------|----------|
| `payment_status` | Categórica | 4–5 | Ciclo de receita, inadimplência. |
| `claim_status` | Categórica | 3–4 | Negativas de claim, apelações. |
| `claim_denial_reason` | Categórica | Várias (+ 89% NaN) | **Problema**: NaN quando claim não negado. |
| Valores monetários | Numéricas | — | Custo do cuidado, *cost prediction* (regressão). |

> **Atenção**: Variáveis de custo (`gross_total_amount`, `insurance_covered_amount`, etc.) **vazam o resultado** se o alvo for desfecho clínico — o custo é consequência do tratamento, não causa. Só usar se alvo for financeiro.

---

### 5. `pharmacy_prescriptions.csv` — Prescrições

| Variável | Tipo | Insights |
|----------|------|----------|
| `therapeutic_class` | Categórica (muitas) | Perfil terapêutico do paciente. |
| `high_risk_medication_flag` | Binária | Polifarmácia, risco de eventos adversos. |
| `days_supply`, `quantity_dispensed` | Numéricas | Adesão, custo. |
| `drug_name`, `ndc_code` | Categóricas (cardinalidade alta) | Precisam agregação (classe ATC). |

> **Uso**: Agregar por encounter (contagem de classes, flags de alto risco, nº de medicações) → features derivadas ricas.

---

## Variáveis Derivadas Sugeridas (Feature Engineering)

| Feature Derivada | Fonte | Como Criar | Utilidade |
|------------------|-------|------------|-----------|
| `num_comorbidities` | `patients.baseline_charlson_comorbidity_index` | Já existe como score | Força preditiva alta |
| `is_elderly` | `patients.age` | `age >= 65` | Fator de risco universal |
| `los_category` | `visits.length_of_stay_days` | Bins: 0–1, 2–3, 4–7, 8+ | Proxy de gravidade/complexidade |
| `num_medications` | `pharmacy` groupby encounter | Count distinct `ndc_code` | Polifarmácia |
| `has_high_risk_med` | `pharmacy.high_risk_medication_flag` | Any == 1 por encounter | Risk score |
| `icu_or_mortality` | `visits.icu_admitted \| visits.in_hospital_mortality` | OR lógico | Target composto mais frequente |
| `chronic_disease_flag` | `clinical.disease_category` | In {Cardiovascular, Endocrine, Renal, Oncology} | Condição crônica vs aguda |

---

## Recomendação Final (Top 5)

| Rank | Variável | Arquivo | Tipo | Classes | Balanceamento | Justificativa |
|------|----------|---------|------|---------|---------------|---------------|
| **1** | `disease_severity` | clinical_details | Ordinal | 4 | ✅ Bom | Clínica, acionável, ordinal, features ricas disponíveis |
| **2** | `readmission_30d` | visits_encounters | Binária | 2 | ✅ Ótimo | Impacto financeiro/operacional real, bem balanceada |
| **3** | `admission_urgency` | visits_encounters | Ordinal | 3 | ✅ Bom | Triagem real, ordinal, balanceada |
| **4** | `encounter_type` | visits_encounters | Nominal | 3 | ✅ Bom | Gestão de capacidade, interpretação simples |
| **5** | `in_hospital_mortality` | visits_encounters | Binária | 2 | ⚠️ Desbal. (90/10) | Alta gravidade, mas precisa técnicas de imbalance |

---

## Próximos Passos (conforme CLAUDE.md)

1. **Confirmar variável-alvo** comigo (apresentar prós/contras)
2. **Definir features** — juntar tabelas por `encounter_id` + `patient_id`, remover vazamento (ex: `discharge_disposition` se alvo for `readmission_30d`)
3. **Criar `01_exploracao.ipynb`** — EDA completa, correlações, justificativas
4. **Criar `02_treino.ipynb`** — Pipeline + Naive Bayes + métricas + exportação

---

## Perguntas para Decisão

1. Qual alvo tem mais **sentido para a interface web** (formulário → previsão)?
2. O time de backend/frontend tem preferência por **binário vs multiclasse**?
3. Quer explorar **target composto** (ex: `high_risk = icu_admitted OR in_hospital_mortality OR readmission_30d`)?
4. Alguma variável deve ser **excluída por viés ético/legal** (ex: `race_ethnicity`, `socioeconomic_tier`)?

---

*Documento gerado para apoiar a decisão da variável-alvo no trabalho de Probabilidade e Estatística (IFCE).*