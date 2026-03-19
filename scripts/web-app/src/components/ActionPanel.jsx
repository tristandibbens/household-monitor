import { actionStubs } from '../services/mockData';

export default function ActionPanel() {
  const handleAction = (label) => {
    window.alert(`${label} is a stub action. Replace this with your Raspberry Pi integration.`);
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Pi Controls</p>
          <h2>Stub actions</h2>
        </div>
      </div>
      <div className="action-grid">
        {actionStubs.map((action) => (
          <button
            key={action.id}
            className="action-button"
            type="button"
            onClick={() => handleAction(action.label)}
          >
            <strong>{action.label}</strong>
            <span>{action.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
