# ML — Predição de Readmissão Hospitalar 30 Dias

Pasta de **exploração dos dados, treino e avaliação** do modelo. Ela não é executada em produção: o que vai para o backend é apenas o modelo exportado (`modelo_nb.joblib`).

---

## Responsabilidades

- Explorar o dataset e definir a **variável alvo** da predição (`readmission_30d`).
- Fazer a limpeza, feature engineering e pré-processamento dos dados.
- Treinar, comparar e avaliar os modelos candidatos (Naive Bayes — obrigatório pelo trabalho).
- Exportar o modelo final (pipeline completo: pré-processamento + Naive Bayes) para `backend/model/`.
- Documentar o contrato de API em `ml/CONTRATO.md`.

---

## Dataset

**Hospital Management Data (Kaggle)** — https://www.kaggle.com/datasets/deeplumiere/hospital-management-data

- 4 tabelas principais: `patients.csv` (5.000), `visits_encounters.csv` (13.214), `clinical_details.csv` (13.214), `pharmacy_prescriptions.csv` (26.715)
- Target: `readmission_30d` (binária: 0 = não readmite, 1 = readmite em ≤30 dias) — desbalanceamento 67/33%
- **Dataset sintético** — padrões podem não generalizar para EHR reais

> Antes de usar, confirme a licença do dataset na página do Kaggle.
> Baixe os arquivos e coloque-os em `ml/data/`. Essa pasta **não é versionada** no Git.

---

## Estrutura

```
ml/
├── notebooks/
│   ├── 01_exploracao.ipynb    # EDA, joins, feature engineering, decisões
│   └── 02_treino.ipynb        # Pipeline, treino, avaliação, exportação
├── data/                      # CSVs do dataset (fora do Git)
├── requirements.txt           # Dependências fixas (pip freeze)
├── teste_carregamento.py      # Teste standalone de carregamento/predição do modelo
├── CONTRATO.md                # Contrato de API (campos, tipos, saída)
├── CONTRATO_INTEGRACAO.md     # Contrato ML ↔ Backend ↔ Frontend
├── ARQUITETURA_ML_BACKEND.md  # Fluxo de integração
└── README.md
```

---

## Decisões do Modelo

| Item | Decisão |
|------|---------|
| **Variável alvo** | `readmission_30d` (binária) |
| **Classes** | 0 = Baixo Risco (não readmite), 1 = Alto Risco (readmite) |
| **Campos de entrada (contrato)** | 38 campos: 9 demografia + 8 internação + 12 clínico na alta + 9 medicações (ver `ml/CONTRATO.md`) |
| **Features usadas pelo modelo** | 38 (17 numéricas + 21 categóricas) → 85 colunas após OneHot. Inclui `baseline_charlson_comorbidity_index` (corrigido em 2026-11-21) |
| **Ordem das features** | Fixada em `ml/CONTRATO.md` (igual ao treino) |
| **Pré-processamento** | `ColumnTransformer`: `SimpleImputer(median)` + `StandardScaler` (num) / `SimpleImputer(most_frequent)` + `OneHotEncoder(handle_unknown='ignore')` (cat) |
| **Modelo final** | `GaussianNB` (Naive Bayes) — requisito do trabalho |
| **Split** | 80/20 estratificado, `random_state=42` |
| **Métricas principais** | Accuracy, Precision/Recall/F1 (macro), AUC-ROC, AUC-PR, Matriz de Confusão |
| **Baseline comparativo** | Logistic Regression (apenas referência) |

---

## Métricas no Teste (20% = 2.643 amostras)

| Métrica | Valor |
|---------|-------|
| **Accuracy** | 0.6023 |
| **Precision (macro)** | 0.6032 |
| **Recall (macro)** | 0.6166 |
| **F1-score (macro)** | 0.5909 |
| **AUC-ROC** | 0.6518 |
| **AUC-PR** | 0.4455 |

**Matriz de Confusão:**
```
                 Predito 0    Predito 1
Real 0 (Não)      1025          745
Real 1 (Sim)       298          575
```

> **Nota**: O baseline Logistic Regression obteve Accuracy=0.64, F1-macro=0.62, AUC=0.70 — superior ao NB, como esperado para features correlacionadas. O Naive Bayes foi mantido por ser requisito do trabalho.

---

## Como Rodar

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

