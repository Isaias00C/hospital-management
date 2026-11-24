# Recomendação de Variável-Alvo para o Projeto

> **Contexto**: Trabalho final de Probabilidade e Estatística (IFCE) — Classificação supervisionada com **Naive Bayes**, interface web (formulário → previsão), exportação `joblib`.

---

## 🏆 Top 3 Candidatas

| # | Variável | Arquivo | Tipo | Classes | Balanceamento | Modelo NB |
|---|----------|---------|------|---------|---------------|-----------|
| **1** | **`disease_severity`** | `clinical_details` | Ordinal | 4 (Mild, Moderate, Severe, Critical) | 24 / 39 / 26 / 11% | `GaussianNB` |
| **2** | **`readmission_30d`** | `visits_encounters` | Binária | 2 (0, 1) | 67 / 33% | `CategoricalNB` / misto |
| **3** | **`admission_urgency`** | `visits_encounters` | Ordinal | 3 (Elective, Emergency, Urgent) | 49 / 32 / 19% | `CategoricalNB` / misto |

---

## 📋 Comparação Detalhada

### 1️⃣ `disease_severity` — **Recomendação Principal**

| Aspecto | Detalhes |
|---------|----------|
| **Objetivo** | Triagem de gravidade na admissão |
| **Inputs (formulário web)** | 10 sinais vitais + laboratoriais: PA sistólica/diastólica, FC, FR, Temp, SpO2, glicose, creatinina, hemoglobina, leucócitos |
| **Features disponíveis** | Todas numéricas, coletadas **no momento da admissão**, sem NaN crítico |
| **Vazamento de dados** | Baixo risco — sinais vitais vêm antes da classificação final de gravidade |
| **Naive Bayes ideal** | `GaussianNB` (features contínuas ~ Gaussianas) |
| **Interpretação** | Clinicamente intuitiva: "Paciente crítico → UTI"; "Leve → ambulatório" |
| **Métricas** | Macro-F1 (classes desbalanceadas), matriz 4×4 |
| **Limitação** | Dataset pode ser sintético — gravidade pode ser derivada dos próprios sinais vitais (circularidade) |

**Exemplo de formulário web:**
```
Pressão Arterial (mmHg): [120] / [80]
Frequência Cardíaca (bpm): [72]
Frequência Respiratória: [18]
Temperatura (°C): [36.8]
SpO2 (%): [98]
Glicose (mg/dL): [110]
Creatinina (mg/dL): [1.0]
Hemoglobina (g/dL): [13.5]
Leucócitos: [7.2]
→ [PREVER] → "Severity: Moderate (prob: 0.62)"
```

---

### 2️⃣ `readmission_30d` — **Foco Operacional/Gestão**

| Aspecto | Detalhes |
|---------|----------|
| **Objetivo** | Identificar pacientes para follow-up pós-alta |
| **Inputs (formulário web)** | Idade, Charlson, tipo de encounter, departamento, LOS, sinais vitais na alta, comorbidades |
| **Features** | Mistas (numéricas + categóricas) — requer `ColumnTransformer` |
| **⚠️ Vazamento — REMOVER** | `discharge_disposition`, `icu_admitted`, `in_hospital_mortality`, `readmission_30d` (target) |
| **Naive Bayes ideal** | `CategoricalNB` (maioria categórica) ou Pipeline misto |
| **Interpretação** | "Alto risco → agendar follow-up 7 dias, telemonitoramento" |
| **Métricas** | Recall (minimizar falsos negativos), F1, matriz 2×2 |
| **Impacto real** | Redução de penalidades financeiras (HRRP), qualidade assistencial |

**Exemplo de formulário web:**
```
Idade: [72]
Charlson Comorbidity Index: [3]
Tipo de Internação: [Emergency / Inpatient / Outpatient]
Departamento: [Cardiology / General Medicine / ...]
Tempo de Internação (dias): [5]
Diagnóstico Principal: [I50.0 - Heart Failure]
→ [PREVER] → "Readmissão 30d: SIM (prob: 0.74)"
```

---

### 3️⃣ `admission_urgency` — **Foco Triagem/Emergência**

| Aspecto | Detalhes |
|---------|----------|
| **Objetivo** | Classificar urgência na chegada ao PS |
| **Inputs** | Queixa principal, sinais vitais, idade, comorbidades |
| **Features** | Mistas |
| **Naive Bayes** | Misto |
| **Interpretação** | "Emergency → sala vermelha"; "Elective → agendado" |
| **Limitação** | Urgência muitas vezes já conhecida na triagem (menos "preditivo") |

---

## ❌ Variáveis a EVITAR

| Variável | Problema Principal |
|----------|-------------------|
| `in_hospital_mortality` | 90/10 → métricas enganosas, precisa undersampling/SMOTE |
| `icu_admitted` | 96/4 → extremo |
| `hospital_acquired_infection` | 97/3 → extremo |
| `disease_category` | 11 classes → muitas para NB + interface |
| `department` | 8 classes + vazamento (especialidade já conhecida) |
| `discharge_disposition` | 71% "Home" + 5% NaN |
| `gender`, `blood_group`, `race_ethnicity` | Baixo poder preditivo + viés ético |

---

## 🎯 Decisão Final

### Escolha **`disease_severity`** se:
- Quer modelo **clinicamente forte** com features numéricas ricas
- Prefere `GaussianNB` (mais simples, elegante)
- O formulário web faz sentido: **sinais vitais → gravidade**
- Quer demonstrar pipeline limpo (numérico → GaussianNB)

### Escolha **`readmission_30d`** se:
- Quer impacto **operacional/financeiro** claro
- Prefere problema **binário** (mais simples para métricas)
- O time de backend/frontend quer formulário de **alta hospitalar**
- Aceita lidar com features mistas + `ColumnTransformer`

---

## ✅ Próximo Passo (após sua escolha)

1. **Confirmar variável-alvo** aqui
2. Criar `01_exploracao.ipynb` com:
   - Carregamento e join das tabelas necessárias
   - EDA completa (describe, histogramas, correlações)
   - Justificativa documentada da escolha
   - Lista final de features (removendo IDs, datas, vazamento)
3. Definir pré-processamento no `02_treino.ipynb`
4. Treinar, avaliar, exportar `modelo_nb.joblib`
5. Gerar `CONTRATO.md` com campos do formulário

---

**Qual você escolhe?** 👉 `disease_severity` | `readmission_30d` | `admission_urgency` | Outra?

*Responda e começo o notebook de exploração.*