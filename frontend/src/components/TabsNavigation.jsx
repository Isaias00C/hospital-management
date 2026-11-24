import React from 'react';
import { User, Building2, Activity, Pill, Check } from 'lucide-react';

const TABS = [
  { id: 1, key: 'demographics', label: 'Demografia & Perfil', icon: User, subtitle: 'Dados do paciente' },
  { id: 2, key: 'encounter', label: 'Internação & Fluxo', icon: Building2, subtitle: 'Admissão e histórico' },
  { id: 3, key: 'clinical', label: 'Estado Clínico & Labs', icon: Activity, subtitle: 'Sinais vitais e exames' },
  { id: 4, key: 'medications', label: 'Prescrições na Alta', icon: Pill, subtitle: 'Classes e alertas' },
];

export default function TabsNavigation({ activeTab, onSelectTab, tabCompletion = {} }) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 mb-6">
      <nav className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDone = tabCompletion[tab.key];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150 relative ${
                isActive
                  ? 'bg-teal-50 border border-teal-200 text-teal-900 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-600 border border-transparent'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isDone && !isActive ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">0{tab.id}</span>
                </div>
                <div className={`text-sm font-semibold truncate ${isActive ? 'text-teal-950' : 'text-slate-800'}`}>
                  {tab.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate hidden sm:block">
                  {tab.subtitle}
                </div>
              </div>
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-teal-600 rounded-full md:hidden" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
