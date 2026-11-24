import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import TabsNavigation from './components/TabsNavigation';
import DemographicsSection from './components/DemographicsSection';
import EncounterSection from './components/EncounterSection';
import ClinicalSection from './components/ClinicalSection';
import MedicationsSection from './components/MedicationsSection';
import ResultCard from './components/ResultCard';
import ModelInfoModal from './components/ModelInfoModal';
import ReadmissionWindow from './components/ReadmissionWindow';
import { checkBackendHealth, requestPrediction } from './services/api';
import { getFieldTab, validateForm } from './constants/validation';
import { INITIAL_FORM_DATA, CLINICAL_PRESETS } from './constants/fields';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  FlaskConical,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [slowColdStart, setSlowColdStart] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [fieldToFocus, setFieldToFocus] = useState(null);
  const prediction = useRef(null);
  const healthCheck = useRef(null);
  const formBody = useRef(null);
  const focusStep = useRef(false);

  useEffect(() => {
    if (!focusStep.current) return;
    focusStep.current = false;
    formBody.current?.querySelector('h2')?.focus();
  }, [activeTab]);

  const goToStep = (step) => {
    if (step === activeTab) return;
    focusStep.current = true;
    setActiveTab(step);
  };

  useEffect(() => {
    if (fieldToFocus) document.getElementById(fieldToFocus.id)?.focus();
  }, [fieldToFocus]);

  // Checagem de conectividade do backend
  const checkHealth = async () => {
    healthCheck.current?.abort();
    const controller = new AbortController();
    healthCheck.current = controller;
    setBackendStatus('checking');
    const status = await checkBackendHealth(controller.signal);
    if (healthCheck.current === controller) setBackendStatus(status);
  };

  useEffect(() => {
    checkHealth();
    return () => {
      healthCheck.current?.abort();
      prediction.current?.abort();
      healthCheck.current = null;
      prediction.current = null;
    };
  }, []);

  const invalidatePrediction = () => {
    prediction.current?.abort();
    prediction.current = null;
    setResult(null);
    setLoading(false);
    setSlowColdStart(false);
    setApiError(null);
  };

  const showFieldErrors = (nextErrors) => {
    setErrors(nextErrors);
    const field = Object.keys(nextErrors).find((key) => getFieldTab(key));
    if (field) {
      setActiveTab(getFieldTab(field));
      setFieldToFocus({ id: field });
    }
  };

  const handleChange = (field, value) => {
    invalidatePrediction();
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpa erro do campo alterado
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Carrega casos pré-configurados
  const handleLoadPreset = (preset) => {
    invalidatePrediction();
    setFormData(preset.data);
    setErrors({});
    setActiveTab(1);
  };

  const handleReset = () => {
    invalidatePrediction();
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setActiveTab(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (prediction.current) return;
    invalidatePrediction();

    const nextErrors = validateForm(formData);
    showFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setApiError('Revise os campos indicados para calcular o risco.');
      return;
    }

    const controller = new AbortController();
    prediction.current = controller;
    setLoading(true);

    // Constrói payload de acordo com os tipos esperados pelo Pydantic
    const payload = {
      age: Number(formData.age),
      gender: formData.gender,
      charlson_comorbidity_index:
        formData.charlson_comorbidity_index !== null &&
        formData.charlson_comorbidity_index !== ''
          ? Number(formData.charlson_comorbidity_index)
          : null,
      bmi: Number(formData.bmi),
      smoker_status: formData.smoker_status,
      socioeconomic_tier: formData.socioeconomic_tier,
      residential_zone: formData.residential_zone,
      marital_status: formData.marital_status,

      encounter_type: formData.encounter_type,
      admission_urgency: formData.admission_urgency,
      department: formData.department,
      length_of_stay_days: Number(formData.length_of_stay_days),
      revisit_count: Number(formData.revisit_count),
      days_since_last_discharge: formData.is_first_admission
        ? null
        : Number(formData.days_since_last_discharge),

      systolic_bp: Number(formData.systolic_bp),
      diastolic_bp: Number(formData.diastolic_bp),
      heart_rate: Number(formData.heart_rate),
      respiratory_rate: Number(formData.respiratory_rate),
      temperature: Number(formData.temperature),
      spo2: Number(formData.spo2),
      glucose: Number(formData.glucose),
      creatinine: Number(formData.creatinine),
      hemoglobin: Number(formData.hemoglobin),
      wbc_count: Number(formData.wbc_count),
      disease_category: formData.disease_category,
      disease_severity: formData.disease_severity,

      num_medications: Number(formData.num_medications),
      num_therapeutic_classes: Number(formData.num_therapeutic_classes),
      has_high_risk_med: Number(formData.has_high_risk_med),
      has_anticoagulant: Number(formData.has_anticoagulant),
      has_insulin: Number(formData.has_insulin),
      has_diuretic: Number(formData.has_diuretic),
      has_beta_blocker: Number(formData.has_beta_blocker),
      has_ace_arb: Number(formData.has_ace_arb),
    };

    const res = await requestPrediction(payload, controller.signal, () => {
      if (prediction.current === controller) setSlowColdStart(true);
    });
    if (prediction.current !== controller) return;
    prediction.current = null;
    setLoading(false);
    setSlowColdStart(false);

    if (res.success) {
      if (backendStatus !== 'ok') checkHealth();
      setResult({ data: res.data, input: payload });
    } else {
      if (res.status === 503) checkHealth();
      if (res.status === 422 && Array.isArray(res.details)) {
        const fieldErrors = {};
        for (const detail of res.details) {
          const field = detail.loc?.[1];
          if (getFieldTab(field)) fieldErrors[field] = 'Revise o valor deste campo.';
        }
        showFieldErrors(fieldErrors);
      }
      setApiError(res.message);
    }
  };

  useEffect(() => {
    if (result) document.getElementById('resultado-clinico')?.focus();
  }, [result]);

  return (
    <div className="app-shell">
      <Navbar
        backendStatus={backendStatus}
        onRefreshHealth={checkHealth}
        onOpenModelInfo={() => setIsModalOpen(true)}
      />

      <main className="workspace">
        <div className="workspace-intro print:hidden">
          <div className="intro-copy">
            <h1>Risco de readmissão hospitalar</h1>
            <p>Use os dados da alta para estimar a chance de retorno ao hospital em até 30 dias.</p>
          </div>
          <ReadmissionWindow />
        </div>

        <div className="assessment-layout">
          <aside className="assessment-rail print:hidden">
            <TabsNavigation activeTab={activeTab} onSelectTab={goToStep} />

            <details className="sample-panel">
              <summary><FlaskConical size={17} aria-hidden="true" /> Casos de demonstração</summary>
              <p>Preencha o formulário com dados fictícios para testar a avaliação.</p>
              <div className="sample-options">
                {CLINICAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={formData === preset.data}
                    onClick={() => handleLoadPreset(preset)}
                  >
                    {preset.title.split(' (')[0]}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </details>
          </aside>

          <div className="assessment-content">
            {backendStatus === 'offline' || backendStatus === 'degraded' ? (
              <div className="notice notice-warning print:hidden" role="status">
                <AlertCircle size={18} aria-hidden="true" />
                <div>
                  <strong>{backendStatus === 'degraded' ? 'Modelo indisponível' : 'API sem resposta'}</strong>
                  <p>{backendStatus === 'degraded'
                    ? 'O servidor respondeu, mas o modelo ainda não foi carregado.'
                    : 'A primeira conexão pode demorar. Tente verificar novamente.'}</p>
                </div>
                <button type="button" onClick={checkHealth} className="text-action">Verificar</button>
              </div>
            ) : null}

            {slowColdStart && (
              <div className="notice notice-warning print:hidden" role="status">
                <Clock size={18} aria-hidden="true" />
                <div><strong>Aguardando resposta da API</strong><p>Se o servidor estiver iniciando, a primeira resposta pode demorar.</p></div>
              </div>
            )}

            {apiError && (
              <div className="notice notice-error print:hidden" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <div><strong>Não foi possível calcular o risco</strong><p>{apiError}</p></div>
              </div>
            )}

            <form className="assessment-form print:hidden" onSubmit={handleSubmit} noValidate aria-busy={loading}>
              <div className="form-body" data-step={activeTab} ref={formBody}>
                <p className="step-caption">Etapa {activeTab} de 4</p>
                <div key={activeTab} className="step-content">
                  {activeTab === 1 && <DemographicsSection formData={formData} onChange={handleChange} errors={errors} />}
                  {activeTab === 2 && <EncounterSection formData={formData} onChange={handleChange} errors={errors} />}
                  {activeTab === 3 && <ClinicalSection formData={formData} onChange={handleChange} errors={errors} />}
                  {activeTab === 4 && <MedicationsSection formData={formData} onChange={handleChange} errors={errors} />}
                </div>
              </div>

              <div className="form-actions">
                {activeTab === 1 ? (
                  <button type="button" className="button-secondary" onClick={handleReset}>
                    <RotateCcw size={16} aria-hidden="true" /> Restaurar caso inicial
                  </button>
                ) : (
                  <button type="button" className="button-secondary" onClick={() => goToStep(activeTab - 1)}>
                    <ChevronLeft size={18} aria-hidden="true" /> Voltar
                  </button>
                )}

                {activeTab < 4 ? (
                  <button type="button" className="button-primary" onClick={() => goToStep(activeTab + 1)}>
                    Continuar <ChevronRight size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <button type="submit" className="button-primary" disabled={loading}>
                    {loading ? <><Loader2 size={17} className="animate-spin" aria-hidden="true" /> Calculando…</> : 'Calcular risco'}
                  </button>
                )}
              </div>
            </form>

            {result && <ResultCard result={result.data} formData={result.input} onReset={handleReset} />}
          </div>
        </div>
      </main>

      <footer className="app-footer print:hidden">
        <span>HospPredict · Projeto acadêmico do IFCE</span>
        <span>Use somente dados fictícios.</span>
      </footer>

      <ModelInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
