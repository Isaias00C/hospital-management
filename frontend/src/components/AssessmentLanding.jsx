import { ArrowDown, ClipboardList, FlaskConical, NotebookPen, ScanLine } from 'lucide-react';

export function AssessmentHero({ onStart, onShowCases, started }) {
  return (
    <section className="assessment-hero print:hidden" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-context"><span aria-hidden="true" />Ferramenta acadêmica</p>
        <h1 id="hero-title">Risco de readmissão após a alta</h1>
        <p>Preencha os dados da alta hospitalar e veja a estimativa de retorno em até 30 dias.</p>
        <div className="hero-actions">
          <button type="button" className="button-primary" onClick={onStart}>
            {started ? 'Voltar à avaliação' : 'Iniciar avaliação'}
            <ArrowDown size={17} aria-hidden="true" />
          </button>
          <button type="button" className="hero-example" onClick={onShowCases} aria-haspopup="dialog" aria-controls="case-picker">
            <FlaskConical size={15} aria-hidden="true" /> Ver casos de exemplo
          </button>
        </div>
      </div>
    </section>
  );
}

const guide = [
  { icon: ClipboardList, title: 'Reúna os dados da alta', text: 'Tenha o perfil do paciente e o histórico de internação à mão.' },
  { icon: NotebookPen, title: 'Preencha as quatro etapas', text: 'Complete com sinais vitais, exames e as medicações prescritas.' },
  { icon: ScanLine, title: 'Interprete o resultado', text: 'Veja a estimativa para os próximos 30 dias e imprima o relatório se precisar.' },
];

export function AssessmentGuide() {
  return (
    <section className="assessment-guide print:hidden" id="como-funciona" aria-labelledby="guide-title">
      <h2 id="guide-title">Como funciona</h2>
      <ol>
        {guide.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <span className="guide-icon"><Icon size={21} aria-hidden="true" /></span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
