export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION,
  channelName: import.meta.env.VITE_KVS_CHANNEL_NAME,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
  },
};

export function validateAwsConfig() {
  const missing = [];

  if (!awsConfig.region) missing.push("VITE_AWS_REGION");
  if (!awsConfig.channelName) missing.push("VITE_KVS_CHANNEL_NAME");
  if (!awsConfig.credentials.accessKeyId) missing.push("VITE_AWS_ACCESS_KEY_ID");
  if (!awsConfig.credentials.secretAccessKey) missing.push("VITE_AWS_SECRET_ACCESS_KEY");

  return missing;
}