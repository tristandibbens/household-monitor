import { useMemo, useState } from 'react';
import ActionPanel from '../components/ActionPanel';
import CameraCard from '../components/CameraCard';
import { cameraFeeds } from '../services/mockData';

export default function LiveViewPage() {
  const [selectedFeed, setSelectedFeed] = useState(cameraFeeds[0]);

  const statusText = useMemo(() => {
    if (selectedFeed.status === 'Online') {
      return 'Ready to swap with real live feed integration.';
    }
    return 'Camera is marked as unavailable in the mock config.';
  }, [selectedFeed]);

  return (
    <div className="page-stack">
      <section className="panel live-grid">
        <div className="video-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Live monitoring</p>
              <h1>{selectedFeed.name}</h1>
            </div>
            <span className={selectedFeed.status === 'Online' ? 'pill pill-online' : 'pill'}>
              {selectedFeed.status}
            </span>
          </div>

          <div className="video-placeholder">
            <div>
              <p>Live feed placeholder</p>
              <h2>{selectedFeed.location}</h2>
              <span>{selectedFeed.streamUrl}</span>
            </div>
          </div>

          <div className="feed-meta">
            <div>
              <span className="muted">Description</span>
              <p>{selectedFeed.description}</p>
            </div>
            <div>
              <span className="muted">Status note</span>
              <p>{statusText}</p>
            </div>
          </div>
        </div>

        <div className="camera-list-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Perspectives</p>
              <h2>Select a camera</h2>
            </div>
          </div>
          <div className="camera-list">
            {cameraFeeds.map((feed) => (
              <CameraCard
                key={feed.id}
                feed={feed}
                isSelected={selectedFeed.id === feed.id}
                onSelect={setSelectedFeed}
              />
            ))}
          </div>
        </div>
      </section>

      <ActionPanel />
    </div>
  );
}
