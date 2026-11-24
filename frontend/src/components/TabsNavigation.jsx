const steps = [
  [1, 'Perfil do paciente', 'Demografia e comorbidades'],
  [2, 'Internação', 'Admissão e histórico'],
  [3, 'Estado clínico', 'Sinais vitais e exames'],
  [4, 'Medicações', 'Prescrições na alta'],
];

export default function TabsNavigation({ activeTab, onSelectTab }) {
  return (
    <nav aria-label="Etapas da avaliação" className="step-nav">
      <ol>
        {steps.map(([id, title, description]) => (
          <li key={id}>
            <button type="button" aria-current={id === activeTab ? 'step' : undefined} onClick={() => onSelectTab(id)}>
              <span className="step-number" aria-hidden="true">{id}</span>
              <span className="step-text"><strong>{title}</strong><span>{description}</span></span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
