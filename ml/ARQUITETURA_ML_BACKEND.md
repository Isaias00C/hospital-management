# Arquitetura de Integração ML ↔ Backend — Predição de Readmissão 30 Dias

> **Contexto**: Aplicação ponta a ponta (Frontend + Backend + ML) para trabalho de Probabilidade e Estatística (IFCE).
> **Modelo**: Naive Bayes serializado como `modelo_nb.joblib` (Pipeline completo: pré-processamento + classificador).

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────┐     HTTPS/JSON      ┌─────────────────┐     Python/joblib      ┌──────────────┐
│   FRONTEND      │ ◄─────────────────► │    BACKEND      │ ◄────────────────────► │   MODELLO    │
│  (HTML/JS/CSS)  │   POST /predict     │  (Flask/Django) │   load(modelo_nb)    │  (.joblib)   │
└─────────────────┘                     └─────────────────┘                       └──────────────┘
        │                                       │                                       │
        │ 1. Usuário preenche form              │ 2. Valida JSON                        │ 4. pipeline.predict_proba()
        │ 2. Envia JSON                         │ 3. Converte para DataFrame            │ 5. Retorna probs + classe
        │ 6. Exibe resultado                    │ 5. Serializa resposta JSON            │
```

---

## 2. Contrato de Dados (Já definido em `CONTRATO.md`)

### Request (Frontend → Backend)
```json
POST /api/v1/predict/readmission-30d
Content-Type: application/json

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
}
```

### Response (Backend → Frontend)
```json
{
  "predicted_class": 1,
  "class_label": "Alto Risco",
  "probabilities": {
    "0": 0.26,
    "1": 0.74
  },
  "risk_score_percent": 74,
  "recommendation": "Agendar follow-up em 7 dias + telemonitoramento diário + reconciliação medicamentosa com farmacêutico",
  "model_version": "1.0",
  "timestamp": "2026-11-20T14:32:15Z"
}
```

---

## 3. Implementação no Backend (Flask — Exemplo Mínimo)

### Estrutura de Pastas
```
backend/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── predict.py          # Blueprint /predict
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── readmission.py      # Pydantic/ marshmallow schema
│   ├── services/
│   │   ├── __init__.py
│   │   └── model_service.py    # Carrega e usa o modelo
│   └── utils/
│       ├── __init__.py
│       └── preprocessing.py    # Helpers (opcional)
├── model/
│   └── modelo_nb.joblib        # Copiado de ml/backend/model/
├── config.py
├── requirements.txt
└── run.py
```

### `backend/app/services/model_service.py`
```python
"""Serviço de carregamento e inferência do modelo Naive Bayes."""
import joblib
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class ModelService:
    """Singleton para carregar o modelo uma única vez na inicialização."""
    
    _instance = None
    _model = None
    _feature_order = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load_model(self, model_path: str = None) -> None:
        """Carrega o pipeline joblib. Chamado uma vez no startup."""
        if model_path is None:
            model_path = Path(__file__).parent.parent.parent / "model" / "modelo_nb.joblib"
        
        logger.info(f"Carregando modelo de {model_path}")
        self._model = joblib.load(model_path)
        
        # Extrair ordem das features do ColumnTransformer (se acessível)
        # Pipeline: ColumnTransformer -> NB
        if hasattr(self._model, 'named_steps'):
            preprocessor = self._model.named_steps.get('preprocessor') \
                          or self._model.named_steps.get('columntransformer')
            if preprocessor and hasattr(preprocessor, 'feature_names_in_'):
                self._feature_order = list(preprocessor.feature_names_in_)
                logger.info(f"Features esperadas ({len(self._feature_order)}): {self._feature_order}")
        
        logger.info("Modelo carregado com sucesso")
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa predição única.
        
        Args:
            input_data: Dict com 28 campos (conforme CONTRATO.md)
            
        Returns:
            Dict com predicted_class, probabilities, risk_score, recommendation
        """
        if self._model is None:
            raise RuntimeError("Modelo não carregado. Chame load_model() no startup.")
        
        # 1. Converter para DataFrame com ordem correta
        df = pd.DataFrame([input_data])
        
        if self._feature_order:
            # Garantir ordem e preencher faltantes com NaN (pipeline trata)
            df = df.reindex(columns=self._feature_order)
        
        # 2. Predição (pipeline faz pré-processamento internamente)
        proba = self._model.predict_proba(df)[0]  # shape: (2,)
        pred_class = self._model.predict(df)[0]    # 0 ou 1
        
        # 3. Formatar resposta
        prob_0, prob_1 = float(proba[0]), float(proba[1])
        risk_score = round(prob_1 * 100)
        
        return {
            "predicted_class": int(pred_class),
            "class_label": "Alto Risco" if pred_class == 1 else "Baixo Risco",
            "probabilities": {"0": round(prob_0, 4), "1": round(prob_1, 4)},
            "risk_score_percent": risk_score,
            "recommendation": self._get_recommendation(pred_class, risk_score),
            "model_version": "1.0"
        }
    
    def _get_recommendation(self, pred_class: int, risk_score: int) -> str:
        if pred_class == 1:
            if risk_score >= 80:
                return ("ALTO RISCO CRÍTICO: Agendar follow-up em 48h + telemonitoramento contínuo + "
                        "reconciliação medicamentosa + avaliação de suporte social")
            elif risk_score >= 60:
                return ("ALTO RISCO: Agendar follow-up em 7 dias + telemonitoramento diário + "
                        "reconciliação medicamentosa com farmacêutico")
            else:
                return ("RISCO MODERADO: Agendar follow-up em 14 dias + orientação de sinais de alarma + "
                        "revisão de medicações de alto risco")
        else:
            if risk_score >= 40:
                return ("RISCO BAIXO-MODERADO: Orientação padrão de alta + sinais de alarma + "
                        "contato se piora em 72h")
            return "BAIXO RISCO: Alta padrão com orientações de rotina"


# Instância global (singleton)
model_service = ModelService()
```

### `backend/app/schemas/readmission.py` (Validação com Pydantic)
```python
"""Schema de validação da request de predição."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from enum import Enum

