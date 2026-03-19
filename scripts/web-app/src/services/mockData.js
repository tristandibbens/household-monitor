export const cameraFeeds = [
  {
    id: 'front-door',
    name: 'Front Door',
    location: 'Entrance',
    status: 'Online',
    streamUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/live/front-door/latest.jpg',
    thumbnailUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/live/front-door/latest.jpg',
    historyPrefix: 's3://YOUR_HISTORY_BUCKET/front-door/',
    description: 'Primary view of the driveway and front entrance.',
  },
  {
    id: 'garden',
    name: 'Garden',
    location: 'Back Garden',
    status: 'Online',
    streamUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/live/garden/latest.jpg',
    thumbnailUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/live/garden/latest.jpg',
    historyPrefix: 's3://YOUR_HISTORY_BUCKET/garden/',
    description: 'Rear garden with patio coverage.',
  },
  {
    id: 'garage',
    name: 'Garage',
    location: 'Side Access',
    status: 'Maintenance',
    streamUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/live/garage/latest.jpg',
    thumbnailUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/live/garage/latest.jpg',
    historyPrefix: 's3://YOUR_HISTORY_BUCKET/garage/',
    description: 'Side access and garage entry.',
  },
];

export const historySamples = [
  {
    cameraId: 'front-door',
    id: 'front-door-2026-03-07-080000',
    timestamp: '2026-03-07T08:00:00Z',
    objectKey: 'front-door/2026/03/07/080000.jpg',
    previewUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/history/front-door/2026/03/07/080000.jpg',
  },
  {
    cameraId: 'front-door',
    id: 'front-door-2026-03-07-081500',
    timestamp: '2026-03-07T08:15:00Z',
    objectKey: 'front-door/2026/03/07/081500.jpg',
    previewUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/history/front-door/2026/03/07/081500.jpg',
  },
  {
    cameraId: 'garden',
    id: 'garden-2026-03-07-073000',
    timestamp: '2026-03-07T07:30:00Z',
    objectKey: 'garden/2026/03/07/073000.jpg',
    previewUrl: 'https://YOUR_CLOUDFRONT_DOMAIN/history/garden/2026/03/07/073000.jpg',
  },
];

export const actionStubs = [
  {
    id: 'talkback',
    label: 'Talk through camera',
    description: 'Placeholder for Pi audio / speaker integration.',
  },
  {
    id: 'light-toggle',
    label: 'Switch light on',
    description: 'Placeholder for GPIO / smart relay action.',
  },
  {
    id: 'snapshot',
    label: 'Capture snapshot',
    description: 'Placeholder for forcing an image capture to S3.',
  },
];
