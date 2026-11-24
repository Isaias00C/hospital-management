import React, { useEffect, useRef } from 'react';
import { X, Check, BookOpen, GitBranch, Shield, Cpu, Activity } from 'lucide-react';

export default function ModelInfoModal({ isOpen, onClose }) {
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="model-info-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl p-0 backdrop:bg-slate-900/60 print:hidden"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-2 py-0.5 rounded">
                Documentação Acadêmica
              </span>
              <span className="text-xs text-teal-200">IFCE — Probabilidade e Estatística</span>
            </div>
            <h2 id="model-info-title" className="text-xl font-bold tracking-tight mt-1">
              Arquitetura & Critérios de Aceite do Modelo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar informações do modelo"
            autoFocus
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6 text-slate-700 text-sm">
          {/* Tabela de Métricas */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Métricas Validadas no Conjunto de Teste (20% Holdout)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-2 text-left">Métrica</th>
                    <th className="px-4 py-2 text-left">Valor Atingido</th>
                    <th className="px-4 py-2 text-left">Critério Mínimo</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-4 py-2 font-medium">Acurácia (Accuracy)</td>
                    <td className="px-4 py-2 text-slate-900 font-mono">0.6023 (60.2%)</td>
                    <td className="px-4 py-2 text-slate-500">≥ 0.55</td>
                    <td className="px-4 py-2 text-emerald-600 font-bold">✅ Aprovado</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Precision (macro)</td>
                    <td className="px-4 py-2 text-slate-900 font-mono">0.6032 (60.3%)</td>
                    <td className="px-4 py-2 text-slate-500">≥ 0.55</td>
                    <td className="px-4 py-2 text-emerald-600 font-bold">✅ Aprovado</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Recall / Sensibilidade</td>
                    <td className="px-4 py-2 text-slate-900 font-mono">0.6166 (61.7%)</td>
                    <td className="px-4 py-2 text-slate-500">≥ 0.55</td>
                    <td className="px-4 py-2 text-emerald-600 font-bold">✅ Aprovado</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">F1-Score (macro)</td>
                    <td className="px-4 py-2 text-slate-900 font-mono">0.5909 (59.1%)</td>
                    <td className="px-4 py-2 text-slate-500">≥ 0.55</td>
                    <td className="px-4 py-2 text-emerald-600 font-bold">✅ Aprovado</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Área sob a Curva ROC (AUC-ROC)</td>
                    <td className="px-4 py-2 text-slate-900 font-mono">0.6518</td>
                    <td className="px-4 py-2 text-slate-500">≥ 0.60</td>
                    <td className="px-4 py-2 text-emerald-600 font-bold">✅ Aprovado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Por que Naive Bayes */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              Por que Naive Bayes? (GaussianNB + ColumnTransformer)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              O classificador <strong>GaussianNB</strong> foi adotado em atendimento aos requisitos
              pedagógicos da disciplina de Probabilidade e Estatística. O pipeline utiliza um{' '}
              <code>ColumnTransformer</code> para imputação de valores faltantes (mediana nas contínuas
              e moda nas categóricas), padronização com <code>StandardScaler</code> e codificação
              one-hot com <code>OneHotEncoder(handle_unknown='ignore')</code>.
            </p>
          </div>

          {/* Features Derivadas */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600" />
              Features Derivadas pelo Sistema
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong>is_elderly:</strong> <code>age &gt;= 65</code>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong>polypharmacy_flag:</strong> <code>num_medications &gt;= 5</code>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong>los_category:</strong> Faixas de permanência (0-1, 2-3, 4-7, 8+ dias)
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong>first_admission_flag:</strong> 1 se não houver internação prévia (-1 dias)
              </li>
            </ul>
          </div>

          {/* Limitações e LGPD */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-800">
              <Shield className="w-4 h-4 text-amber-600" />
              Aviso Ético e Regulatório (LGPD)
            </div>
            <p className="leading-relaxed">
              Este sistema foi construído para fins acadêmicos utilizando o conjunto de dados público
              do Kaggle (Hospital Management Data). A ferramenta atua estritamente como suporte
              à decisão e não substitui o juízo clínico profissional da equipe médica assistencial.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </dialog>
  );
}