class Gender(str, Enum):
    M = "M"
    F = "F"

class SmokerStatus(str, Enum):
    NEVER = "Never"
    FORMER = "Former"
    CURRENT = "Current"

class SocioeconomicTier(str, Enum):
    LOW = "Low"
    MIDDLE = "Middle"
    HIGH = "High"

class ResidentialZone(str, Enum):
    RURAL = "Rural"
    SUBURBAN = "Suburban"
    URBAN = "Urban"

class MaritalStatus(str, Enum):
    SINGLE = "Single"
    MARRIED = "Married"
    DIVORCED = "Divorced"
    WIDOWED = "Widowed"

class EncounterType(str, Enum):
    EMERGENCY = "Emergency"
    INPATIENT = "Inpatient"
    OUTPATIENT = "Outpatient"

class AdmissionUrgency(str, Enum):
    ELECTIVE = "Elective"
    URGENT = "Urgent"
    EMERGENCY = "Emergency"

class Department(str, Enum):
    GENERAL_MEDICINE = "General Medicine"
    CARDIOLOGY = "Cardiology"
    ICU = "ICU"
    ORTHOPEDICS = "Orthopedics"
    GENERAL_SURGERY = "General Surgery"
    PEDIATRICS = "Pediatrics"
    ONCOLOGY = "Oncology"
    OBSTETRICS = "Obstetrics"

class DiseaseCategory(str, Enum):
    RESPIRATORY = "Respiratory"
    CARDIOVASCULAR = "Cardiovascular"
    INFECTIOUS = "Infectious"
    RENAL = "Renal"
    GI = "GI"
    ENDOCRINE = "Endocrine"
    ONCOLOGY = "Oncology"
    MUSCULOSKELETAL = "Musculoskeletal"
    TRAUMA = "Trauma"
    PEDIATRICS = "Pediatrics"
    OBSTETRICS = "Obstetrics"

class DiseaseSeverity(str, Enum):
    MILD = "Mild"
    MODERATE = "Moderate"
    SEVERE = "Severe"
    CRITICAL = "Critical"

