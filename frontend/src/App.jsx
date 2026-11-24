import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TabsNavigation from './components/TabsNavigation';
import DemographicsSection from './components/DemographicsSection';
import EncounterSection from './components/EncounterSection';
import ClinicalSection from './components/ClinicalSection';
import MedicationsSection from './components/MedicationsSection';
import ResultCard from './components/ResultCard';
import ModelInfoModal from './components/ModelInfoModal';
import { checkBackendHealth, requestPrediction } from './services/api';
import { INITIAL_FORM_DATA, CLINICAL_PRESETS } from './constants/fields';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
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

  // Checagem de conectividade do backend
  const checkHealth = async () => {
    setBackendStatus('checking');
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      setBackendStatus(health.data?.model_loaded ? 'ok' : 'degraded');
    } else {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleChange = (field, value) => {
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
    setFormData(preset.data);
    setErrors({});
    setResult(null);
    setApiError(null);
    setActiveTab(1);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setResult(null);
    setApiError(null);
    setActiveTab(1);
  };

  // Validação do lado do cliente
  const validateForm = () => {
    const errs = {};

    if (formData.age === '' || formData.age < 0 || formData.age > 110) {
      errs.age = 'Idade deve estar entre 0 e 110 anos.';
    }
    if (formData.bmi === '' || formData.bmi < 10.0 || formData.bmi > 60.0) {
      errs.bmi = 'IMC deve estar entre 10.0 e 60.0 kg/m².';
    }
    if (
      formData.length_of_stay_days === '' ||
      formData.length_of_stay_days < 0 ||
      formData.length_of_stay_days > 60
    ) {
      errs.length_of_stay_days = 'Tempo de internação deve ser entre 0 e 60 dias.';
    }
    if (
      formData.revisit_count === '' ||
      formData.revisit_count < 0 ||
      formData.revisit_count > 20
    ) {
      errs.revisit_count = 'Revisitas devem estar entre 0 e 20.';
    }
    if (
      formData.systolic_bp === '' ||
      formData.systolic_bp < 60 ||
      formData.systolic_bp > 250
    ) {
      errs.systolic_bp = 'Pressão sistólica deve estar entre 60 e 250 mmHg.';
    }
    if (
      formData.diastolic_bp === '' ||
      formData.diastolic_bp < 30 ||
      formData.diastolic_bp > 150
    ) {
      errs.diastolic_bp = 'Pressão diastólica deve estar entre 30 e 150 mmHg.';
    }
    if (
      formData.heart_rate === '' ||
      formData.heart_rate < 30 ||
      formData.heart_rate > 200
    ) {
      errs.heart_rate = 'Frequência cardíaca deve estar entre 30 e 200 bpm.';
    }
    if (
      formData.respiratory_rate === '' ||
      formData.respiratory_rate < 5 ||
      formData.respiratory_rate > 60
    ) {
      errs.respiratory_rate = 'Freq. respiratória deve estar entre 5 e 60 irpm.';
    }
    if (
      formData.temperature === '' ||
      formData.temperature < 34.0 ||
      formData.temperature > 42.0
    ) {
      errs.temperature = 'Temperatura deve estar entre 34.0 e 42.0 °C.';
    }
    if (formData.spo2 === '' || formData.spo2 < 70 || formData.spo2 > 100) {
      errs.spo2 = 'SpO₂ deve estar entre 70 e 100%.';
    }
    if (formData.glucose === '' || formData.glucose < 40 || formData.glucose > 500) {
      errs.glucose = 'Glicose deve estar entre 40 e 500 mg/dL.';
    }
    if (
      formData.creatinine === '' ||
      formData.creatinine < 0.3 ||
      formData.creatinine > 15.0
    ) {
      errs.creatinine = 'Creatinina deve estar entre 0.3 e 15.0 mg/dL.';
    }
    if (
      formData.hemoglobin === '' ||
      formData.hemoglobin < 4.0 ||
      formData.hemoglobin > 20.0
    ) {
      errs.hemoglobin = 'Hemoglobina deve estar entre 4.0 e 20.0 g/dL.';
    }
    if (
      formData.wbc_count === '' ||
      formData.wbc_count < 1.0 ||
      formData.wbc_count > 50.0
    ) {
      errs.wbc_count = 'Leucócitos devem estar entre 1.0 e 50.0 ×10³/µL.';
    }
    if (
      formData.num_medications === '' ||
      formData.num_medications < 0 ||
      formData.num_medications > 30
    ) {
      errs.num_medications = 'Nº de medicações deve ser entre 0 e 30.';
    }
    if (
      formData.num_therapeutic_classes === '' ||
      formData.num_therapeutic_classes < 0 ||
      formData.num_therapeutic_classes > 15
    ) {
      errs.num_therapeutic_classes = 'Classes terapêuticas devem ser entre 0 e 15.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setApiError(null);
    setSlowColdStart(false);

    if (!validateForm()) {
      // Direciona para a primeira aba com erro
      if (errors.age || errors.bmi) setActiveTab(1);
      else if (errors.length_of_stay_days || errors.revisit_count) setActiveTab(2);
      else if (
        errors.systolic_bp ||
        errors.diastolic_bp ||
        errors.heart_rate ||
        errors.respiratory_rate ||
        errors.temperature ||
        errors.spo2 ||
        errors.glucose ||
        errors.creatinine ||
        errors.hemoglobin ||
        errors.wbc_count
      )
        setActiveTab(3);
      else if (errors.num_medications || errors.num_therapeutic_classes) setActiveTab(4);

      setApiError('Por favor, corrija os campos inválidos antes de submeter.');
      return;
    }

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
        : formData.days_since_last_discharge !== '' &&
          formData.days_since_last_discharge !== null
        ? Number(formData.days_since_last_discharge)
        : null,

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

    const res = await requestPrediction(payload, (isSlow) => {
      setSlowColdStart(isSlow);
    });

    setLoading(false);
    setSlowColdStart(false);

    if (res.success) {
      setResult(res.data);
      // Rola suavemente até o card de resultado
      setTimeout(() => {
        document.getElementById('resultado-clinico')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setApiError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar
        backendStatus={backendStatus}
        onRefreshHealth={checkHealth}
        onOpenModelInfo={() => setIsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Apresentação e Presets Rápidos */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="badge-chip bg-teal-500/30 text-teal-200 border border-teal-400/30 mb-2">
                Trabalho Final — Probabilidade e Estatística
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Preditor de Risco de Readmissão Hospitalar (30 Dias)
              </h1>
              <p className="text-sm text-teal-100/80 mt-2 leading-relaxed">
                Aplicação integrada ao modelo <strong>GaussianNB</strong> com pipeline de pré-processamento.
                Avalie o risco de retorno precoce de pacientes na alta e visualize recomendações clínicas.
              </p>
            </div>

            {/* Presets Rápidos */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-200 block mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Carregar Casos de Teste (1 Clique)
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                {CLINICAL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleLoadPreset(p)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all text-left flex items-center justify-between gap-3 shadow-xs"
                  >
                    <span>{p.title.split('(')[0]}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        p.badgeColor === 'rose'
                          ? 'bg-rose-500/80 text-white'
                          : p.badgeColor === 'emerald'
                          ? 'bg-emerald-500/80 text-white'
                          : 'bg-amber-500/80 text-white'
                      }`}
                    >
                      {p.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Cold Start (Render Free Tier) */}
        {slowColdStart && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs mb-6 flex items-start gap-3 animate-in fade-in">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Aguardando Inicialização do Servidor (Cold Start)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                O backend gratuito no Render entra em hibernação após 15 minutos de inatividade.
                A primeira requisição pode levar de 30 a 50 segundos para despertar a API. Aguarde...
              </p>
            </div>
          </div>
        )}

        {/* Alerta de Erro da API */}
        {apiError && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-xs mb-6 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Falha na Requisição
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {/* Formulário Principal em Abas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <TabsNavigation
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              tabCompletion={{
                demographics: formData.age !== '' && formData.bmi !== '',
                encounter: formData.length_of_stay_days !== '',
                clinical: formData.systolic_bp !== '' && formData.heart_rate !== '',
                medications: formData.num_medications !== '',
              }}
            />

            <form onSubmit={handleSubmit}>
              {activeTab === 1 && (
                <DemographicsSection formData={formData} onChange={handleChange} errors={errors} />
              )}
              {activeTab === 2 && (
                <EncounterSection formData={formData} onChange={handleChange} errors={errors} />
              )}
              {activeTab === 3 && (
                <ClinicalSection formData={formData} onChange={handleChange} errors={errors} />
              )}
              {activeTab === 4 && (
                <MedicationsSection formData={formData} onChange={handleChange} errors={errors} />
              )}

              {/* Barra de Navegação entre Etapas */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
                <div>
                  {activeTab > 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab((prev) => prev - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Etapa Anterior
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restaurar Padrão
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeTab < 4 ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab((prev) => prev + 1)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Próxima Etapa
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-teal-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando Predição...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Calcular Risco de Readmissão
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Card de Resultado da Predição */}
        {result && (
          <div className="mb-12">
            <ResultCard result={result} formData={formData} onReset={handleReset} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>
          HospPredict — Trabalho Final de Probabilidade e Estatística • IFCE (Engenharia da Computação)
        </p>
        <p className="mt-1 text-slate-400">
          Orientador: Prof. Valberto Feitosa • Modelo: Naive Bayes (GaussianNB + ColumnTransformer)
        </p>
      </footer>

      {/* Modal de Informações Acadêmicas do Modelo */}
      <ModelInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
