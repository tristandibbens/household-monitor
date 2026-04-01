import LiveKinesisViewer from "../components/LiveKinesisViewer";

export default function LiveViewPage() {
  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Household Monitor</h1>
      <p>Viewing live Raspberry Pi camera feed from Kinesis Video Streams WebRTC.</p>
      <LiveKinesisViewer />
    </main>
  );
}