class PredictRequest(BaseModel):
    # Demografia
    age: int = Field(ge=0, le=110)
    gender: Gender
    charlson_comorbidity_index: int = Field(ge=0, le=15)
    bmi: float = Field(ge=10.0, le=60.0)
    smoker_status: SmokerStatus
    socioeconomic_tier: SocioeconomicTier
    residential_zone: ResidentialZone
    marital_status: MaritalStatus
    
    # Internação
    encounter_type: EncounterType
    admission_urgency: AdmissionUrgency
    department: Department
    length_of_stay_days: int = Field(ge=0, le=60)
    revisit_count: int = Field(ge=0, le=20)
    days_since_last_discharge: Optional[int] = Field(default=None, ge=0, le=3650)
    first_admission_flag: int = Field(ge=0, le=1)
    
    # Clínico na Alta
    systolic_bp: int = Field(ge=60, le=250)
    diastolic_bp: int = Field(ge=30, le=150)
    heart_rate: int = Field(ge=30, le=200)
    respiratory_rate: int = Field(ge=5, le=60)
    temperature: float = Field(ge=34.0, le=42.0)
    spo2: int = Field(ge=70, le=100)
    glucose: int = Field(ge=40, le=500)
    creatinine: float = Field(ge=0.3, le=15.0)
    hemoglobin: float = Field(ge=4.0, le=20.0)
    wbc_count: float = Field(ge=1.0, le=50.0)
    disease_category: DiseaseCategory
    disease_severity: DiseaseSeverity
    
    # Medicações
    num_medications: int = Field(ge=0, le=30)
    num_therapeutic_classes: int = Field(ge=0, le=15)
    polypharmacy_flag: int = Field(ge=0, le=1)
    has_high_risk_med: int = Field(ge=0, le=1)
    has_anticoagulant: int = Field(ge=0, le=1)
    has_insulin: int = Field(ge=0, le=1)
    has_diuretic: int = Field(ge=0, le=1)
    has_beta_blocker: int = Field(ge=0, le=1)
    has_ace_arb: int = Field(ge=0, le=1)

    @field_validator('days_since_last_discharge', mode='before')
    @classmethod
    def handle_null_days(cls, v):
        """Aceita null/None para primeira internação."""
        return v

class PredictResponse(BaseModel):
    predicted_class: int
    class_label: str
    probabilities: dict
    risk_score_percent: int
    recommendation: str
    model_version: str
```

### `backend/app/routes/predict.py`
```python
"""Rotas de predição."""
from flask import Blueprint, request, jsonify, current_app
from app.services.model_service import model_service
from app.schemas.readmission import PredictRequest, PredictResponse
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

predict_bp = Blueprint('predict', __name__, url_prefix='/api/v1')

@predict_bp.route('/predict/readmission-30d', methods=['POST'])
def predict_readmission():
    """
    Endpoint de predição de readmissão 30 dias.
    
    Request: JSON com 28 campos (ver PredictRequest)
    Response: JSON com classe, probabilidades, score e recomendação
    """
    try:
        # 1. Validar request
        json_data = request.get_json()
        if not json_data:
            return jsonify({"error": "Body JSON obrigatório"}), 400
        
        try:
            validated = PredictRequest(**json_data)
        except ValidationError as e:
            logger.warning(f"Validação falhou: {e.errors()}")
            return jsonify({
                "error": "Dados de entrada inválidos",
                "details": e.errors()
            }), 422
        
        # 2. Converter para dict (excluir None para days_since_last_discharge)
        input_dict = validated.model_dump(exclude_none=True)
        
        # 3. Predição
        result = model_service.predict(input_dict)
        
        # 4. Validar response (opcional, garante contrato)
        response = PredictResponse(**result)
        
        logger.info(f"Predição: class={result['predicted_class']}, risk={result['risk_score_percent']}%")
        return jsonify(response.model_dump()), 200
        
    except RuntimeError as e:
        logger.error(f"Erro no modelo: {e}")
        return jsonify({"error": "Modelo não disponível"}), 503
    except Exception as e:
        logger.exception("Erro inesperado na predição")
        return jsonify({"error": "Erro interno do servidor"}), 500


@predict_bp.route('/health', methods=['GET'])
def health_check():
    """Health check para load balancer / monitoramento."""
    return jsonify({
        "status": "ok",
        "service": "readmission-prediction",
        "model_version": "1.0",
        "model_loaded": model_service._model is not None
    }), 200
```

### `backend/app/__init__.py` (Factory Pattern)
```python
"""Factory da aplicação Flask."""
from flask import Flask
from app.routes.predict import predict_bp
from app.services.model_service import model_service
import os
import logging

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Config
    app.config['MODEL_PATH'] = os.getenv(
        'MODEL_PATH', 
        os.path.join(os.path.dirname(__file__), '..', 'model', 'modelo_nb.joblib')
    )
    
    # Logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Registrar blueprints
    app.register_blueprint(predict_bp)
    
    # Carregar modelo no startup (before_first_request depreciado em Flask 2.3+)
    with app.app_context():
        model_service.load_model(app.config['MODEL_PATH'])
    
    return app
