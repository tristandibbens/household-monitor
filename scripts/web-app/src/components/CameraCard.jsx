export default function CameraCard({ feed, isSelected, onSelect }) {
  return (
    <button
      className={isSelected ? 'camera-card camera-card-active' : 'camera-card'}
      onClick={() => onSelect(feed)}
      type="button"
    >
      <div className="camera-card-header">
        <div>
          <h3>{feed.name}</h3>
          <p>{feed.location}</p>
        </div>
        <span className={feed.status === 'Online' ? 'pill pill-online' : 'pill'}>
          {feed.status}
        </span>
      </div>
      <p className="camera-card-text">{feed.description}</p>
      <code>{feed.historyPrefix}</code>
    </button>
  );
}