### Executar Notebooks (em ordem)

```bash
# 1. Análise exploratória e feature engineering
jupyter nbconvert --to notebook --execute notebooks/01_exploracao.ipynb --output notebooks/01_exploracao.ipynb

# 2. Treino, avaliação e exportação do modelo
jupyter nbconvert --to notebook --execute notebooks/02_treino.ipynb --output notebooks/02_treino_executed.ipynb
```

> O modelo será salvo em `backend/model/modelo_nb.joblib`.

### Testar Carregamento Standalone

```bash
python teste_carregamento.py
```

> Requer o `backend/model/modelo_nb.joblib` gerado pelo notebook `02_treino.ipynb`.

Saída esperada:
```
[OK] Modelo carregado com sucesso
Classe predita: 1 (Alto Risco)
Probabilidade classe 0: 0.0000
Probabilidade classe 1: 1.0000
Score de risco (%): 100.0%
[OK] Todos os testes passaram!
```

---

## Versões Críticas (Registrar na Entrega)

```bash
python --version
python -c "import sklearn; print(sklearn.__version__)"  # requirements.txt fixa scikit-learn==1.9.1
```

> **Regra**: Backend **deve usar a mesma versão do scikit-learn** do treino. Se divergir, re-treinar.

---

## Limitações Conhecidas (Para Apresentação e Documentação)

1. **Dataset sintético** — Padrões podem não generalizar para EHR reais
2. **Features de alta (vazamento potencial)** — Vitals/labs/meds coletados **no momento da alta**; em produção usar valores *pré-alta* (24h antes) ou prever *antes* da decisão de alta
3. **`days_since_last_discharge` = 38% NaN** → Flag `first_admission_flag` captura; imputação com -1
4. **Independência NB** — Features correlacionadas (PA, meds cardíacas, labs) violam假设 do Naive Bayes
5. **Desbalanceamento 67/33** → Macro-F1 usado; considerar *threshold tuning* se custo FN >> FP
6. **Split aleatório** — Em produção usar *time-series split* (treino: meses antigos, teste: mês recente)
7. **Generalização geográfica** — Dataset sem localização; práticas de alta variam por país/sistema
8. **Baseline LR superior** — Regressão Logística costuma bater NB em features correlacionadas; NB escolhido por requisito do trabalho
9. **Charlson corrigido** — Corrigido em 2026-11-21: o notebook agora usa `baseline_charlson_comorbidity_index` (nome real no patients.csv). O modelo foi retreinado com 38 features incluindo Charlson, com melhoria nas métricas (F1-macro: 0.585 → 0.591, AUC-ROC: 0.647 → 0.652)

---

## Entregáveis (Checklist)

- [x] `ml/notebooks/01_exploracao.ipynb` — EDA completa, joins, feature engineering, justificativas
- [x] `ml/notebooks/02_treino.ipynb` — Pipeline, treino, avaliação, exportação, limitações
- [ ] `backend/model/modelo_nb.joblib` — Pipeline completo (preprocess + GaussianNB) — **ainda não versionado**; gerar rodando `02_treino.ipynb`
- [x] `ml/teste_carregamento.py` — Teste standalone (caminho do modelo a conferir)
- [x] `ml/CONTRATO.md` — 38 campos documentados com tipos, ranges, saída JSON
- [x] `ml/README.md` — Decisões, versões, como rodar, limitações
- [x] `ml/requirements.txt` — `pip freeze` fixo
- [ ] `.gitignore` — hoje só ignora `.venv`; falta `ml/data/`, `*.joblib` e `__pycache__/`

---

## Contrato com Backend/Frontend

Ver `ml/CONTRATO.md` para:
- 38 campos de entrada na ordem exata do treino (37 efetivamente usados pelo modelo, ver Limitações, item 9)
- Tipos, ranges e valores aceitos por campo
- Formato de saída JSON (classe, probabilidades, score %, recomendação)
- Exemplo de requisição cURL
- Notas de implementação para o backend

---

## Contato

- **ML Owner**: Patric (Probabilidade e Estatística — IFCE)
- **Dataset**: https://www.kaggle.com/datasets/deeplumiere/hospital-management-data
- **Modelo**: Naive Bayes (GaussianNB) + ColumnTransformer
- **Random State**: 42 (reprodutibilidade)