```

### `backend/run.py`
```python
"""Entry point para desenvolvimento."""
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### `backend/requirements.txt`
```
flask==3.0.3
pydantic==2.8.2
pandas==2.2.2
scikit-learn==1.5.1
joblib==1.4.2
gunicorn==22.0.0  # para produção
python-dotenv==1.0.1
```

---

## 4. Deploy e Versionamento do Modelo

### Estratégia de Versionamento

```
backend/model/
├── modelo_nb_v1.0.joblib      # Versão atual em produção
├── modelo_nb_v1.1.joblib      # Nova versão (retrain com mais dados)
└── metadata.json              # Metadados de cada versão
```

### `backend/model/metadata.json`
```json
{
  "current_version": "1.0",
  "versions": {
    "1.0": {
      "trained_at": "2026-11-20T10:00:00Z",
      "sklearn_version": "1.5.1",
      "python_version": "3.11.9",
      "metrics": {
        "macro_f1": 0.73,
        "recall": 0.67,
        "accuracy": 0.80,
        "auc_roc": 0.82
      },
      "features_count": 28,
      "training_samples": 10571,
      "test_samples": 2643,
      "git_commit": "a1b2c3d"
    }
  }
}
```

### Rollback Seguro
```python
# No model_service.py, adicionar:
def load_version(self, version: str = "current") -> None:
    """Carrega versão específica do modelo."""
    import json
    metadata_path = Path(__file__).parent.parent / "model" / "metadata.json"
    with open(metadata_path) as f:
        meta = json.load(f)
    
    if version == "current":
        version = meta["current_version"]
    
    model_file = f"modelo_nb_v{version}.joblib"
    self.load_model(str(Path(__file__).parent.parent / "model" / model_file))
```

---

## 5. Frontend — Consumo da API (JavaScript Vanilla)

### `frontend/js/api.js`
```javascript
/** Cliente da API de predição. */
const API_BASE = '/api/v1';  // Ajustar se backend em outro host/porta

export async function predictReadmission(formData) {
    const response = await fetch(`${API_BASE}/predict/readmission-30d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
}

export async function checkHealth() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
}
```

### `frontend/js/form-handler.js` (Trecho)
```javascript
/** Manipula envio do formulário e exibição do resultado. */
import { predictReadmission } from './api.js';

const form = document.getElementById('readmission-form');
const resultCard = document.getElementById('result-card');
const loadingSpinner = document.getElementById('loading');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Coletar dados do form (28 campos)
    const formData = collectFormData();  // Implementar conforme seus inputs
    
    // 2. Mostrar loading
    loadingSpinner.style.display = 'block';
    resultCard.style.display = 'none';
    
    try {
        // 3. Chamar API
        const result = await predictReadmission(formData);
        
        // 4. Renderizar resultado
        renderResult(result);
    } catch (error) {
        showError(error.message);
    } finally {
        loadingSpinner.style.display = 'none';
    }
});

function renderResult(result) {
    const isHighRisk = result.predicted_class === 1;
    const riskClass = isHighRisk ? 'risk-high' : 'risk-low';
    const badgeClass = isHighRisk ? 'badge-danger' : 'badge-success';
    
    resultCard.innerHTML = `
        <div class="result-header ${riskClass}">
            <span class="badge ${badgeClass}">${result.class_label}</span>
            <h3>Score de Risco: ${result.risk_score_percent}%</h3>
        </div>
        <div class="probability-bars">
            <div class="prob-bar">
                <span>Baixo Risco</span>
                <div class="bar"><div class="fill" style="width: ${result.probabilities['0']*100}%"></div></div>
                <span>${(result.probabilities['0']*100).toFixed(1)}%</span>
            </div>
            <div class="prob-bar">
                <span>Alto Risco</span>
                <div class="bar"><div class="fill" style="width: ${result.probabilities['1']*100}%"></div></div>
                <span>${(result.probabilities['1']*100).toFixed(1)}%</span>
            </div>
        </div>
        <div class="recommendation">
            <strong>Recomendação:</strong> ${result.recommendation}
        </div>
        <small class="text-muted">Modelo v${result.model_version} • ${new Date().toLocaleString('pt-BR')}</small>
    `;
    
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
}
```

---

## 6. Segurança e LGPD

| Aspecto | Implementação |
|---------|---------------|
| **Dados sensíveis** | Não logar PII (nome, CPF, prontuário). O modelo não recebe identificadores. |
| **HTTPS** | Obrigatório em produção (TLS 1.2+). |
| **Rate limiting** | Flask-Limiter: ex: 60 req/min por IP. |
| **Validação estrita** | Pydantic schema rejeita campos extras/inesperados. |
| **CORS** | Configurar `flask-cors` apenas para domínio do frontend. |
| **Auditoria** | Log de request/response (sem PII) com correlation ID. |

---

## 7. Observabilidade

### Logs Estruturados (JSON)
```python
# Em model_service.py, no predict():
import json
import uuid

