# Backend

API em **FastAPI** que recebe os dados do formulário, executa o modelo de machine learning (Naive Bayes, readmissão hospitalar em 30 dias) e devolve a predição ao frontend.

## Responsabilidades

- Validar a entrada com Pydantic (tipos, limites e valores permitidos).
- Converter os campos do formulário para o formato do modelo e calcular os campos derivados.
- Carregar o modelo **uma única vez**, na inicialização, e reutilizá-lo nas requisições.
- Configurar o CORS para aceitar requisições do frontend.

## Estrutura

```
backend/
├── app/
│   ├── main.py       # app FastAPI, CORS, lifespan (carrega o modelo) e rotas
│   ├── config.py     # configurações (.env): CORS, caminho do modelo
│   ├── schemas.py    # modelos Pydantic de entrada e saída
│   └── ml.py         # feature engineering + predict()
├── model/
│   └── modelo_nb.joblib   # pipeline exportado pela pasta ml/
├── tests/            # pytest (usam um modelo fictício, não precisam do .joblib)
├── pyproject.toml    # dependências (uv)
└── README.md
```

## Endpoints

| Método | Rota                                | Descrição                                   |
|--------|-------------------------------------|---------------------------------------------|
| GET    | `/health`                           | Status da API e se o modelo foi carregado   |
| POST   | `/api/v1/predict/readmission-30d`   | Recebe os campos do formulário e prediz     |

### Entrada (`POST /api/v1/predict/readmission-30d`)

33 campos (os nomes e limites seguem `ml/CONTRATO_INTEGRACAO.md`). Valores inválidos retornam `422`.

```json
{
  "age": 72, "gender": "M", "charlson_comorbidity_index": 3, "bmi": 28.5,
  "smoker_status": "Former", "socioeconomic_tier": "Middle",
  "residential_zone": "Urban", "marital_status": "Married",
  "encounter_type": "Emergency", "admission_urgency": "Urgent",
  "department": "Cardiology", "length_of_stay_days": 5, "revisit_count": 2,
  "days_since_last_discharge": 45,
  "systolic_bp": 138, "diastolic_bp": 82, "heart_rate": 88,
  "respiratory_rate": 18, "temperature": 36.8, "spo2": 95, "glucose": 112,
  "creatinine": 1.2, "hemoglobin": 13.4, "wbc_count": 7.8,
  "disease_category": "Cardiovascular", "disease_severity": "Moderate",
  "num_medications": 6, "num_therapeutic_classes": 4,
  "has_high_risk_med": 1, "has_anticoagulant": 1, "has_insulin": 0,
  "has_diuretic": 1, "has_beta_blocker": 1, "has_ace_arb": 1
}
```

- `charlson_comorbidity_index` é **opcional**: o modelo atual não o utiliza.
- `days_since_last_discharge` aceita `null` (primeira internação).
- Campos fora do contrato são rejeitados.
- O backend calcula sozinho `is_elderly`, `los_category`, `first_admission_flag` e `polypharmacy_flag`, e renomeia `bmi` → `baseline_bmi` e `days_since_last_discharge` → `days_since_last_discharge_filled` (`null` vira `-1`).

### Saída

```json
{
  "predicted_class": 1,
  "class_label": "Alto Risco",
  "probabilities": { "0": 0.26, "1": 0.74 },
  "risk_score_percent": 74,
  "recommendation": "ALTO RISCO: Agendar follow-up em 7 dias + ...",
  "model_version": "1.0"
}
```

Classe 1 quando `P(readmissão) >= 0.5`. Se o modelo não estiver carregado, a predição responde `503` e `/health` retorna `status: "degraded"`.

## Como rodar localmente

```bash
cd backend
uv sync
uv run fastapi dev app/main.py     # ou: uv run uvicorn app.main:app --reload
```

Documentação interativa em `http://localhost:8000/docs`.

### Testes

```bash
uv run pytest
```

## Configuração (`.env`, não versionado)

| Variável       | Padrão                                          | Descrição                          |
|----------------|-------------------------------------------------|------------------------------------|
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173`   | Origens do frontend, separadas por vírgula |
| `MODEL_PATH`   | `model/modelo_nb.joblib`                        | Caminho do modelo                  |
| `MODEL_VERSION`| `1.0`                                           | Versão devolvida na resposta       |

## Observações

- **Versões fixas:** o `.joblib` só carrega com a mesma versão do scikit-learn usada no treino. O `pyproject.toml` fixa `scikit-learn==1.9.1`, `pandas==3.1.1` e `numpy==2.5.5`, iguais aos de `ml/requirements.txt`.
- **Paridade com o treino:** `los_category` usa os mesmos bins do notebook (`[0, 1, 3, 7, 60]`). `length_of_stay_days = 0` vira `NaN`, como no treino, e o imputer do pipeline preenche.
- **Ordem das colunas:** vem de `feature_names_in_` do pipeline carregado; se o modelo for retreinado com outras colunas, o backend acompanha.
- O arquivo `model/modelo_nb.joblib` é pequeno (Naive Bayes) e pode ser versionado.
