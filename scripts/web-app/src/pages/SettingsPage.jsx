export default function SettingsPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Integration notes</p>
            <h1>Settings and wiring guide</h1>
          </div>
        </div>

        <div className="settings-grid">
          <article className="info-card">
            <h3>Authentication</h3>
            <p>
              Current login is local-only and stored in browser localStorage. Replace with Cognito or a backend
              session flow before production.
            </p>
          </article>
          <article className="info-card">
            <h3>Live CCTV</h3>
            <p>
              Update the stream URLs in <code>src/services/mockData.js</code> or route them through an API that
              resolves the latest feed endpoint.
            </p>
          </article>
          <article className="info-card">
            <h3>Historical bucket</h3>
            <p>
              Replace the mocked object list with an endpoint that lists S3 objects, generates signed URLs, or
              returns CloudFront-backed paths.
            </p>
          </article>
          <article className="info-card">
            <h3>Pi controls</h3>
            <p>
              The talkback, light toggle, and snapshot buttons are UI stubs. Connect them to Lambda, API Gateway,
              MQTT, or direct device control later.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
