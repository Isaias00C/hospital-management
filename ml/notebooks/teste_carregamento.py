"""
Script standalone para testar carregamento e predição do modelo.
Uso: python teste_carregamento.py
"""
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

# Caminho do modelo
MODEL_PATH = Path(__file__).parent.parent / 'backend' / 'model' / 'modelo_nb.joblib'

# Exemplo de entrada (28 features na ordem do treino)
EXAMPLE_INPUT = {
    # Demografia
    'age': 72,
    'gender': 'M',
    'charlson_comorbidity_index': 3,
    'baseline_bmi': 28.5,
    'smoker_status': 'Former',
    'socioeconomic_tier': 'Middle',
    'residential_zone': 'Urban',
    'marital_status': 'Married',
    'is_elderly': 1,

    # Internação
    'encounter_type': 'Emergency',
    'admission_urgency': 'Emergency',
    'department': 'Cardiology',
    'length_of_stay_days': 5,
    'los_category': '4-7',
    'revisit_count': 2,
    'days_since_last_discharge_filled': 45,
    'first_admission_flag': 0,

    # Clínico na Alta
    'systolic_bp': 120,
    'diastolic_bp': 80,
    'heart_rate': 78,
    'respiratory_rate': 18,
    'temperature': 36.8,
    'spo2': 95,
    'glucose': 140,
    'creatinine': 1.3,
    'hemoglobin': 11.2,
    'wbc_count': 9.1,
    'disease_category': 'Cardiovascular',
    'disease_severity': 'Moderate',

    # Medicações
    'num_medications': 8,
    'num_therapeutic_classes': 5,
    'polypharmacy_flag': 1,
    'has_high_risk_med': 1,
    'has_anticoagulant': 1,
    'has_insulin': 0,
    'has_diuretic': 1,
    'has_beta_blocker': 1,
    'has_ace_arb': 1,
}

def main():
    print(f'Carregando modelo de: {MODEL_PATH}')

    if not MODEL_PATH.exists():
        print(f'ERRO: Modelo não encontrado em {MODEL_PATH}')
        return

    pipeline = joblib.load(MODEL_PATH)
    print('✓ Modelo carregado com sucesso')

    # Converter para DataFrame
    df = pd.DataFrame([EXAMPLE_INPUT])
    print(f'
Input shape: {df.shape}')
    print(f'Colunas: {list(df.columns)}')

    # Predição
    pred = pipeline.predict(df)[0]
    proba = pipeline.predict_proba(df)[0]

    print(f'
=== RESULTADO ===')
    print(f'Classe predita: {pred} ({"Alto Risco" if pred == 1 else "Baixo Risco"})')
    print(f'Probabilidade classe 0 (Não readmite): {proba[0]:.4f}')
    print(f'Probabilidade classe 1 (Readmite):     {proba[1]:.4f}')
    print(f'Score de risco (%): {proba[1]*100:.1f}%')

    # Verificar se predict_proba funciona
    assert hasattr(pipeline, 'predict_proba'), 'predict_proba não disponível'
    assert proba.shape == (2,), 'Probabilidades devem ter 2 classes'
    assert abs(proba.sum() - 1.0) < 1e-6, 'Probabilidades devem somar 1'

    print('
✓ Todos os testes passaram!')

if __name__ == '__main__':
    main()
