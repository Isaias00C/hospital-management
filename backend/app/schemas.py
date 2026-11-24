"""Modelos Pydantic de entrada e saída da API.

A entrada usa os campos "amigáveis" do `ml/CONTRATO_INTEGRACAO.md`. A conversão
para os nomes que o pipeline espera é feita em `app/ml.py`.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Flag = Literal[0, 1]


class ReadmissionRequest(BaseModel):
    # Campos desconhecidos são rejeitados: evita typos silenciosos no frontend.
    model_config = ConfigDict(extra="forbid")

    # A. Demografia e comorbidades
    age: int = Field(ge=0, le=110, description="Idade do paciente")
    gender: Literal["M", "F"]
    charlson_comorbidity_index: int | None = Field(
        default=None,
        ge=0,
        le=15,
        description="Índice de Charlson. Opcional: o modelo atual não o utiliza.",
    )
    bmi: float = Field(ge=10.0, le=60.0, description="Índice de massa corporal")
    smoker_status: Literal["Never", "Former", "Current"]
    socioeconomic_tier: Literal["Low", "Middle", "High"]
    residential_zone: Literal["Rural", "Suburban", "Urban"]
    marital_status: Literal["Single", "Married", "Divorced", "Widowed"]

    # B. Contexto da internação
    encounter_type: Literal["Emergency", "Inpatient", "Outpatient"]
    admission_urgency: Literal["Elective", "Urgent", "Emergency"]
    department: Literal[
        "General Medicine",
        "Cardiology",
        "ICU",
        "Orthopedics",
        "General Surgery",
        "Pediatrics",
        "Oncology",
        "Obstetrics",
    ]
    length_of_stay_days: int = Field(ge=0, le=60)
    revisit_count: int = Field(ge=0, le=20)
    days_since_last_discharge: int | None = Field(
        default=None,
        ge=0,
        le=3650,
        description="Dias desde a última alta. `null` = primeira internação.",
    )

    # C. Estado clínico na alta
    systolic_bp: int = Field(ge=60, le=250, description="mmHg")
    diastolic_bp: int = Field(ge=30, le=150, description="mmHg")
    heart_rate: int = Field(ge=30, le=200, description="bpm")
    respiratory_rate: int = Field(ge=5, le=60, description="resp/min")
    temperature: float = Field(ge=34.0, le=42.0, description="°C")
    spo2: int = Field(ge=70, le=100, description="%")
    glucose: int = Field(ge=40, le=500, description="mg/dL")
    creatinine: float = Field(ge=0.3, le=15.0, description="mg/dL")
    hemoglobin: float = Field(ge=4.0, le=20.0, description="g/dL")
    wbc_count: float = Field(ge=1.0, le=50.0, description="×10³/µL")
    disease_category: Literal[
        "Respiratory",
        "Cardiovascular",
        "Infectious",
        "Renal",
        "GI",
        "Endocrine",
        "Oncology",
        "Musculoskeletal",
        "Trauma",
        "Pediatrics",
        "Obstetrics",
    ]
    disease_severity: Literal["Mild", "Moderate", "Severe", "Critical"]

    # D. Medicações na alta
    num_medications: int = Field(ge=0, le=30)
    num_therapeutic_classes: int = Field(ge=0, le=15)
    has_high_risk_med: Flag
    has_anticoagulant: Flag
    has_insulin: Flag
    has_diuretic: Flag
    has_beta_blocker: Flag
    has_ace_arb: Flag


class ReadmissionResponse(BaseModel):
    predicted_class: Literal[0, 1]
    class_label: Literal["Baixo Risco", "Alto Risco"]
    probabilities: dict[str, float]
    risk_score_percent: int
    recommendation: str
    model_version: str


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    model_loaded: bool
    model_version: str
    sklearn_version: str
