const points = [7, 14, 21];

export default function ReadmissionWindow() {
  return (
    <figure className="readmission-window" aria-label="Janela de avaliação da alta até 30 dias">
      <figcaption>Janela de avaliação</figcaption>
      <div className="window-scale" aria-hidden="true">
        <div className="window-timeline">
          <span className="window-line" />
          {points.map((day) => (
            <span key={day} className="window-tick" style={{ left: (day / 30) * 100 + '%' }}>
              <span>{day}</span>
            </span>
          ))}
          <span className="window-start" />
          <span className="window-end" />
        </div>
        <div className="window-labels"><span>Dia da alta</span><strong>30 dias</strong></div>
      </div>
    </figure>
  );
}
