import { useEffect, useRef, useState } from "react";
import {
  KinesisVideoClient,
  DescribeSignalingChannelCommand,
  GetSignalingChannelEndpointCommand,
} from "@aws-sdk/client-kinesis-video";
import {
  KinesisVideoSignalingClient,
  GetIceServerConfigCommand,
} from "@aws-sdk/client-kinesis-video-signaling";
import { awsConfig, validateAwsConfig } from "../lib/awsConfig";

export default function LiveKinesisViewer() {
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingClientRef = useRef(null);
  const viewerClientIdRef = useRef(`viewer-${crypto.randomUUID()}`);
  const pendingIceCandidatesRef = useRef([]);
  const signalingOpenRef = useRef(false);
  const componentActiveRef = useRef(true);

  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    componentActiveRef.current = true;

    async function startViewer() {
      try {
        const { SignalingClient, Role } = window.KVSWebRTC || {};
        const viewerClientId = viewerClientIdRef.current;
        if (!SignalingClient || !Role) {
          throw new Error("KVS WebRTC browser SDK not loaded.");
        }

        const missing = validateAwsConfig();
        if (missing.length) {
          setError(`Missing env vars: ${missing.join(", ")}`);
          setStatus("Configuration error");
          return;
        }

        setStatus("Loading signaling channel...");

        const credentials = {
          accessKeyId: awsConfig.credentials.accessKeyId,
          secretAccessKey: awsConfig.credentials.secretAccessKey,
          sessionToken: awsConfig.credentials.sessionToken || undefined,
        };

        const kvClient = new KinesisVideoClient({
          region: awsConfig.region,
          credentials,
        });

        const describeResp = await kvClient.send(
          new DescribeSignalingChannelCommand({
            ChannelName: awsConfig.channelName,
          })
        );

        const channelARN = describeResp?.ChannelInfo?.ChannelARN;
        if (!channelARN) {
          throw new Error("Could not resolve ChannelARN from signaling channel.");
        }

        setStatus("Fetching channel endpoints...");

        const endpointResp = await kvClient.send(
          new GetSignalingChannelEndpointCommand({
            ChannelARN: channelARN,
            SingleMasterChannelEndpointConfiguration: {
              Protocols: ["WSS", "HTTPS"],
              Role: Role.VIEWER,
            },
          })
        );

        const endpointsByProtocol = {};
        for (const endpoint of endpointResp.ResourceEndpointList || []) {
          endpointsByProtocol[endpoint.Protocol] = endpoint.ResourceEndpoint;
        }

        if (!endpointsByProtocol.WSS || !endpointsByProtocol.HTTPS) {
          throw new Error("Missing WSS or HTTPS signaling channel endpoints.");
        }

        setStatus("Fetching ICE server config...");

        const signalingChannelsClient = new KinesisVideoSignalingClient({
          region: awsConfig.region,
          credentials,
          endpoint: endpointsByProtocol.HTTPS,
        });

        const iceResp = await signalingChannelsClient.send(
          new GetIceServerConfigCommand({
            ChannelARN: channelARN,
            ClientId: viewerClientId,
          })
        );

        const iceServers = [
          {
            urls: `stun:stun.kinesisvideo.${awsConfig.region}.amazonaws.com:443`,
          },
          ...(iceResp.IceServerList || []).map((iceServer) => ({
            urls: iceServer.Uris,
            username: iceServer.Username,
            credential: iceServer.Password,
          })),
        ];

        setStatus("Opening signaling connection...");

        const signalingClient = new SignalingClient({
          channelARN,
          channelEndpoint: endpointsByProtocol.WSS,
          role: Role.VIEWER,
          clientId: viewerClientId,
          region: awsConfig.region,
          credentials,
          systemClockOffset: 0,
        });

        signalingClientRef.current = signalingClient;

        const safeSendIceCandidate = (candidate) => {
          if (!candidate || !componentActiveRef.current) return;

          if (!signalingOpenRef.current) {
            pendingIceCandidatesRef.current.push(candidate);
            return;
          }

          try {
            signalingClient.sendIceCandidate(candidate);
          } catch (err) {
            console.warn("ICE send failed, re-queueing candidate:", err);
            pendingIceCandidatesRef.current.push(candidate);
            signalingOpenRef.current = false;
          }
        };

        const peerConnection = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = peerConnection;

        peerConnection.ontrack = (event) => {
          if (!mounted || !videoRef.current) return;
          videoRef.current.srcObject = event.streams[0];
          setStatus("Live");
        };

        peerConnection.onicecandidate = ({ candidate }) => {
          safeSendIceCandidate(candidate);
        };

        signalingClient.on("open", async () => {
          try {
            signalingOpenRef.current = true;
            setStatus("Creating WebRTC offer...");

            const offer = await peerConnection.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });

            await peerConnection.setLocalDescription(offer);
            signalingClient.sendSdpOffer(peerConnection.localDescription);

            const queuedCandidates = [...pendingIceCandidatesRef.current];
            pendingIceCandidatesRef.current = [];

            for (const candidate of queuedCandidates) {
              safeSendIceCandidate(candidate);
            }
          } catch (err) {
            console.error("Error during signaling open flow:", err);
            if (mounted) {
              setError(err?.message || "Failed during offer/ICE exchange");
              setStatus("Error");
            }
          }
        });

        signalingClient.on("sdpAnswer", async (answer) => {
          await peerConnection.setRemoteDescription(answer);
        });

        signalingClient.on("iceCandidate", async (candidate) => {
          try {
            await peerConnection.addIceCandidate(candidate);
          } catch (err) {
            console.error("Failed to add remote ICE candidate:", err);
          }
        });

        signalingClient.on("close", () => {
          signalingOpenRef.current = false;
          if (mounted) setStatus("Disconnected");
        });

        signalingClient.on("error", (err) => {
          console.error("Signaling error:", err);
          if (mounted) {
            setError(err?.message || "Unknown signaling error");
            setStatus("Error");
          }
        });

        signalingClient.open();
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err?.message || String(err));
          setStatus("Failed");
        }
      }
    }

    startViewer();

    return () => {
        mounted = false;
        componentActiveRef.current = false;
        signalingOpenRef.current = false;
        pendingIceCandidatesRef.current = [];

      try {
        signalingClientRef.current?.close();
      } catch {}

      try {
        peerConnectionRef.current?.close();
      } catch {}
    };
  }, []);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h2>Live Camera Feed</h2>
        <p><strong>Status:</strong> {status}</p>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "#000",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}