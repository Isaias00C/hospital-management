"""Inferência: converte a requisição em DataFrame e executa o pipeline.

O pipeline salvo (`ColumnTransformer` + `GaussianNB`) faz o pré-processamento
sozinho. Aqui só reproduzimos a feature engineering feita no notebook de treino.
"""

import math
from pathlib import Path

import joblib
import pandas as pd

from app.schemas import ReadmissionRequest, ReadmissionResponse

# Colunas na ordem do treino (ml/CONTRATO.md). Usada como fallback quando o
# pipeline não expõe `feature_names_in_`.
MODEL_COLUMNS = [
    "age", "gender", "baseline_charlson_comorbidity_index", "baseline_bmi",
    "smoker_status", "socioeconomic_tier", "residential_zone", "marital_status",
    "is_elderly",
    "encounter_type", "admission_urgency", "department", "length_of_stay_days",
    "los_category", "revisit_count", "days_since_last_discharge_filled",
    "first_admission_flag",
    "systolic_bp", "diastolic_bp", "heart_rate", "respiratory_rate",
    "temperature", "spo2", "glucose", "creatinine", "hemoglobin", "wbc_count",
    "disease_category", "disease_severity",
    "num_medications", "num_therapeutic_classes", "polypharmacy_flag",
    "has_high_risk_med", "has_anticoagulant", "has_insulin", "has_diuretic",
    "has_beta_blocker", "has_ace_arb",
]  # fmt: skip

# Campos "amigáveis" da API -> nomes usados no treino.
RENAMES = {
    "bmi": "baseline_bmi",
    "charlson_comorbidity_index": "baseline_charlson_comorbidity_index",
}


def load_model(path: Path):
    """Carrega o pipeline treinado. Levanta FileNotFoundError se não existir."""
    if not path.is_file():
        raise FileNotFoundError(f"Modelo não encontrado em {path}")
    return joblib.load(path)


def los_category(days: int) -> float | str:
    """Mesmos bins do treino: pd.cut(bins=[0, 1, 3, 7, 60], right=True).

    Fora do intervalo (0 ou >60) o treino gerou NaN; o imputer do pipeline
    preenche com a categoria mais frequente, então devolvemos NaN também.
    """
    if 0 < days <= 1:
        return "0-1"
    if 1 < days <= 3:
        return "2-3"
    if 3 < days <= 7:
        return "4-7"
    if 7 < days <= 60:
        return "8+"
    return math.nan


def build_features(req: ReadmissionRequest) -> dict:
    """Renomeia campos e calcula os derivados (is_elderly, los_category, ...)."""
    data = req.model_dump()
    for old, new in RENAMES.items():
        data[new] = data.pop(old)

    first_admission = data["days_since_last_discharge"] is None
    data["days_since_last_discharge_filled"] = (
        -1 if first_admission else data["days_since_last_discharge"]
    )
    data.pop("days_since_last_discharge")
    data["first_admission_flag"] = int(first_admission)
    data["is_elderly"] = int(data["age"] >= 65)
    data["los_category"] = los_category(data["length_of_stay_days"])
    data["polypharmacy_flag"] = int(data["num_medications"] >= 5)
    return data


def build_dataframe(req: ReadmissionRequest, model) -> pd.DataFrame:
    """Monta o DataFrame de uma linha com as colunas na ordem que o modelo espera."""
    columns = list(getattr(model, "feature_names_in_", MODEL_COLUMNS))
    # reindex preenche com NaN o que faltar (ex.: Charlson não informado);
    # os imputers do pipeline tratam esses casos.
    return pd.DataFrame([build_features(req)]).reindex(columns=columns)


def recommendation(predicted_class: int, risk_score: int) -> str:
    if predicted_class == 1:
        if risk_score >= 80:
            return (
                "ALTO RISCO CRÍTICO: Agendar follow-up em 48h + telemonitoramento "
                "contínuo + reconciliação medicamentosa + avaliação de suporte social"
            )
        if risk_score >= 60:
            return (
                "ALTO RISCO: Agendar follow-up em 7 dias + telemonitoramento diário "
                "+ reconciliação medicamentosa com farmacêutico"
            )
        return (
            "RISCO MODERADO: Agendar follow-up em 14 dias + orientação de sinais de "
            "alarme + revisão de medicações de alto risco"
        )
    if risk_score >= 40:
        return (
            "RISCO BAIXO-MODERADO: Orientação padrão de alta + sinais de alarme + "
            "contato se piora em 72h"
        )
    return "BAIXO RISCO: Alta padrão com orientações de rotina"


def predict(model, req: ReadmissionRequest, model_version: str) -> ReadmissionResponse:
    df = build_dataframe(req, model)
    proba = model.predict_proba(df)[0]
    prob_1 = float(proba[list(model.classes_).index(1)])
    prob_0 = 1.0 - prob_1

    predicted_class = int(prob_1 >= 0.5)
    risk_score = round(prob_1 * 100)
    return ReadmissionResponse(
        predicted_class=predicted_class,
        class_label="Alto Risco" if predicted_class == 1 else "Baixo Risco",
        probabilities={"0": round(prob_0, 4), "1": round(prob_1, 4)},
        risk_score_percent=risk_score,
        recommendation=recommendation(predicted_class, risk_score),
        model_version=model_version,
    )
