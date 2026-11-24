import math

import pytest

from app import ml
from app.schemas import ReadmissionRequest

URL = "/api/v1/predict/readmission-30d"


# ---------- endpoints ----------


def test_health_ok(client):
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True


def test_health_degraded_without_model(client_without_model):
    body = client_without_model.get("/health").json()
    assert body["status"] == "degraded"
    assert body["model_loaded"] is False


def test_readiness_ok(client):
    ready = client.get("/ready")
    assert ready.status_code == 200
    assert ready.json()["model_loaded"] is True


def test_readiness_unavailable_without_model(client_without_model):
    unavailable = client_without_model.get("/ready")
    assert unavailable.status_code == 503
    assert unavailable.json()["model_loaded"] is False


def test_predict_ok(client, payload):
    res = client.post(URL, json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["predicted_class"] in (0, 1)
    assert body["class_label"] in ("Alto Risco", "Baixo Risco")
    assert sum(body["probabilities"].values()) == pytest.approx(1.0, abs=1e-3)
    assert body["risk_score_percent"] == round(body["probabilities"]["1"] * 100)
    assert body["recommendation"]


def test_predict_first_admission_and_optional_charlson(client, payload):
    payload["days_since_last_discharge"] = None
    del payload["charlson_comorbidity_index"]
    assert client.post(URL, json=payload).status_code == 200


def test_predict_503_without_model(client_without_model, payload):
    assert client_without_model.post(URL, json=payload).status_code == 503


# ---------- validação (422) ----------


def test_missing_field(client, payload):
    del payload["age"]
    assert client.post(URL, json=payload).status_code == 422


@pytest.mark.parametrize(
    "field,value",
    [
        ("age", 200),
        ("bmi", 5),
        ("gender", "X"),
        ("department", "Podiatry"),
        ("has_insulin", 2),
        ("spo2", 50),
        ("days_since_last_discharge", -1),
    ],
)
def test_invalid_value(client, payload, field, value):
    payload[field] = value
    assert client.post(URL, json=payload).status_code == 422


def test_unknown_field_rejected(client, payload):
    payload["campo_inventado"] = 1
    assert client.post(URL, json=payload).status_code == 422


# ---------- feature engineering ----------


def features(payload, **overrides) -> dict:
    return ml.build_features(ReadmissionRequest(**{**payload, **overrides}))


def test_renames(payload):
    f = features(payload)
    assert f["baseline_bmi"] == 28.5
    assert f["baseline_charlson_comorbidity_index"] == 3
    assert "bmi" not in f and "days_since_last_discharge" not in f


def test_first_admission_uses_minus_one(payload):
    f = features(payload, days_since_last_discharge=None)
    assert f["days_since_last_discharge_filled"] == -1
    assert f["first_admission_flag"] == 1


def test_not_first_admission(payload):
    f = features(payload)
    assert f["days_since_last_discharge_filled"] == 45
    assert f["first_admission_flag"] == 0


def test_is_elderly_boundary(payload):
    assert features(payload, age=64)["is_elderly"] == 0
    assert features(payload, age=65)["is_elderly"] == 1


def test_polypharmacy_boundary(payload):
    assert features(payload, num_medications=4)["polypharmacy_flag"] == 0
    assert features(payload, num_medications=5)["polypharmacy_flag"] == 1


@pytest.mark.parametrize(
    "days,expected",
    [(1, "0-1"), (2, "2-3"), (3, "2-3"), (4, "4-7"), (7, "4-7"), (8, "8+"), (60, "8+")],
)
def test_los_category_bins(days, expected):
    assert ml.los_category(days) == expected


def test_los_zero_is_nan_like_training():
    # pd.cut(bins=[0,1,3,7,60], right=True) gera NaN para 0 no treino.
    assert math.isnan(ml.los_category(0))


def test_predict_with_los_zero(client, payload):
    payload["length_of_stay_days"] = 0
    assert client.post(URL, json=payload).status_code == 200


def test_dataframe_follows_model_column_order(client, payload):
    model = client.app.state.model
    df = ml.build_dataframe(ReadmissionRequest(**payload), model)
    assert list(df.columns) == list(model.feature_names_in_)
    assert df.shape == (1, len(model.feature_names_in_))
