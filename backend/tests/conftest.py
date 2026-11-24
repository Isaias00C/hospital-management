"""Fixtures: um pipeline fictício com a mesma estrutura do modelo real.

Replica as 37 colunas do treino (sem o Charlson, como no notebook) e o mesmo
`ColumnTransformer`, para testar a API sem depender do `modelo_nb.joblib`.
"""

import joblib
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.config import settings
from app.main import app

NUMERIC = [
    "age", "baseline_bmi", "length_of_stay_days", "revisit_count",
    "days_since_last_discharge_filled", "systolic_bp", "diastolic_bp",
    "heart_rate", "respiratory_rate", "temperature", "spo2", "glucose",
    "creatinine", "hemoglobin", "wbc_count", "num_medications",
    "num_therapeutic_classes",
]  # fmt: skip

CATEGORICAL = {
    "gender": ["M", "F"],
    "smoker_status": ["Never", "Former", "Current"],
    "socioeconomic_tier": ["Low", "Middle", "High"],
    "residential_zone": ["Rural", "Suburban", "Urban"],
    "marital_status": ["Single", "Married", "Divorced", "Widowed"],
    "is_elderly": [0, 1],
    "encounter_type": ["Emergency", "Inpatient", "Outpatient"],
    "admission_urgency": ["Elective", "Urgent", "Emergency"],
    "department": ["General Medicine", "Cardiology", "ICU"],
    "los_category": ["0-1", "2-3", "4-7", "8+", np.nan],
    "first_admission_flag": [0, 1],
    "disease_category": ["Respiratory", "Cardiovascular", "Renal"],
    "disease_severity": ["Mild", "Moderate", "Severe", "Critical"],
    "polypharmacy_flag": [0, 1],
    "has_high_risk_med": [0, 1],
    "has_anticoagulant": [0, 1],
    "has_insulin": [0, 1],
    "has_diuretic": [0, 1],
    "has_beta_blocker": [0, 1],
    "has_ace_arb": [0, 1],
}  # fmt: skip


def make_fake_pipeline() -> Pipeline:
    rng = np.random.default_rng(42)
    n = 300
    X = pd.DataFrame({c: rng.normal(50, 10, n) for c in NUMERIC})
    for col, values in CATEGORICAL.items():
        X[col] = rng.choice(np.array(values, dtype=object), n)
    y = rng.integers(0, 2, n)

    pre = ColumnTransformer(
        [
            ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), NUMERIC),
            (
                "cat",
                Pipeline([
                    ("imp", SimpleImputer(strategy="most_frequent")),
                    ("enc", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                ]),
                list(CATEGORICAL),
            ),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )  # fmt: skip
    return Pipeline([("preprocessor", pre), ("classifier", GaussianNB())]).fit(X, y)


@pytest.fixture(scope="session")
def fake_model_path(tmp_path_factory):
    path = tmp_path_factory.mktemp("model") / "modelo_nb.joblib"
    joblib.dump(make_fake_pipeline(), path)
    return path


@pytest.fixture
def client(fake_model_path, monkeypatch):
    monkeypatch.setattr(settings, "model_path", fake_model_path)
    with TestClient(app) as c:
        yield c


@pytest.fixture
def client_without_model(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "model_path", tmp_path / "inexistente.joblib")
    with TestClient(app) as c:
        yield c


@pytest.fixture
def payload() -> dict:
    """Exemplo do ml/CONTRATO_INTEGRACAO.md (campos amigáveis)."""
    return {
        "age": 72, "gender": "M", "charlson_comorbidity_index": 3, "bmi": 28.5,
        "smoker_status": "Former", "socioeconomic_tier": "Middle",
        "residential_zone": "Urban", "marital_status": "Married",
        "encounter_type": "Emergency", "admission_urgency": "Urgent",
        "department": "Cardiology", "length_of_stay_days": 5, "revisit_count": 2,
        "days_since_last_discharge": 45, "systolic_bp": 138, "diastolic_bp": 82,
        "heart_rate": 88, "respiratory_rate": 18, "temperature": 36.8, "spo2": 95,
        "glucose": 112, "creatinine": 1.2, "hemoglobin": 13.4, "wbc_count": 7.8,
        "disease_category": "Cardiovascular", "disease_severity": "Moderate",
        "num_medications": 6, "num_therapeutic_classes": 4, "has_high_risk_med": 1,
        "has_anticoagulant": 1, "has_insulin": 0, "has_diuretic": 1,
        "has_beta_blocker": 1, "has_ace_arb": 1,
    }  # fmt: skip
