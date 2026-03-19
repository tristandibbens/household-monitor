import { useMemo, useState } from 'react';
import { cameraFeeds, historySamples } from '../services/mockData';

export default function HistoryPage() {
  const [cameraId, setCameraId] = useState(cameraFeeds[0].id);

  const filteredHistory = useMemo(
    () => historySamples.filter((item) => item.cameraId === cameraId),
    [cameraId]
  );

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Historical review</p>
            <h1>Browse CCTV history from S3</h1>
          </div>
        </div>

        <div className="history-toolbar">
          <label>
            Camera perspective
            <select value={cameraId} onChange={(event) => setCameraId(event.target.value)}>
              {cameraFeeds.map((feed) => (
                <option key={feed.id} value={feed.id}>
                  {feed.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="history-grid">
          {filteredHistory.length ? (
            filteredHistory.map((item) => (
              <article key={item.id} className="history-card">
                <div className="history-preview">
                  <span>History preview</span>
                </div>
                <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                <code>{item.objectKey}</code>
                <span className="muted">{item.previewUrl}</span>
              </article>
            ))
          ) : (
            <div className="empty-state">No history configured for this camera in the mock dataset.</div>
          )}
        </div>
      </section>
    </div>
  );
}
