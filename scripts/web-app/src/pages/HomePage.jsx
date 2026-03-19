import { cameraFeeds } from '../services/mockData';

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero panel">
        <p className="eyebrow">Overview</p>
        <h1>Welcome to household monitor</h1>
        <p className="lead">
          Choose a live CCTV perspective, review historical images from S3 object storage, and prepare for
          Raspberry Pi actions like talkback and light control.
        </p>
        <div className="stats-grid">
          <div className="stat-card">
            <strong>{cameraFeeds.length}</strong>
            <span>Configured camera perspectives</span>
          </div>
          <div className="stat-card">
            <strong>2 paths</strong>
            <span>Live feed and historical review</span>
          </div>
          <div className="stat-card">
            <strong>S3 ready</strong>
            <span>Replace placeholder object URLs when ready</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Suggested architecture</p>
            <h2>How this scaffold is arranged</h2>
          </div>
        </div>
        <div className="two-col-grid">
          <article className="info-card">
            <h3>Live view</h3>
            <p>
              This page currently points at placeholder CloudFront URLs. Later you can swap in an MJPEG,
              WebRTC, HLS, or snapshot endpoint from your Pi pipeline.
            </p>
          </article>
          <article className="info-card">
            <h3>History viewer</h3>
            <p>
              Uses mocked S3 object keys and preview URLs. Replace with an API that lists objects from your
              history bucket or a signed URL workflow.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