correlation_id = str(uuid.uuid4())[:8]
logger.info(json.dumps({
    "event": "prediction",
    "correlation_id": correlation_id,
    "predicted_class": pred_class,
    "risk_score": risk_score,
    "latency_ms": latency_ms
}))
```

### Métricas Prometheus (Opcional)
```python
from prometheus_client import Counter, Histogram

PREDICTIONS_TOTAL = Counter('predictions_total', 'Total de predições', ['class'])
PREDICTION_LATENCY = Histogram('prediction_latency_seconds', 'Latência da predição')

with PREDICTION_LATENCY.time():
    result = model_service.predict(input_dict)
PREDICTIONS_TOTAL.labels(class=str(result['predicted_class'])).inc()
```

---

## 8. Checklist de Integração (ML → Backend)

- [ ] **Modelo treinado** salva em `ml/backend/model/modelo_nb.joblib` (Pipeline completo)
- [ ] **Teste de carregamento** (`ml/teste_carregamento.py`) passa: `predict` + `predict_proba` funcionam
- [ ] **Ordem das features** documentada e testada (mesma ordem do treino)
- [ ] **Backend carrega modelo** no startup (singleton, não a cada request)
- [ ] **Schema de validação** (Pydantic) cobre todos os 28 campos com ranges corretos
- [ ] **Endpoint `/predict`** retorna JSON conforme `CONTRATO.md`
- [ ] **Endpoint `/health`** retorna status + versão do modelo
- [ ] **Frontend consome API** e exibe badge, score, barras, recomendação
- [ ] **Tratamento de erros**: 400 (JSON inválido), 422 (validação), 503 (modelo não carregado), 500 (inesperado)
- [ ] **LGPD**: Nenhum identificador pessoal no payload ou logs
- [ ] **Documentação**: `CONTRATO.md` atualizado e compartilhado com equipe frontend/backend
- [ ] **Versão do sklearn** no backend = versão do treino (ver `requirements.txt`)

---

## 9. Fluxo de Desenvolvimento Contínuo

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   ML (Patric)    │     │  BACKEND (Equipe)│     │ FRONTEND (Equipe)│
│                  │     │                  │     │                  │
│ 1. Treina modelo │────►│ 2. Copia .joblib │     │                  │
│ 2. Exporta       │     │    para backend/ │     │                  │
│ 3. Atualiza      │     │ 3. Atualiza      │────►│ 4. Ajusta form   │
│    CONTRATO.md   │     │    schemas       │     │    conforme      │
│                  │     │ 4. Testa /predict│     │    CONTRATO.md   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
   Nova versão             Deploy                    Deploy
   (retrain)               (staging → prod)          (staging → prod)
```

---

## 10. Próximos Passos Imediatos

1. **ML**: Finalizar `02_treino.ipynb` → gerar `modelo_nb.joblib` em `ml/backend/model/`
2. **ML**: Rodar `ml/teste_carregamento.py` → confirmar que funciona
3. **ML**: Atualizar `CONTRATO.md` com campos finais (ordem exata do treino)
4. **Backend**: Criar estrutura Flask + copiar `modelo_nb.joblib` para `backend/model/`
5. **Backend**: Implementar `model_service.py` + schemas + routes
6. **Backend**: Testar `POST /predict` com payload de exemplo (Postman/curl)
7. **Frontend**: Ajustar formulário para 28 campos + consumir API
8. **Integração**: Teste ponta a ponta (Frontend → Backend → Modelo)

---

*Documento gerado em 2026-11-20. Versão 1.0 — Alinhamento técnico entre ML, Backend e Frontend.*